import ServiceCommand from '../../models/ServiceCommand';

class Shop extends ServiceCommand
{
    constructor() {
        super();
    }

    name(): string {
        return 'shop';
    }

    start(msg) {
        msg.reply('shop start');
    }

    stop(msg) {
        msg.reply('shop stop');
    }

    restart(msg) {
        msg.reply('shop restart');
    }

    status(msg) {
        msg.reply('shop status');
    }
}

export default new Shop();
