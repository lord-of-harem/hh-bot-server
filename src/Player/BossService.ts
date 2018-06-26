import { PlayerService, Status } from './PlayerService';
import Game from '../Game';
import { EventEmitter } from 'events';

export default class BossService extends PlayerService
{
    private timeout = null;
    private bossId: number;

    constructor(private game: Game, private event: EventEmitter) {
        super();
    }

    start(bossId: number): Promise<any> {
        this.bossId = bossId;
        this.currentStatus = Status.Started;
        this.event.emit('boss:start');
        this.exec();
        return Promise.resolve();
    }

    stop() {
        clearTimeout(this.timeout);
        this.currentStatus = Status.Stopped;
        this.event.emit('boss:stop');
    }

    private async exec() {
        try {
            const res = await this.game.fightBoss(this.bossId);

            for (let drop of res.drops) {
                if (drop.type === 'girl') {
                    this.event.emit('boss:dropGirl', drop);
                }
            }

            this.event.emit('boss:fight', this.bossId);
            return this.exec();
        }

        catch (e) {
            this.timeout = setTimeout(() => this.exec(), 10 * 60000)
        }
    }
}
