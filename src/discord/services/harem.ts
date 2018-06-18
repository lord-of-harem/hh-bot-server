import ServiceCommand from '../../models/ServiceCommand';

class Harem extends ServiceCommand
{
    constructor() {
        super();
    }

    name(): string {
        return 'harem';
    }

    start(msg) {
        msg.reply('harem start');
    }

    stop(msg) {
        msg.reply('harem stop');
    }

    restart(msg) {
        msg.reply('harem restart');
    }

    status(msg) {
        msg.reply('harem status');
    }
}

export default new Harem();
