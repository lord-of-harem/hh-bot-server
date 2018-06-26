import { PlayerService, Status } from './PlayerService';
import Game from '../Game';
import { Opponent } from '../models/Opponent';
import { EventEmitter } from 'events';

export default class PvpService extends PlayerService
{
    private pvp = null;

    constructor(private game: Game, private event: EventEmitter) {
        super();
    }

    async start(): Promise<any> {
        this.currentStatus = Status.Started;
        this.event.emit('pvp:start');
        this.exec();
    }

    stop() {
        clearTimeout(this.pvp);
        this.currentStatus = Status.Stopped;
        this.event.emit('pvp:stop');
    }

    private async exec() {
        try {
            const arena = await this.game.getPvpOpponents();

            for (let opponent of arena.opponents) {
                if (opponent.enable) {
                    await this.fight(opponent);
                }
            }

            this.pvp = setTimeout(() => this.exec(), arena.timeout * 1000);
        }

        catch(e) {
            console.error(e);
            this.restart();
        }
    }

    /**
     * Lance un combat contre un adversaire
     */
    private async fight(opponent: Opponent) {
        try {
            await this.game.fight(opponent);
            this.event.emit('pvp:fight');
        }

        catch (e) {
            console.error(e);
        }
    }
}
