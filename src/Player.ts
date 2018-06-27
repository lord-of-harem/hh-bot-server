import Game from './Game';
import { PlayerServiceInterface } from './Player/PlayerService';
import HaremService from './Player/HaremService';
import MissionService from './Player/MissionService';
import PvpService from './Player/PvpService';
import BossService from './Player/BossService';
import ShopService from './Player/ShopService';
import { EventEmitter } from 'events';
import PachinkoService from './Player/PachinkoService';
import * as PouchDb from 'pouchdb';
import {PlayerDay} from "./models/PlayerDay";
import * as moment from "moment";

export enum Command {Start, Stop, Restart}
export enum Service {Harem, Mission, Pvp, Boss, Shop, Pachinko}

export default class Player
{
    public game: Game;
    private isLogged = false;
    private services: Map<number, PlayerServiceInterface> = new Map();
    public event: EventEmitter;

    constructor(public db: PouchDB.Database, private host: string, private username: string, private password: string) {
        this.game = new Game(this.host);
        this.event = new EventEmitter();
        this.initEventService();

        this.services.set(Service.Harem, new HaremService(this));
        this.services.set(Service.Mission, new MissionService(this));
        this.services.set(Service.Pvp, new PvpService(this));
        this.services.set(Service.Boss, new BossService(this));
        this.services.set(Service.Shop, new ShopService(this));
        this.services.set(Service.Pachinko, new PachinkoService(this));
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
    login(): Promise<any> {
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

    public async getCurrentDay(): Promise<PlayerDay> {
        const day = moment().set({'hour': 0, 'minute': 0, 'second': 0, 'millisecond': 0});
        const date = moment();

        // Si on est avant 5h du matin
        if ( date.isBefore(moment().set({'hour': 5, 'minute': 0, 'second': 0, 'millisecond': 0})) ) {
            date.subtract(1,  'day');
        }

        const id: string = this.host + ':' + this.username + ':' + date.format('YYYY-MM-DD');

        try {
            return await this.db.get(id) as any as PlayerDay;
        }

        catch (e) {
            return {
                _id: id,
                date: day.toDate(),
                harem: {
                    nbCollect: 0,
                    money: 0,
                },
                boss: {
                    nbBattle: 0,
                    nbBattleLoose: 0,
                    money: 0,
                    xp: 0,
                    mojo: 0,
                    reward: [],
                },
                pvp: {
                    nbBattle: 0,
                    nbBattleLoose: 0,
                    money: 0,
                    xp: 0,
                    mojo: 0,
                    reward: [],
                },
            };
        }
    }

    private initEventService() {
        this.event
            .on('boss:dropGirl', drop => console.log('boss:dropGirl', drop))
            .on('boss:fight', bossId => console.log('boss:fight', bossId))
            .on('harem:getMoney', (girlId, money) => console.log('harem:getMoney', girlId, money))
            .on('mission:launch', missionId => console.log('mission:launch', missionId))
            .on('pachinko:freeReward', () => console.log('pachinko:freeReward'))
            .on('pvp:fight', () => console.log('pvp:fight'))
            .on('shop:check', () => console.log('shop:check'))
            .on('boss:start', () => console.log('boss:start'))
            .on('boss:stop', () => console.log('boss:stop'))
            .on('harem:start', () => console.log('harem:start'))
            .on('harem:stop', () => console.log('harem:stop'))
            .on('mission:start', () => console.log('mission:start'))
            .on('mission:stop', () => console.log('mission:stop'))
            .on('pachinko:start', () => console.log('pachinko:start'))
            .on('pachinko:stop', () => console.log('pachinko:stop'))
            .on('pvp:start', () => console.log('pvp:start'))
            .on('pvp:stop', () => console.log('pvp:stop'))
            .on('shop:start', () => console.log('shop:start'))
            .on('shop:stop', () => console.log('shop:stop'))
        ;
    }
}
