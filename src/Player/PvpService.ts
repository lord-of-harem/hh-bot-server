import { PlayerService } from './PlayerService';
import Game from '../Game';
import { Opponent } from '../models/Opponent';

export default class PvpService extends PlayerService
{
    private pvp = null;

    constructor(private game: Game) {
        super();
    }

    start(): Promise<any> {
        return this.game.getPvpOpponents()
            .then(arena => {
                for ( let opponent of arena.opponents ) {
                    if ( opponent.enable ) {
                        this.fight(opponent)
                            .catch(console.error);
                    }
                }

                this.pvp = setTimeout(() => this.start(), arena.timeout * 1000);
            })
        ;
    }

    stop() {
        clearTimeout(this.pvp);
    }

    /**
     * Lance un combat contre un adversaire
     */
    private fight(opponent: Opponent) {
        console.log('fight');

        return this.game.fight(opponent)
            .catch(console.error);
    }
}
