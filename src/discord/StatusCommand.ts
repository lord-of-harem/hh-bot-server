import Command from '../models/Command';

export default class StatusCommand extends Command
{
    constructor() {
        super();
    }

    name(): string {
        return 'status';
    }
}
