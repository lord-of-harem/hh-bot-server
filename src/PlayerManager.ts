import * as PouchDb from 'pouchdb';
import { PlayerModel } from './models/Player';
import Player, { Command}  from './Player';

class PlayerManager
{
    private playersDb: PouchDB.Database;
    private players: Array<Player>;

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
        let p: PlayerModel = {
            _id: username,
            username: username,
            password: password,
            services: [],
        };

        return this.playersDb.put(p);
    }

    private initPlayer(pm: PlayerModel) {
        let p = new Player(pm.username, pm.password);
        this.players.push(p);

        for ( let service of pm.services ) {
            p.updateService(service, Command.Start);
        }
    }
}

export default new PlayerManager();
