import Command from './Command';
import PlayerManager from '../PlayerManager';

export default class StopCommand extends Command
{
    constructor(pm: PlayerManager) {
        super(pm);
    }

    name(): string {
        return 'stop';
    }
}
