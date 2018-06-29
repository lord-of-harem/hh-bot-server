import ServiceCommand from '../../models/ServiceCommand';
import {Service} from '../../Player';
import Command from '../Command';

class Pachinko extends ServiceCommand
{
    constructor() {
        super();
    }

    name(): string {
        return 'pachinko';
    }

    start(command: Command, msg) {
        command.pm
            .startService(msg.author.id, Service.Pachinko)
            .then(() => msg.reply('pachinko start'))
            .catch(e => msg.reply('error start pachinko ' + JSON.stringify(e)))
        ;
    }

    stop(command: Command, msg) {
        command.pm
            .stopService(msg.author.id, Service.Pachinko)
            .then(() => msg.reply('pachinko stop'))
            .catch(e => msg.reply('error stop pachinko ' + JSON.stringify(e)))
        ;
    }

    restart(command: Command, msg) {
        command.pm
            .stopService(msg.author.id, Service.Pachinko)
            .then(() => command.pm.startService(msg.author.id, Service.Pachinko))
            .then(() => msg.reply('pachinko restart'))
            .catch(e => msg.reply('error restart pachinko ' + JSON.stringify(e)))
        ;
    }

    status(msg) {
        msg.reply('pachinko status');
    }
}

export default new Pachinko();
