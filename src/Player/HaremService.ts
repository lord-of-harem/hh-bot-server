import { PlayerService, Status } from './PlayerService';
import Game from '../Game';
import { EventEmitter } from 'events';

export default class HaremService extends PlayerService
{
    private girlsMoney: Map<number, number>;

    constructor(private game: Game, private event: EventEmitter) {
        super();

        this.girlsMoney = new Map();

        this.event.on('drop:girl', () => {
            if ( this.status() === Status.Started ) {
                this.restart();
            }
        });
    }

    start() {
        this.currentStatus = Status.Started;

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

        this.currentStatus = Status.Stopped;
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
