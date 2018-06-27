import { Status } from './PlayerService';
import { Opponent } from '../models/Opponent';
import Player from "../Player";
import {BattleService} from "./BattleService";

export default class PvpService extends BattleService
{
    private pvp = null;

    constructor(player: Player) {
        super(player);

        this.player.event
            .on('pvp:fight', battle => this.saveBattle('pvp', battle))
        ;
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
            const res = await this.player.game.fight(opponent);
            this.player.event.emit('pvp:fight', res);
        }

        catch (e) {
            console.error(e);
        }
    }
}
