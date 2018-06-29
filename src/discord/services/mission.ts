import ServiceCommand from '../../models/ServiceCommand';
import {Service} from '../../Player';
import Command from '../Command'

class Mission extends ServiceCommand
{
    constructor() {
        super();
    }

    name(): string {
        return 'mission';
    }

    start(command: Command, msg) {
        command.pm
            .startService(msg.author.id, Service.Mission)
            .then(() => msg.reply('mission start'))
            .catch(e => msg.reply('error start mission ' + JSON.stringify(e)))
        ;
    }

    stop(command: Command, msg) {
        command.pm
            .stopService(msg.author.id, Service.Mission)
            .then(() => msg.reply('mission stop'))
            .catch(e => msg.reply('error stop mission ' + JSON.stringify(e)))
        ;
    }

    restart(command: Command, msg) {
        command.pm
            .stopService(msg.author.id, Service.Mission)
            .then(() => command.pm.startService(msg.author.id, Service.Mission))
            .then(() => msg.reply('mission restart'))
            .catch(e => msg.reply('error restart mission ' + JSON.stringify(e)))
        ;
    }

    status(msg) {
        msg.reply('mission status');
    }
}

export default new Mission();
