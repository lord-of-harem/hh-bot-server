import * as PouchDb from 'pouchdb';
import { PlayerModel } from './models/Player';
import Player, { Command, Service } from './Player';

class PlayerManager
{
    private playersDb: PouchDB.Database;
    private players: Map<string, Player> = new Map();

    constructor() {
        this.playersDb = new PouchDb('players');

        this.playersDb.allDocs({
            include_docs: true,
        }).then(result => {
            result.rows.forEach(row => {
                let p: PlayerModel = row.doc as any as PlayerModel;
                this.initPlayer(p);
            });
        })
    }

    register(username: string, password: string) {
        return new Promise((resolve, reject) => this.playersDb.get(username)
            .then(() => reject('Player already exists'))
            .catch(() => {
                let p: PlayerModel = {
                    _id: username,
                    username: username,
                    password: password,
                    services: [],
                };

                p.services.push({service: Service.Harem, args: []});
                p.services.push({service: Service.Quest, args: []});
                p.services.push({service: Service.Pvp, args: []});
                p.services.push({service: Service.Shop, args: [120]});
                p.services.push({service: Service.Pachinko, args: []});

                resolve(this.playersDb
                    .put(p)
                    .then(() => this.initPlayer(p))
                );
            }))
        ;
    }

    startService(username: string, service: Service, ...args) {
        if ( !this.players.has(username) ) {
            return Promise.reject('');
        }

        let p: Player = this.players.get(username);

        p.updateService(service, Command.Stop);
        p.updateService(service, Command.Start, ...args);

        return this.playersDb.get(username)
            .then(resp => {
                const player: PlayerModel = resp as any as PlayerModel;
                let index = player.services.findIndex(s => s.service === service);

                if ( index === -1 ) {
                    player.services.push({service: service, args: args});
                } else {
                    player.services[index].args = args;
                }

                return this.playersDb.put(player);
            });
    }

    stopService(username: string, service: Service) {
        if ( !this.players.has(username) ) {
            return Promise.reject('');
        }

        let p: Player = this.players.get(username);

        p.updateService(service, Command.Stop);

        return this.playersDb.get(username)
            .then(resp => {
                const player: PlayerModel = resp as any as PlayerModel;
                let index = player.services.findIndex(s => s.service === service);

                if ( index !== -1 ) {
                    player.services.splice(index, 1);
                }

                return this.playersDb.put(player);
            });
    }

    private initPlayer(pm: PlayerModel) {
        let p = new Player(pm.username, pm.password);
        this.players.set(pm.username, p);

        for ( let s of pm.services ) {
            p.updateService(s.service, Command.Start, ...s.args);
        }
    }
}

export default new PlayerManager();
