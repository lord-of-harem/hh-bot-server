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

const host = 'https://www.hentaiheroes.com';
const hostUrl = url.parse(host);

const agent = new SocksProxyAgent('socks://127.0.0.1:8888');

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
                agent: agent,
                jar: this.jar,
            })
            .then(() => request({
                method: 'POST',
                uri: `${host}/phoenix-ajax.php`,
                agent: agent,
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
                    agent: agent,
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
            agent: agent,
            jar: this.jar,
        });
    }

    /**
     * Récupère la liste des filles dans le harem du joueur
     */
    public getHarem(): Promise<Array<GirlHarem>> {
        return request({
                uri: `${host}/harem.html`,
                agent: agent,
                jar: this.jar,
            })
            .then(res => {
                const $ = cheerio.load(res);
                const data: any = {};

                function Girl(girl) {
                    return girl;
                }

                const script = new Script(Girl.toString() + $('body script').get()[0].children[0].data);
                script.runInNewContext(data);

                return Object.keys(data.girls).map(key => Object.assign(data.girls[key], {id: key}));
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
                agent: agent,
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
    public getQuests(): Promise<Array<Quest>> {
        return request({
                method: 'GET',
                uri: `${host}/activities.html?tab=missions`,
                agent: agent,
                jar: this.jar,
            })
            .then(res => {
                const $ = cheerio.load(res);
                const quests: Array<Quest> = [];

                $(`.missions_wrap .mission_object`).each((index, elt) => {
                    const quest = JSON.parse($(elt).attr('data-d'));

                    quest.duration = parseInt(quest.duration, 10);
                    quest.cost = parseInt(quest.cost, 10);
                    quest.id_member_mission = parseInt(quest.id_member_mission, 10);
                    quest.id_mission = parseInt(quest.id_mission, 10);
                    quest.remaining_time = quest.remaining_time === null ? null : parseInt(quest.remaining_time, 10);

                    quests.push(quest);
                });

                quests.sort((a, b) => {
                    if ( a.duration > b.duration ) return 1;
                    if ( a.duration < b.duration ) return -1;

                    return 0;
                });

                return quests;
            });
    }

    /**
     * Lance une mission
     */
    public launchQuest(quest: Quest) {
        return request({
                method: 'POST',
                uri: `${host}/ajax.php`,
                agent: agent,
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
                agent: agent,
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

                function $($data) {
                    if ( typeof $data === "function" ) {
                        $data();
                    }

                    return {on: function() {}, name: $data};
                }

                function dec_timer(elt, time) {
                    timer[elt.name] = time;
                }

                const script = new Script($.toString()
                    + dec_timer.toString()
                    + 'var reload; var timer = {};'
                    + $res('body script').get()[2].children[0].data);
                script.runInNewContext(data);

                arena.timeout = data.timer['.arena_refresh_counter [rel="count"]'];

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
                agent: agent,
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
                agent: agent,
                jar: this.jar,
                form: {
                    class: 'Battle',
                    action: 'fight',
                    who: who,
                },
                json: true,
            }))
        ;
    }

    // boss
}
