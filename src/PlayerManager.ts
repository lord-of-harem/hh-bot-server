import * as PouchDb from 'pouchdb';
import { PlayerModel } from './models/Player';
import Player, { Command, Service } from './Player';

export default class PlayerManager
{
    private playersDb: PouchDB.Database;
    private players: Map<string, Player> = new Map();

    constructor() {
        this.playersDb = new PouchDb(process.env.PLAYER_DB);

        // TODO filter via la requête (ou alors faire une autre db)
        this.playersDb.allDocs({
            include_docs: true,
        }).then(result => {
            result.rows
                .filter(row => row.doc.hasOwnProperty('username'))
                .forEach(row => {
                    let p: PlayerModel = row.doc as any as PlayerModel;
                    this.initPlayer(p);
                })
            ;
        })
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

        return new Promise((resolve, reject) => this.playersDb.get(discordId)
            .then(() => reject('Player already exists'))
            .catch(() => {
                let p = new Player(this.playersDb, pm);

                return p.login()
                    .then(() => p.logout());
            })
            .then(() => {
                pm.services.push({service: Service.Harem, args: []});
                pm.services.push({service: Service.Mission, args: []});
                pm.services.push({service: Service.Shop, args: [120]});
                pm.services.push({service: Service.Pachinko, args: []});

                resolve(this.playersDb
                    .put(pm)
                    .then(() => this.initPlayer(pm))
                );
            })
            .catch(reject)
        );
    }

    startService(discordId: string, service: Service, ...args) {
        if ( !this.players.has(discordId) ) {
            return Promise.reject('');
        }

        let p: Player = this.players.get(discordId);

        p.updateService(service, Command.Stop);
        p.updateService(service, Command.Start, ...args);

        return this.playersDb.get(discordId)
            .then(resp => {
                const player: PlayerModel = resp as any as PlayerModel;
                let index = player.services.findIndex(s => s.service === service);

                if ( index === -1 ) {
                    player.services.push({service: service, args: args});
                } else {
                    player.services[index].args = args;
                }

                return this.playersDb.put(player);
                // TODO modifier référence player
            });
    }

    stopService(discordId: string, service: Service) {
        if ( !this.players.has(discordId) ) {
            return Promise.reject('');
        }

        let p: Player = this.players.get(discordId);

        p.updateService(service, Command.Stop);

        return this.playersDb.get(discordId)
            .then(resp => {
                const player: PlayerModel = resp as any as PlayerModel;
                let index = player.services.findIndex(s => s.service === service);

                if ( index !== -1 ) {
                    player.services.splice(index, 1);
                }

                return this.playersDb.put(player);
                // TODO modifier référence player
            });
    }

    private initPlayer(pm: PlayerModel) {
        let p = new Player(this.playersDb, pm);
        this.players.set(pm.discordId, p);

        for ( let s of pm.services ) {
            p.updateService(s.service, Command.Start, ...s.args);
        }
    }
}
