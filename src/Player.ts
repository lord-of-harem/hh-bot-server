import Game from './Game';
import { PlayerServiceInterface } from './Player/PlayerService';
import HaremService from './Player/HaremService';
import MissionService from './Player/MissionService';
import PvpService from './Player/PvpService';
import BossService from './Player/BossService';
import ShopService from './Player/ShopService';
import { EventEmitter } from 'events';
import PachinkoService from './Player/PachinkoService';

export enum Command {Start, Stop, Restart}
export enum Service {Harem, Mission, Pvp, Boss, Shop, Pachinko}

export default class Player
{
    private game: Game;
    private isLogged = false;
    private services: Map<number, PlayerServiceInterface> = new Map();
    private event: EventEmitter;

    constructor(server: string, private username: string, private password: string) {
        this.game = new Game(server);
        this.event = new EventEmitter();
        this.initEventService();

        this.services.set(Service.Harem, new HaremService(this.game, this.event));
        this.services.set(Service.Mission, new MissionService(this.game, this.event));
        this.services.set(Service.Pvp, new PvpService(this.game, this.event));
        this.services.set(Service.Boss, new BossService(this.game, this.event));
        this.services.set(Service.Shop, new ShopService(this.game, this.event));
        this.services.set(Service.Pachinko, new PachinkoService(this.game, this.event));
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
    login() {
        if ( this.isLogged ) {
            return Promise.resolve();
        }

        return this.game
            .login(this.username, this.password)
            .then(() => this.isLogged = true)
        ;
    }

    logout() {
        if ( !this.isLogged ) {
            return Promise.resolve();
        }

        return this.game.logout();
    }

    private initEventService() {
        this.event
            .on('boss:dropGirl', drop => {console.log('boss:dropGirl', drop)})
            .on('boss:fight', bossId => {console.log('boss:fight', bossId)})
            .on('harem:getMoney', (girlId, money) => {console.log('harem:getMoney', girlId, money)})
            .on('mission:launch', missionId => {console.log('mission:launch', missionId)})
            .on('pachinko:freeReward', () => {console.log('pachinko:freeReward')})
            .on('pvp:fight', () => {console.log('pvp:fight')})
            .on('shop:check', () => {console.log('shop:check')})
        ;
    }
}
