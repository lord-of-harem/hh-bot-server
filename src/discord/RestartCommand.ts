import Command from '../models/Command';

export default class RestartCommand extends Command
{
    constructor() {
        super();
    }

    name(): string {
        return 'restart';
    }
}
