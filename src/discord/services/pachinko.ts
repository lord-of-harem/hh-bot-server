import ServiceCommand from '../../models/ServiceCommand';

class Pachinko extends ServiceCommand
{
    constructor() {
        super();
    }

    name(): string {
        return 'pachinko';
    }

    start(msg) {
        msg.reply('pachinko start');
    }

    stop(msg) {
        msg.reply('pachinko stop');
    }

    restart(msg) {
        msg.reply('pachinko restart');
    }

    status(msg) {
        msg.reply('pachinko status');
    }
}

export default new Pachinko();
