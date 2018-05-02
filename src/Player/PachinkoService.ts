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

        return this.game.getPachinko()
            .then(timeout => {
                if ( timeout === 0 ) {
                    this.game
                        .claimRewardPachinko()
                        .then(res => this.restart())
                    ;
                }

                else {
                    this.timeout = setTimeout(() => this.restart(), timeout * 1000);
                }
            });
    }

    stop() {
        clearTimeout(this.timeout);
        this.currentStatus = Status.Stopped;
    }
}