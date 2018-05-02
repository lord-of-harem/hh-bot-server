import { PlayerService, Status } from './PlayerService';
import Game from '../Game';
import { EventEmitter } from 'events';

export default class ShopService extends PlayerService
{
    private timeout;
    private interval;

    constructor(private game: Game, private event: EventEmitter) {
        super();
    }

    /**
     *
     * @param {number} checkInterval Nombre de minute après lesquels le service re-check automatiquement le shop
     */
    start(checkInterval: number): Promise<any> {
        this.currentStatus = Status.Started;

        return this.game
            .getShop()
            .then(timeout => {
                console.log('check shop');
                this.timeout = setTimeout(() => this.restart(checkInterval), timeout * 1000);
                this.interval = setTimeout(() => this.restart(checkInterval), checkInterval * 60 * 1000);
            })
        ;
    }

    stop() {
        clearTimeout(this.timeout);
        clearTimeout(this.interval);
        this.currentStatus = Status.Stopped;
    }
}
