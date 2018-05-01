import * as request from 'request-promise-native';
import * as tough from 'tough-cookie';
import * as cheerio from 'cheerio';
import * as url from 'url';
import * as SocksProxyAgent from 'socks-proxy-agent';
import { Script } from 'vm';
import { Quest } from './models/Quest';
import { Salary } from './models/Salary';
import { GirlHarem } from './models/GirlHarem';

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
    public getOpponents() {

    }

    /**
     * Lance un combat contre un autre joueur
     */
    public fight() {

    }

    // boss
}
