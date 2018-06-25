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

    public test() {}
}

export default new App().express;
