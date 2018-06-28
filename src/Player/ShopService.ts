import { PlayerService, Status } from './PlayerService';
import Player from "../Player";

export default class ShopService extends PlayerService
{
    private timeout;
    private interval;

    constructor(private player: Player) {
        super();
    }

    /**
     *
     * @param {number} checkInterval Nombre de minute après lesquels le service re-check automatiquement le shop
     */
    start(checkInterval: number): Promise<any> {
        this.currentStatus = Status.Started;

        return this.player.game
            .getShop()
            .then(timeout => {
                this.player.event.emit('shop:start');
                this.player.event.emit('shop:check');
                this.timeout = setTimeout(() => this.restart(checkInterval), timeout * 1000);
                this.interval = setTimeout(() => this.restart(checkInterval), checkInterval * 60 * 1000);
            })
        ;
    }

    stop() {
        clearTimeout(this.timeout);
        clearTimeout(this.interval);
        this.currentStatus = Status.Stopped;
        this.player.event.emit('shop:stop');
    }
}
