import { PlayerService, Status } from './PlayerService';
import Game from '../Game';
import { EventEmitter } from 'events';

export default class PachinkoService extends PlayerService
{
    private timeout;

    constructor(private game: Game, private event: EventEmitter) {
        super();
    }

    start(): Promise<any> {
        this.currentStatus = Status.Started;
        this.event.emit('pachinko:start');
        this.exec();
        return Promise.resolve();
    }

    stop() {
        clearTimeout(this.timeout);
        this.currentStatus = Status.Stopped;
        this.event.emit('pachinko:stop');
    }

    private async exec() {
        try {
            const timeout = await this.game.getPachinko();

            if (timeout === 0) {
                const res = await this.game.claimRewardPachinko();

                this.event.emit('pachinko:freeReward');
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
