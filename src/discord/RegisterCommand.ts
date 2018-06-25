import Command from '../models/Command';
import PlayerManager from '../PlayerManager';

export default class RegisterCommand extends Command
{
    constructor(pm: PlayerManager) {
        super(pm);
    }

    name(): string {
        return 'register';
    }

    exec(msg, ...args): void {
        this.pm.register(msg.author.id, 'https://www.hentaiheroes.com', args[0], args[1])
            .then(() => {
                msg.reply('register ok');
            })
            .catch(e => {
                msg.reply('error auth ' + e);
            })
        ;
    }
}
