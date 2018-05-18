import {Command} from '../models/Command';

export default class StartCommand implements Command
{
    name(): string {
        return 'start';
    }

    exec(msg, ...args): void {
        msg.reply(args);
        console.log(args);
    }
}
