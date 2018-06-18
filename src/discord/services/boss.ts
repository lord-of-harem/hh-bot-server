import ServiceCommand from '../../models/ServiceCommand';

class Boss extends ServiceCommand
{
    constructor() {
        super();
    }

    name(): string {
        return 'boss';
    }

    start(msg, ...args) {
        msg.reply('boss start');
    }

    stop(msg) {
        msg.reply('boss stop');
    }

    restart(msg, ...args) {
        msg.reply('boss restart');
    }

    status(msg) {
        msg.reply('boss status');
    }
}

export default new Boss();
