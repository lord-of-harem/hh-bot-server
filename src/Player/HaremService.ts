import { PlayerService, Status } from './PlayerService';
import Player from '../Player';

export default class HaremService extends PlayerService
{
    private girlsMoney: Map<number, number>;

    constructor(private player: Player) {
        super();

        this.girlsMoney = new Map();

        this.player.event
            .on('boss:dropGirl', () => {
                if ( this.status() === Status.Started ) {
                    this.restart();
                }
            })
        ;
    }

    start() {
        this.currentStatus = Status.Started;

        return this.player.game
            .getHarem()
            .then(girls =>
                girls.forEach(girl => this.getMoney(girl.id, girl.pay_in * 1000))
            )
            .then(() => this.player.event.emit('harem:start'))
        ;
    }

    stop() {
        for ( const timeout of this.girlsMoney.values() ) {
            clearTimeout(timeout);
        }

        this.currentStatus = Status.Stopped;
        this.player.event.emit('harem:stop');
    }

    /**
     * Récupère l'argent d'une fille
     * @param girlId
     * @param timeout
     */
    private getMoney(girlId: number, timeout) {
        this.girlsMoney.set(girlId, setTimeout(() => {
            this.player.game.getMoney(girlId)
                .then(salary => {
                    this.getMoney(girlId, salary.time * 1000);
                    this.player.event.emit('harem:getMoney', girlId, salary.money);
                })
                .catch(e => {
                    this.getMoney(girlId, 30 * 60 * 1000);
                    console.error(e);
                })
        }, timeout));
    }
}
