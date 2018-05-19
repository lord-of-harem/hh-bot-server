import ServiceCommand from '../../models/ServiceCommand';

export default class Harem extends ServiceCommand
{
    constructor() {
        super();
    }

    name(): string {
        return 'harem';
    }

    start(msg, ...args) {
        msg.reply('harem start');
    }

    stop(msg) {
        msg.reply('harem stop');
    }

    restart(msg, ...args) {
        msg.reply('harem restart');
    }

    status(msg) {
        msg.reply('harem status');
    }
}
