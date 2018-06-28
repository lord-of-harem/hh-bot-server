import * as PouchDb from 'pouchdb';
import { PlayerModel } from './models/Player';
import Player, { Command, Service } from './Player';
import {DiscordAccount} from "./models/DiscordAccount";

export default class PlayerManager
{
    public accountsDb: PouchDB.Database;
    public discordDb: PouchDB.Database;
    public dayDb: PouchDB.Database;
    private players: Map<string, Player> = new Map();

    constructor() {
        this.accountsDb = new PouchDb(process.env.HOST_DATABASE + '/' + process.env.ACCOUNT_DB);
        this.discordDb = new PouchDb(process.env.HOST_DATABASE + '/' + process.env.DISCORD_DB);
        this.dayDb = new PouchDb(process.env.HOST_DATABASE + '/' + process.env.DAY_DB);

        this.accountsDb.allDocs({
            include_docs: true,
        }).then(result => result.rows
            .forEach(row => {
                let p: PlayerModel = row.doc as any as PlayerModel;
                this.initPlayer(p);
            })
        );
    }

    register(discordId: string, server: string, username: string, password: string) {
        let pm: PlayerModel = {
            _id: discordId,
            discordId: discordId,
            username: username,
            password: password,
            services: [],
            server: server,
        };

        return new Promise((resolve, reject) => this.accountsDb.get(discordId)
            .then(() => reject('Player already exists'))
            .catch(() => {
                let p = new Player(this, pm);

                return p.login()
                    .then(() => p.logout());
            })
            .then(() => {
                pm.services.push({service: Service.Harem, args: []});
                pm.services.push({service: Service.Mission, args: []});
                pm.services.push({service: Service.Shop, args: [120]});
                pm.services.push({service: Service.Pachinko, args: []});

                resolve(this.accountsDb
                    .put(pm)
                    .then(() => this.initPlayer(pm))
                );
            })
            .catch(reject)
        );
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
        this.players.set(pm.discordId, p);

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
}
