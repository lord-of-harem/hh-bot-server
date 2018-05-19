import { ServiceCommand } from './ServiceCommand';

export default abstract class Command
{
    protected services: Map<string, ServiceCommand> = new Map();

    abstract name(): string;

    exec(msg, ...args): void {
        const service = args.shift().toLowerCase();

        if ( !this.services.has(service) ) {
            msg.reply(`Le service demandé n'existe pas`);
            return;
        }

        this.services.get(service).exec(this, msg, ...args);
    }

    addService(service: ServiceCommand) {
        this.services.set(service.name(), service);
    }
}
