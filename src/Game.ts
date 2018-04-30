import request from 'request-promise-native';
import tough from 'tough-cookie';
import cheerio from 'cheerio';
import * as url from 'url';

const host = 'https://www.hentaiheroes.com';
const hostUrl = url.parse(host);

export default class Game {
    private jar;

    constructor() {
        this.jar = request.jar;
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
                uri: `${host}/home.htmlphoenix-ajax.php`,
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

    }

    /**
     * Récupère l'argent d'une fille
     */
    public getMoney() {

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
