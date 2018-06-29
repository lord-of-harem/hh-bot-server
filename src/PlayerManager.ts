import * as PouchDb from 'pouchdb';
import { PlayerModel } from './models/Player';
import Player, { Command, Service } from './Player';
import {DiscordAccount} from "./models/DiscordAccount";
import {Discord} from "./Discord";
import * as moment from "moment";
import {User} from "discord.js";
import StatCommand from "./discord/StatCommand";

// uniquement pour que typescript ne râle pas
function emit(...args) {}

export default class PlayerManager
{
    public accountsDb: PouchDB.Database;
    public discordDb: PouchDB.Database;
    public dayDb: PouchDB.Database;
    private players: Map<string, Player> = new Map();

    constructor(private discord: Discord) {
        this.accountsDb = new PouchDb(process.env.HOST_DATABASE + '/' + process.env.ACCOUNT_DB);
        this.discordDb = new PouchDb(process.env.HOST_DATABASE + '/' + process.env.DISCORD_DB);
        this.dayDb = new PouchDb(process.env.HOST_DATABASE + '/' + process.env.DAY_DB);

        this.createView(this.accountsDb, {
            _id: '_design/account',
            views: {
                list: {
                    map: function (doc) {
                        emit([doc.server, doc.username], doc);
                    }.toString()
                }
            }
        }).catch(e => console.error(e)); // TODO problème avec la MaJ index

        this.accountsDb.query('account/list', {include_docs: true})
            .then(result => result.rows.forEach(row => this.initPlayer(row.doc as any as PlayerModel)));

        this.initDayStats();
    }

    private initDayStats() {
        const nextDay = moment().set({'hour': 4, 'minute': 55, 'second': 0, 'millisecond': 0});

        if ( nextDay.diff(moment()) < 0 ) {
            nextDay.add(1, 'day');
        }

        setTimeout(() => {
            this.sendDayStats();
            setInterval(() => this.sendDayStats(), 86400000);
        }, nextDay.diff(moment()));
    }

    private async sendDayStats() {
        const stat = new StatCommand(this);

        for ( const player of this.players.values() ) {
            const playerDiscord: User = await this.discord.fetchUser(player.player.discordId);
            const statMsg = await stat.getStatMessage(player.player.discordId);

            if ( statMsg !== '' ) {
                playerDiscord.send(statMsg);
            }
        }
    }

    async register(discordId: string, server: string, username: string, password: string) {
        let pm: PlayerModel = {
            discordId: discordId,
            username: username,
            password: password,
            services: [],
            server: server,
        };

        const result = await this.accountsDb.query('account/list', {
            key: [pm.server, pm.username],
        });

        if ( result.rows.length > 0 ) {
            throw new Error('Player already exists');
        }

        const p = new Player(this, pm);

        await p.login();
        await p.logout();

        pm.services.push({service: Service.Harem, args: []});
        pm.services.push({service: Service.Mission, args: []});
        pm.services.push({service: Service.Shop, args: [120]});
        pm.services.push({service: Service.Pachinko, args: []});

        pm._id = (await this.accountsDb.post(pm)).id;

        let discord: DiscordAccount;

        try {
            discord = await this.discordDb.get(discordId) as any as DiscordAccount;
            discord.accounts.push(pm._id);
        }

        catch (e) {
            discord = {
                _id: discordId,
                accounts: [pm._id],
                currentAccount: pm._id,
            };
        }

        this.discordDb.put(discord);

        this.initPlayer(pm);
    }

    private async createView(db: PouchDB.Database, view) {
        let data;

        try {
            data = Object.assign(await db.get(view._id), view);
        }

        catch (e) {
            data = view;
        }

        await db.put(data);
    }

    async startService(discordId: string, service: Service, ...args) {
        const pm: PlayerModel = await this.getPlayerModel(discordId);
        const p: Player = this.getPlayer(pm._id);

        p.updateService(service, Command.Stop);
        p.updateService(service, Command.Start, ...args);

        let index = pm.services.findIndex(s => s.service === service);

        if ( index === -1 ) {
            pm.services.push({service: service, args: args});
        } else {
            pm.services[index].args = args;
        }

        return await this.accountsDb.put(pm);
    }

    async stopService(discordId: string, service: Service) {
        const pm: PlayerModel = await this.getPlayerModel(discordId);
        const p: Player = this.getPlayer(pm._id);

        p.updateService(service, Command.Stop);

        let index = pm.services.findIndex(s => s.service === service);

        if ( index !== -1 ) {
            pm.services.splice(index, 1);
        }

        return await this.accountsDb.put(pm);
    }

    private initPlayer(pm: PlayerModel) {
        let p = new Player(this, pm);
        this.players.set(pm._id, p);

        for ( let s of pm.services ) {
            p.updateService(s.service, Command.Start, ...s.args);
        }
    }

    public async getPlayerModel(discordId: string): Promise<PlayerModel>
    {
        const discord: DiscordAccount = await this.discordDb.get(discordId) as any;
        return await this.accountsDb.get(discord.currentAccount) as any as PlayerModel;
    }

    public getPlayer(id: string): Player {
        if ( !this.players.has(id) ) {
            throw new Error(`Le joueur n'est pas chargé par le système`)
        }

        return this.players.get(id);
    }

    public async getPlayerDiscord(discordId: string): Promise<Player> {
        const pm: PlayerModel = await this.getPlayerModel(discordId);
        return await this.getPlayer(pm._id);
    }
}
