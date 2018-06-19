import ServiceCommand from '../../models/ServiceCommand';
import {Service} from '../../Player';
import Command from '../../models/Command'

class Harem extends ServiceCommand
{
    constructor() {
        super();
    }

    name(): string {
        return 'harem';
    }

    start(command: Command, msg) {
        command.pm
            .startService(msg.author.id, Service.Harem)
            .then(() => msg.reply('harem start'))
            .catch(e => msg.reply('error start harem ' + JSON.stringify(e)))
        ;
    }

    stop(command: Command, msg) {
        command.pm
            .stopService(msg.author.id, Service.Harem)
            .then(() => msg.reply('harem stop'))
            .catch(e => msg.reply('error stop harem ' + JSON.stringify(e)))
        ;
    }

    restart(command: Command, msg) {
        command.pm
            .stopService(msg.author.id, Service.Harem)
            .then(() => command.pm.startService(msg.author.id, Service.Harem))
            .then(() => msg.reply('harem restart'))
            .catch(e => msg.reply('error restart harem ' + JSON.stringify(e)))
        ;
    }

    status(command: Command, msg) {
        msg.reply('harem status');
    }
}

export default new Harem();
