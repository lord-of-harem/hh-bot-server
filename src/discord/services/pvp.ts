import ServiceCommand from '../../models/ServiceCommand';

class Pvp extends ServiceCommand
{
    constructor() {
        super();
    }

    name(): string {
        return 'pvp';
    }

    start(msg) {
        msg.reply('pvp start');
    }

    stop(msg) {
        msg.reply('pvp stop');
    }

    restart(msg) {
        msg.reply('pvp restart');
    }

    status(msg) {
        msg.reply('pvp status');
    }
}

export default new Pvp();
