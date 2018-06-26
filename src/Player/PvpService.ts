import { PlayerService, Status } from './PlayerService';
import { Opponent } from '../models/Opponent';
import Player from "../Player";

export default class PvpService extends PlayerService
{
    private pvp = null;

    constructor(private player: Player) {
        super();
    }

    async start(): Promise<any> {
        this.currentStatus = Status.Started;
        this.player.event.emit('pvp:start');
        this.exec();
    }

    stop() {
        clearTimeout(this.pvp);
        this.currentStatus = Status.Stopped;
        this.player.event.emit('pvp:stop');
    }

    private async exec() {
        try {
            const arena = await this.player.game.getPvpOpponents();

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
            await this.player.game.fight(opponent);
            this.player.event.emit('pvp:fight');
        }

        catch (e) {
            console.error(e);
        }
    }
}
