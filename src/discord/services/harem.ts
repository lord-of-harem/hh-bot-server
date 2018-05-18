import { ServiceCommand } from '../../models/ServiceCommand';
import {Command} from '../../models/Command';

export default class Harem implements ServiceCommand
{
    name(): string {
        return 'harem';
    }

    exec(command: Command, msg) {
        if ( command.name() === 'start' ) {
            msg.reply('harem start');
        }

        else if ( command.name() === 'stop' ) {
            msg.reply('harem stop');
        }

        else if ( command.name() === 'restart' ) {
            msg.reply('harem restart');
        }

        else if ( command.name() === 'status' ) {
            msg.reply('harem status');
        }
    }
}
