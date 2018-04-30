import * as express from 'express';
import Player from './Player';

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


    }
}

export default new App().express;
