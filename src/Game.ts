import * as request from 'request-promise-native';
import * as tough from 'tough-cookie';
import * as cheerio from 'cheerio';
import * as url from 'url';
import { Script } from 'vm';

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
    public getHarem() {
        return request({
                uri: `${host}/harem.html`,
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
    public getMoney(girl: number) {
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
            .then(res => {
                if ( !res.success ) {
                    throw new Error();
                }

                return res;
            });
    }

    /**
     * Récupère la liste des missions du joueur
     */
    public getMissions() {

    }

    /**
     * Lance une mission
     */
    public launchMission() {

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
