import { PlayerService } from './PlayerService';
import Game from '../Game';

export default class BossService implements PlayerService
{
    private timeout = null;

    constructor(private game: Game) {}

    start(bossId: number): Promise<any> {
        this.game
            .fightBoss(bossId)
            .then(() => {
                console.log('fight boss');
                return this.start(bossId);
            })
            .catch(() => this.timeout = setTimeout(() => this.start(bossId), 10 * 60000))
        ;

        return Promise.resolve();
    }

    stop() {
        clearTimeout(this.timeout);
    }
}
