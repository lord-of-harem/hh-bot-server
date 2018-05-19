import ServiceCommand from '../../models/ServiceCommand';

class Quest extends ServiceCommand
{
    constructor() {
        super();
    }

    name(): string {
        return 'mission';
    }

    start(msg) {
        msg.reply('mission start');
    }

    stop(msg) {
        msg.reply('mission stop');
    }

    restart(msg) {
        msg.reply('mission restart');
    }

    status(msg) {
        msg.reply('mission status');
    }
}

export default new Quest();
