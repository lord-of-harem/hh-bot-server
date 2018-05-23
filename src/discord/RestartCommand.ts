import Command from '../models/Command';
import PlayerManager from '../PlayerManager';

export default class RestartCommand extends Command
{
    constructor(pm: PlayerManager) {
        super(pm);
    }

    name(): string {
        return 'restart';
    }
}
