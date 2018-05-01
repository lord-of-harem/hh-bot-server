import Game from './Game';
import { PlayerService } from './Player/PlayerService';
import HaremService from './Player/HaremService';
import QuestService from './Player/QuestService';
import PvpService from './Player/PvpService';
import BossService from './Player/BossService';

export enum Command {Start, Stop}
export enum Service {Harem, Quest, Pvp, Boss}

export default class Player
{
    private game: Game;
    private isLogged = false;
    private services: Map<number, PlayerService> = new Map();

    constructor(private username: string, private password: string) {
        this.game = new Game();

        this.services.set(Service.Harem, new HaremService(this.game));
        this.services.set(Service.Quest, new QuestService(this.game));
        this.services.set(Service.Pvp, new PvpService(this.game));
        this.services.set(Service.Boss, new BossService(this.game));
    }

    public updateService(service: Service, command: Command, ...args) {
        if ( command === Command.Start ) {
            this.login()
                .then(() => this.services.get(service).start(...args))
                .catch(console.error)
            ;
        }

        else if ( command === Command.Stop ) {
            this.services.get(service).stop();
        }

        return this;
    }

    /**
     * Authentifie le joueur si nécéssaire
     */
    private login() {
        if ( this.isLogged ) {
            return Promise.resolve();
        }

        return this.game.login(this.username, this.password);
    }

}
