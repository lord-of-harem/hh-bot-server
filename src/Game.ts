import * as request from 'request-promise-native';
import * as cheerio from 'cheerio';
import * as url from 'url';
import * as querystring from 'querystring';
import { Script } from 'vm';
import { Mission } from './models/Mission';
import { Salary } from './models/Salary';
import { GirlHarem } from './models/GirlHarem';
import { Opponent } from './models/Opponent';
import { Arena } from './models/Arena';
import { Contest } from './models/Contest';

export default class Game {
    private jar;

    constructor(private host) {
        let cookie = `Cookie="age_verification=1;`
            +` Max-Age=31536000;`
            +` Domain=${url.parse(this.host).host};`
            +` hostOnly=?;`
            +` aAge=?; `
            +`cAge=1ms"`;

        this.jar = request.jar();
        this.jar.setCookie(cookie, this.host);
    }

    /**
     * Authentifie l'utilisateur auprès du jeu
     */
    public async login(username: string, password: string): Promise<any> {
        await request({
            uri: `${this.host}/home.html`,
            jar: this.jar,
        });

        let res = await request({
                method: 'POST',
                uri: `${this.host}/phoenix-ajax.php`,
                jar: this.jar,
                form: {
                    login: username,
                    password: password,
                    stay_online: 1,
                    module: 'Member',
                    action: 'form_log_in',
                    call: 'Member',
                },
                json: true,
            });

        if ( !res.success ) {
            return Promise.reject("Login error\n" + res.error);
        }

        return request({
            uri: `${this.host}/home.html`,
            jar: this.jar,
        });
    }

    /**
     * Déconnecte l'utilisateur aurprès du jeu
     */
    public logout() {
        return request({
            uri: `${this.host}/intro.php?phoenix_member=logout`,
            jar: this.jar,
        });
    }

    /**
     * Récupère la liste des filles dans le harem du joueur
     */
    public async getHarem(): Promise<Array<GirlHarem>> {
        let res = await request({
            uri: `${this.host}/harem.html`,
            jar: this.jar,
        });

        const $ = cheerio.load(res);
        const data: any = {};

        try {
            function Girl(girl) {
                return girl;
            }

            const script = new Script(Girl.toString() + $('body script').get()[0].children[0].data);
            script.runInNewContext(data);
        } catch (e) {
            return Promise.reject(e);
        }

        const girls = Object.keys(data.girlsDataList)
            .map(key => Object.assign(data.girlsDataList[key], {id: key}));

        return girls.filter(girl => girl.hasOwnProperty('pay_time'));
    }

    /**
     * Récupère l'argent d'une fille
     */
    public async getMoney(girl: number): Promise<Salary> {
        let res = await request({
            method: 'POST',
            uri: `${this.host}/ajax.php`,
            jar: this.jar,
            form: {
                class: 'Girl',
                who: girl,
                action: 'get_salary',
            },
            json: true,
        });

        if ( !res.success ) {
            return Promise.reject(new Error('no money'));
        }

        return res;
    }

    /**
     * Récupère la liste des missions du joueur
     */
    public async getMissions(): Promise<Contest> {
        let res = await request({
            method: 'GET',
            uri: `${this.host}/activities.html?tab=missions`,
            jar: this.jar,
        });

        const $ = cheerio.load(res);
        const contest: Contest = {
            quests: [],
            nextUpdate: 0,
        };

        $(`.missions_wrap .mission_object`).each((index, elt) => {
            const quest = JSON.parse($(elt).attr('data-d'));

            quest.duration = parseInt(quest.duration, 10);
            quest.cost = parseInt(quest.cost, 10);
            quest.id_member_mission = parseInt(quest.id_member_mission, 10);
            quest.id_mission = parseInt(quest.id_mission, 10);
            quest.remaining_time = quest.remaining_time === null ? null : parseInt(quest.remaining_time, 10);

            contest.quests.push(quest);
        });

        contest.quests.sort((a, b) => {
            if ( a.duration > b.duration ) return 1;
            if ( a.duration < b.duration ) return -1;

            return 0;
        });

        try {
            const data: any = {};
            const script = new Script($('body script').get()[0].children[0].data);
            script.runInNewContext(data);

            contest.nextUpdate = data.next_update;
        } catch (e) {
            return Promise.reject(new Error(e));
        }

        return contest;
    }

    /**
     * Lance une mission
     */
    public async launchMission(mission: Mission) {
        let res = await request({
            method: 'POST',
            uri: `${this.host}/ajax.php`,
            jar: this.jar,
            form: {
                class: 'Missions',
                action: 'start_mission',
                id_mission: mission.id_mission,
                id_member_mission: mission.id_member_mission,
            },
            json: true,
        });

        if ( !res.success ) {
            return Promise.reject(new Error('Mission not launched'));
        }

        return res;
    }

    /**
     * Récupère la liste des combattants
     */
    public async getPvpOpponents(): Promise<Arena> {
        let res = await request({
            method: 'GET',
            uri: `${this.host}/arena.html`,
            jar: this.jar,
        });

        const $res = cheerio.load(res);
        const arena: Arena = {
            opponents: [],
            timeout: 0,
        };

        $res(`.one_opponent`).each((index, elt) => {
            const $opponent = $res(elt);
            const opponent: Opponent = {
                enable: !$opponent.hasClass('disabled'),
                lvl: parseInt($opponent.find('.level_target:first-child').text(), 10),
                name: $opponent.find('.name').text().trim(),
                id_arena: parseInt(querystring.parse(url.parse($opponent.attr('href')).query).id_arena)
            };

            arena.opponents.push(opponent);
        });

        const data: any = {};

        function $($data) {
            if ( typeof $data === "function" ) {
                $data();
            }

            return {on: function() {}, name: $data};
        }

        try {
            const script = new Script($.toString()
                + 'var reload; var timer = {}; '
                + 'var HHTimers = {initDecTimer: function(a, time) {timer = time;}}'
                + $res('body script').get()[2].children[0].data);
            script.runInNewContext(data);

            arena.timeout = data.timer;
        } catch (e) {
            console.error(e);

            return new Promise(resolve => {
                setTimeout(() => resolve(this.getPvpOpponents()), 1000);
            }) as Promise<Arena>;
        }

        return arena;
    }

    /**
     * Lance un combat contre un autre joueur
     */
    public async fight(opponent: Opponent) {
        let res = await request({
            method: 'GET',
            uri: `${this.host}/battle.html?id_arena=${opponent.id_arena}`,
            jar: this.jar,
        });

        const $ = cheerio.load(res);
        const data: any = {};

        const script = new Script($('body script').get()[2].children[0].data);
        script.runInNewContext(data);

        res = await request({
            method: 'POST',
            uri: `${this.host}/ajax.php`,
            jar: this.jar,
            form: {
                class: 'Battle',
                action: 'fight',
                who: data.hh_battle_players[1],
            },
            json: true,
        });

        if ( !res.success ) {
            return Promise.reject(new Error('Fight no launched'));
        }

        this.compileFightResult(res);

        return res;
    }

    private compileFightResult(battle) {
        battle.money    = 0;
        battle.xp       = 0;
        battle.mojo     = 0;
        battle.reward   = [];

        if ( battle.end.winner === 1 && battle.end.hasOwnProperty('up2') ) {
            battle.money    = battle.end.up2.hasOwnProperty('soft_currency') ? battle.end.up2.soft_currency : 0;
            battle.xp       = battle.end.up2.hasOwnProperty('xp') ? battle.end.up2.xp : 0;
            battle.mojo     = battle.end.up2.hasOwnProperty('victory_points') ? battle.end.up2.victory_points : 0;

            const $ = cheerio.load('<div>' + battle.end.reward.html + '</div>');

            $('.slot').each(function() {
                if ( $(this).hasClass('slot_xp') || $(this).hasClass('slot_SC') || $(this).hasClass('slot_mojo') || $(this).hasClass('girl-slot') ) {
                    // Rien à faire, c'est du standard
                }

                else if ( $(this).is('[id_item]') ) {
                    battle.reward.push(JSON.parse($(this).attr('data-d')));
                }

                else {
                    battle.reward.push({
                        source: battle.end.reward,
                    });
                }
            });
        }
    }

    /**
     * Lance un combat contre un boss
     */
    public async fightBoss(bossId: number) {
        let res = await request({
            method: 'POST',
            uri: `${this.host}/ajax.php`,
            jar: this.jar,
            form: {
                class: 'Battle',
                action: 'fight',
                who: {
                    id_troll: bossId,
                    orgasm: 0,
                    ego: 0,
                    x: 0,
                    curr_ego: 0,
                    nb_org: 0,
                    figure: 0,
                    id_world: bossId + 1,
                },
            },
            json: true,
        });

        if ( !res.success ) {
            return Promise.reject(new Error('Boss no fighted'));
        }

        res.reward = [];
        const $ = cheerio.load('<div>' + res.end.reward + '</div>');

        $('.slot').each((index, drop) => {
            const $drop = $(drop);

            if ( $drop.hasClass('girl-slot') ) {
                res.reward.push({
                    type: 'girl',
                    id: parseInt($.find('img').attr('src').split('/')[3]),
                    name: $.find('.title2 h1:first').text(),
                });
            }
        });

        return res;
    }

    /**
     * Renvoie le temps avant que le marché puisse être renouvellé
     */
    public async getShop(): Promise<number> {
        let res = await request({
            uri: `${this.host}/shop.html`,
            jar: this.jar,
        });

        const $ = cheerio.load(res);

        return parseInt($(`#shop .shop_count span`).attr('time'), 10);
    }

    /**
     * Renvoie le temps avant que le pachinko gratuit soie jouable
     */
    public async getPachinko(): Promise<number> {
        let res = await request({
            uri: `${this.host}/pachinko.html`,
            jar: this.jar,
        });

        const $ = cheerio.load(res);
        const data: any = {};

        try {
            function ph_tooltip() {}

            const script = new Script(ph_tooltip.toString()
                + 'var window = {};'
                + $('body script').get()[0].children[0].data);
            script.runInNewContext(data);
        } catch (e) {
            return Promise.reject(new Error(e));
        }

        return data.pachinko_var.next_game;
    }

    /**
     * Récupère la récompense gratuite au pachinko
     */
    public async claimRewardPachinko(): Promise<any> {
        let res = await request({
            method: 'POST',
            uri: `${this.host}/ajax.php`,
            jar: this.jar,
            form: {
                class: 'Pachinko',
                action: 'play',
                what: 'pachinko0',
                how_many: 1,
            },
            json: true,
        });

        if ( !res.success ) {
            return Promise.reject(new Error('Reward not claimed'));
        }

        return res;
    }
}
