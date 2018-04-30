import Game from './Game';

export default class Player
{
    private game: Game;
    private girlsMoney: Map<number, number>;

    constructor(username: string, password: string) {
        this.game = new Game();
        this.girlsMoney = new Map();

        this.game
            .login(username, password)
            .then(() => this.harem())
        ;
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
