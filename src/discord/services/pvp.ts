import ServiceCommand from '../../models/ServiceCommand';
import {Service} from '../../Player';
import Command from '../../models/Command';

class Pvp extends ServiceCommand
{
    constructor() {
        super();
    }

    name(): string {
        return 'pvp';
    }

    start(command: Command, msg) {
        command.pm
            .startService(msg.author.id, Service.Pvp)
            .then(() => msg.reply('pvp start'))
            .catch(e => msg.reply('error start pvp ' + JSON.stringify(e)))
        ;
    }

    stop(command: Command, msg) {
        command.pm
            .stopService(msg.author.id, Service.Pvp)
            .then(() => msg.reply('pvp stop'))
            .catch(e => msg.reply('error stop pvp ' + JSON.stringify(e)))
        ;
    }

    restart(command: Command, msg) {
        command.pm
            .stopService(msg.author.id, Service.Pvp)
            .then(() => command.pm.startService(msg.author.id, Service.Pvp))
            .then(() => msg.reply('pvp restart'))
            .catch(e => msg.reply('error restart pvp ' + JSON.stringify(e)))
        ;
    }

    status(msg) {
        msg.reply('pvp status');
    }
}

export default new Pvp();
