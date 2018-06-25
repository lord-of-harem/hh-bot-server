import Command from '../models/Command';
import PlayerManager from '../PlayerManager';

export default class HelpCommand extends Command
{
    constructor(pm: PlayerManager) {
        super(pm);
    }

    name(): string {
        return 'help';
    }

    exec(msg): void {
        msg.reply(`Liste des commandes:
        start/stop boss \`bossId\`
        start/stop pvp
        start/stop harem
        start/stop shop
        start/stop mission
        start/stop pachinko`);
    }
}
