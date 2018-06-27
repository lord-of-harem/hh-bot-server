import {PlayerService} from "./PlayerService";
import Player from "../Player";
import {Battle, PlayerDay} from "../models/PlayerDay";

export abstract class BattleService extends PlayerService
{
    protected constructor(protected player: Player) {
        super();
    }

    protected async saveBattle(context: string, battle) {
        const day: PlayerDay = await this.player.getCurrentDay();
        const data: Battle = day[context];
        data.nbBattle++;
        data.xp         += battle.xp;
        data.money      += battle.money;
        data.mojo       += battle.mojo;
        data.reward     = data.reward.concat(battle.reward);

        if ( battle.end.winner !== 1 ) {
            data.nbBattleLoose++;
        }

        try {
            await this.player.db.put(day);
        }
        catch (e) {
            return this.saveBattle(context, battle);
        }
    }
}
