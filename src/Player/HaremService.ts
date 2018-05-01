import { PlayerService } from './PlayerService';
import Game from '../Game';

export default class HaremService implements PlayerService
{
    private girlsMoney: Map<number, number>;

    constructor(private game: Game) {
        this.girlsMoney = new Map();
    }

    start() {
        return this.game
            .getHarem()
            .then(girls =>
                girls.forEach(girl => this.getMoney(girl.id, girl.pay_in * 1000))
            )
        ;
    }

    stop() {
        for ( const timeout of this.girlsMoney.values() ) {
            clearTimeout(timeout);
        }
    }

    /**
     * Récupère l'argent d'une fille
     * @param girlId
     * @param timeout
     */
    private getMoney(girlId: number, timeout) {
        this.girlsMoney.set(girlId, setTimeout(() => {
            this.game.getMoney(girlId)
                .then(salary => {
                    this.getMoney(girlId, salary.time * 1000);
                    console.log('Girl ID', girlId, 'Salary', salary.money);
                })
                .catch(console.error)
        }, timeout));
    }
}
