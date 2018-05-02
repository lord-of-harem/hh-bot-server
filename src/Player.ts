import Game from './Game';
import { PlayerServiceInterface } from './Player/PlayerService';
import HaremService from './Player/HaremService';
import QuestService from './Player/QuestService';
import PvpService from './Player/PvpService';
import BossService from './Player/BossService';
import ShopService from './Player/ShopService';
import { EventEmitter } from 'events';

export enum Command {Start, Stop, Restart}
export enum Service {Harem, Quest, Pvp, Boss, Shop}

export default class Player
{
    private game: Game;
    private isLogged = false;
    private services: Map<number, PlayerServiceInterface> = new Map();
    private event: EventEmitter;

    constructor(private username: string, private password: string) {
        this.game = new Game();
        this.event = new EventEmitter();
        this.initEventService();

        this.services.set(Service.Harem, new HaremService(this.game, this.event));
        this.services.set(Service.Quest, new QuestService(this.game, this.event));
        this.services.set(Service.Pvp, new PvpService(this.game, this.event));
        this.services.set(Service.Boss, new BossService(this.game, this.event));
        this.services.set(Service.Shop, new ShopService(this.game, this.event));
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

        else if ( command === Command.Restart ) {
            this.services.get(service).restart(...args);
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

    private initEventService() {
        this.event
            .on('drop:girl', () => {})
        ;
    }
}
