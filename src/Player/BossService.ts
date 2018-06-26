import { PlayerService, Status } from './PlayerService';
import Game from '../Game';
import { EventEmitter } from 'events';

export default class BossService extends PlayerService
{
    private timeout = null;

    constructor(private game: Game, private event: EventEmitter) {
        super();
    }

    start(bossId: number): Promise<any> {
        this.game
            .fightBoss(bossId)
            .then(res => {
                for ( let drop of res.drops ) {
                    if ( drop.type === 'girl' ) {
                        this.event.emit('boss:dropGirl', drop);
                    }
                }

                this.event.emit('boss:fight', bossId);
                return this.start(bossId);
            })
            .catch(() => this.timeout = setTimeout(() => this.restart(bossId), 10 * 60000))
        ;

        this.currentStatus = Status.Started;
        this.event.emit('boss:start');
        return Promise.resolve();
    }

    stop() {
        clearTimeout(this.timeout);
        this.currentStatus = Status.Stopped;
        this.event.emit('boss:stop');
    }
}
