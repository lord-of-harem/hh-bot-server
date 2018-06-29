import ServiceCommand from '../../models/ServiceCommand';
import {Service} from '../../Player';
import Command from '../Command'

class Shop extends ServiceCommand
{
    constructor() {
        super();
    }

    name(): string {
        return 'shop';
    }

    start(command: Command, msg, timer = 120) {
        command.pm
            .startService(msg.author.id, Service.Shop, timer)
            .then(() => msg.reply('shop start'))
            .catch(e => msg.reply('error start boss ' + JSON.stringify(e)))
        ;
    }

    stop(command: Command, msg) {
        command.pm
            .stopService(msg.author.id, Service.Shop)
            .then(() => msg.reply('shop stop'))
            .catch(e => msg.reply('error stop boss ' + JSON.stringify(e)))
        ;
    }

    restart(command: Command, msg, timer) {
        command.pm
            .stopService(msg.author.id, Service.Shop)
            .then(() => command.pm.startService(msg.author.id, Service.Shop, timer))
            .then(() => msg.reply('shop restart'))
            .catch(e => msg.reply('error restart shop ' + JSON.stringify(e)))
        ;
    }

    status(msg) {
        msg.reply('shop status');
    }
}

export default new Shop();
