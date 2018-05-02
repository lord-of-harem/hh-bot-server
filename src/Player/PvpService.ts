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

    start(): Promise<any> {
        return this.game.getPvpOpponents()
            .then(arena => {
                for ( let opponent of arena.opponents ) {
                    if ( opponent.enable ) {
                        this.fight(opponent)
                            .catch(console.error);
                    }
                }

                this.pvp = setTimeout(() => this.restart(), arena.timeout * 1000);
                this.currentStatus = Status.Started;
            })
        ;
    }

    stop() {
        clearTimeout(this.pvp);
        this.currentStatus = Status.Stopped;
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
