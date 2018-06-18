import * as request from 'request-promise-native';
import * as tough from 'tough-cookie';
import * as cheerio from 'cheerio';
import * as url from 'url';
import * as querystring from 'querystring';
import * as SocksProxyAgent from 'socks-proxy-agent';
import { Script } from 'vm';
import { Quest } from './models/Quest';
import { Salary } from './models/Salary';
import { GirlHarem } from './models/GirlHarem';
import { Opponent } from './models/Opponent';
import { Arena } from './models/Arena';
import { Contest } from './models/Contest';

const host = 'https://www.hentaiheroes.com';
const hostUrl = url.parse(host);


export default class Game {
    private jar;

    constructor() {
        this.jar = request.jar();
        this.jar.setCookie(new tough.Cookie({
            key: 'age_verification',
            value: '1',
            domain: hostUrl.host,
            maxAge: 31536000,
        }), host);
    }

    /**
     * Authentifie l'utilisateur auprès du jeu
     */
    public login(username: string, password: string) {
        return request({
            uri: `${host}/home.html`,
            jar: this.jar,
        })
            .then(() => request({
                method: 'POST',
                uri: `${host}/phoenix-ajax.php`,
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
            }))
            .then(response => {
                if ( !response.success ) {
                    throw new Error("Login error\n" + response.error);
                }

                return request({
                    uri: `${host}/home.html`,
                    jar: this.jar,
                });
            })
        ;
    }

    /**
     * Déconnecte l'utilisateur aurprès du jeu
     */
    public logout() {
        return request({
            uri: `${host}/intro.php?phoenix_member=logout`,
            jar: this.jar,
        });
    }

    /**
     * Récupère la liste des filles dans le harem du joueur
     */
    public getHarem(): Promise<Array<GirlHarem>> {
        return request({
            uri: `${host}/harem.html`,
            jar: this.jar,
        })
            .then(res => {
                const $ = cheerio.load(res);
                const data: any = {};

                try {
                    function Girl(girl) {
                        return girl;
                    }

                    const script = new Script(Girl.toString() + $('body script').get()[0].children[0].data);
                    script.runInNewContext(data);
                } catch (e) {
                    throw new Error(e);
                }

                const girls = Object.keys(data.girlsDataList).map(key => Object.assign(data.girlsDataList[key], {id: key}))
                return girls.filter(girl => girl.hasOwnProperty('pay_time'));
            })
        ;
    }

    /**
     * Récupère l'argent d'une fille
     */
    public getMoney(girl: number): Promise<Salary> {
        return request({
            method: 'POST',
            uri: `${host}/ajax.php`,
            jar: this.jar,
            form: {
                class: 'Girl',
                who: girl,
                action: 'get_salary',
            },
            json: true,
        })
            .then((res): Salary => {
                if ( !res.success ) {
                    throw new Error();
                }

                return res;
            });
    }

    /**
     * Récupère la liste des missions du joueur
     */
    public getQuests(): Promise<Contest> {
        return request({
            method: 'GET',
            uri: `${host}/activities.html?tab=missions`,
            jar: this.jar,
        })
            .then(res => {
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
                    throw new Error(e);
                }

                return contest;
            });
    }

    /**
     * Lance une mission
     */
    public launchQuest(quest: Quest) {
        return request({
            method: 'POST',
            uri: `${host}/ajax.php`,
            jar: this.jar,
            form: {
                class: 'Missions',
                action: 'start_mission',
                id_mission: quest.id_mission,
                id_member_mission: quest.id_member_mission,
            },
            json: true,
        })
            .then(res => {
                if ( !res.success ) {
                    throw new Error();
                }

                return res;
            });
    }

    /**
     * Récupère la liste des combattants
     */
    public getPvpOpponents(): Promise<Arena> {
        return request({
            method: 'GET',
            uri: `${host}/arena.html`,
            jar: this.jar,
        })
            .then(res => {
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
                let timer: any;
                let ti: any;

                function $($data) {
                    if ( typeof $data === "function" ) {
                        $data();
                    }

                    return {on: function() {}, name: $data};
                }

                function dec_timer(elt, time) {
                    timer[elt.name] = time;
                }

                function initDecTimer(a, timer) {
                    //ti = timer;
                }

                /*try {
                    const script = new Script($.toString()
                        + dec_timer.toString()
                        + 'var reload; var timer = {};'
                        + 'var ti'
                        + 'var HHTimers = {initDecTimer: function(){}}};'
                        + $res('body script').get()[2].children[0].data);
                    script.runInNewContext(data);

                    arena.timeout = data.timer['.arena_refresh_counter [rel="count"]'];
                    arena.timeout = 20 * 60 * 1000;
                } catch (e) {
                    throw new Error(e);
                }*/
                arena.timeout = 5 * 60;
                return arena;
            });
    }

    /**
     * Lance un combat contre un autre joueur
     */
    public fight(opponent: Opponent) {
        return request({
            method: 'GET',
            uri: `${host}/battle.html?id_arena=${opponent.id_arena}`,
            jar: this.jar,
        })
            .then(res => {
                const $ = cheerio.load(res);
                const data: any = {};

                const script = new Script($('body script').get()[2].children[0].data);
                script.runInNewContext(data);

                return data.hh_battle_players[1];
            })
            .then(who => request({
                method: 'POST',
                uri: `${host}/ajax.php`,
                jar: this.jar,
                form: {
                    class: 'Battle',
                    action: 'fight',
                    who: who,
                },
                json: true,
            }))
            .then(res => {
                if ( !res.success ) {
                    throw new Error();
                }

                return res;
            })
        ;
    }

    /**
     * Lance un combat contre un boss
     */
    public fightBoss(bossId: number) {
        return request({
            method: 'POST',
            uri: `${host}/ajax.php`,
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
        })
            .then(res => {
                if ( !res.success ) {
                    throw new Error();
                }

                res.drops = [];
                const $ = cheerio.load('<div>' + res.end.drops + '</div>');

                $('.slot').each((index, drop) => {
                    const $drop = $(drop);

                    if ( $drop.hasClass('girl-slot') ) {
                        res.drops.push({
                            type: 'girl',
                            id: parseInt($.find('img').attr('src').split('/')[3]),
                            name: $.find('.title2 h1:first').text(),
                        });
                    }
                });

                return res;
            })
        ;
    }

    /**
     * Renvoie le temps avant que le marché puisse être renouvellé
     */
    public getShop(): Promise<number> {
        return request({
            uri: `${host}/shop.html`,
            jar: this.jar,
        })
            .then(res => {
                const $ = cheerio.load(res);

                return parseInt($(`#shop .shop_count span`).attr('time'), 10);
            })
        ;
    }

    /**
     * Renvoie le temps avant que le pachinko gratuit soie jouable
     */
    public getPachinko(): Promise<number> {
        return request({
            uri: `${host}/pachinko.html`,
            jar: this.jar,
        })
            .then(res => {
                const $ = cheerio.load(res);
                const data: any = {};

                try {
                    function ph_tooltip() {}

                    const script = new Script(ph_tooltip.toString() + 'var window = {};' + $('body script').get()[0].children[0].data);
                    script.runInNewContext(data);
                } catch (e) {
                    throw new Error(e);
                }

                return data.pachinko_var.next_game;
            })
        ;
    }

    /**
     * Récupère la récompense gratuite au pachinko
     */
    public claimRewardPachinko(): Promise<any> {
        return request({
            method: 'POST',
            uri: `${host}/ajax.php`,
            jar: this.jar,
            form: {
                class: 'Pachinko',
                action: 'play',
                what: 'pachinko0',
                how_many: 1,
            },
            json: true,
        })
            .then(res => {
                if ( !res.success ) {
                    throw new Error();
                }

                return res;
            })
        ;
    }
}
