import Command from '../models/Command';

export default class StopCommand extends Command
{
    constructor() {
        super();
    }

    name(): string {
        return 'stop';
    }
}
