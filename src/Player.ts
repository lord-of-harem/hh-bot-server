import Game from './Game';

export default class Player
{
    private game: Game;
    private username: string;
    private password: string;
    private isLogged = false;
    private girlsMoney: Map<number, number>;

    constructor(username: string, password: string) {
        this.game = new Game();
        this.username = username;
        this.password = password;
        this.girlsMoney = new Map();
    }

    public runHarem() {
        return this.login()
            .then(() => this.harem())
        ;
    }

    public stopHarem() {

    }

    private login() {
        if ( this.isLogged ) {
            return Promise.resolve();
        }

        return this.game.login(this.username, this.password);
    }

    private harem() {
        return this.game
            .getHarem()
            .then(girls =>
                girls.forEach(girl => this.getMoney(girl.id, girl.pay_in * 1000))
            )
        ;
    }

    private getMoney(girlId, timeout) {
        this.girlsMoney.set(girlId, setTimeout(() =>
                this.game.getMoney(girlId)
                    .then(res => this.getMoney(girlId, res.time * 1000))
                    .then(() => console.log('fetch money'))
                    .catch(console.error)
            , timeout));
    }
}
