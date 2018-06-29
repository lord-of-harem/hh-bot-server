import ServiceCommand from '../../models/ServiceCommand';
import {Service} from '../../Player';
import Command from '../Command';

class Boss extends ServiceCommand
{
    constructor() {
        super();
    }

    name(): string {
        return 'boss';
    }

    start(command: Command, msg, bossId) {
        command.pm
            .startService(msg.author.id, Service.Boss, bossId)
            .then(() => msg.reply('boss start'))
            .catch(e => msg.reply('error start boss ' + JSON.stringify(e)))
        ;
    }

    stop(command: Command, msg) {
        command.pm
            .stopService(msg.author.id, Service.Boss)
            .then(() => msg.reply('boss stop'))
            .catch(e => msg.reply('error stop boss ' + JSON.stringify(e)))
        ;
    }

    restart(command: Command, msg, bossId) {
        command.pm
            .stopService(msg.author.id, Service.Boss)
            .then(() => command.pm.startService(msg.author.id, Service.Boss, bossId))
            .then(() => msg.reply('boss restart'))
            .catch(e => msg.reply('error restart boss ' + JSON.stringify(e)))
        ;
    }

    status(command: Command, msg) {
        msg.reply('boss status');
    }
}

export default new Boss();
