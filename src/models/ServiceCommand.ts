import Command from './Command';

export default abstract class ServiceCommand
{
    abstract name(): string;

    exec(command: Command, msg, ...args): void {
        if ( this[command.name()] ) {
            this[command.name()](command, msg, ...args);
        }
    }
}
