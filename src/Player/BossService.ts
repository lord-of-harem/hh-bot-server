import { PlayerService, Status } from './PlayerService';
import Player from '../Player';

export default class BossService extends PlayerService
{
    private timeout = null;
    private bossId: number;

    constructor(private player: Player) {
        super();
    }

    start(bossId: number): Promise<any> {
        this.bossId = bossId;
        this.currentStatus = Status.Started;
        this.player.event.emit('boss:start');
        this.exec();
        return Promise.resolve();
    }

    stop() {
        clearTimeout(this.timeout);
        this.currentStatus = Status.Stopped;
        this.player.event.emit('boss:stop');
    }

    private async exec() {
        try {
            const res = await this.player.game.fightBoss(this.bossId);

            for (let drop of res.drops) {
                if (drop.type === 'girl') {
                    this.player.event.emit('boss:dropGirl', drop);
                }
            }

            this.player.event.emit('boss:fight', this.bossId);
            return this.exec();
        }

        catch (e) {
            this.timeout = setTimeout(() => this.exec(), 10 * 60000)
        }
    }
}
