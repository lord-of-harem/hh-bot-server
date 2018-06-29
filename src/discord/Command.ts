import ServiceCommand from '../models/ServiceCommand';
import PlayerManager from '../PlayerManager';

export default abstract class Command
{
    protected services: Map<string, ServiceCommand> = new Map();

    abstract name(): string;

    protected constructor(public pm: PlayerManager) {}

    exec(msg, ...args): void | Promise<any> {
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
