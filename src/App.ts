import * as express from 'express';
import { default as Player, Service, Command } from './Player';

class App {
    public express;

    constructor () {
        this.express = express();
        this.mountRoutes();

        this.test();
    }

    private mountRoutes (): void {
        const router = express.Router();
        router.get('/', (req, res) => {
            res.json({
                message: 'Hello World!'
            });
        });
        this.express.use('/', router);
    }

    public test() {
        let p = new Player('', '');

        /*p
            .updateService(Service.Harem, Command.Start)
            .updateService(Service.Quest, Command.Start)
            .updateService(Service.Pvp, Command.Start)
            .updateService(Service.Boss, Command.Start, 1)
            .updateService(Service.Shop, Command.Start, 30)
            .updateService(Service.Pachinko, Command.Start)
        ;*/
    }
}

export default new App().express;
