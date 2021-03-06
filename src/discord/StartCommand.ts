import Command from './Command';
import PlayerManager from '../PlayerManager';

export default class StartCommand extends Command
{
    constructor(pm: PlayerManager) {
        super(pm);
    }

    name(): string {
        return 'start';
    }
}
