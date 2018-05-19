import Command from '../models/Command';

export default class StartCommand extends Command
{
    constructor() {
        super();
    }

    name(): string {
        return 'start';
    }
}
