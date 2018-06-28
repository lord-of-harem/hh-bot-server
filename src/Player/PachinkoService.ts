import { PlayerService, Status } from './PlayerService';
import Player from "../Player";

export default class PachinkoService extends PlayerService
{
    private timeout;

    constructor(private player: Player) {
        super();
    }

    start(): Promise<any> {
        this.currentStatus = Status.Started;
        this.player.event.emit('pachinko:start');
        this.exec();
        return Promise.resolve();
    }

    stop() {
        clearTimeout(this.timeout);
        this.currentStatus = Status.Stopped;
        this.player.event.emit('pachinko:stop');
    }

    private async exec() {
        try {
            const timeout = await this.player.game.getPachinko();

            if (timeout === 0) {
                const res = await this.player.game.claimRewardPachinko();

                this.player.event.emit('pachinko:freeReward');
                return this.exec();
            }

            else {
                this.timeout = setTimeout(() => this.exec(), timeout * 1000);
            }
        }

        catch (e) {
            console.error(e);
            this.restart();
        }
    }
}
