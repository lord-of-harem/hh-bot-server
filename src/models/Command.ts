import ServiceCommand from './ServiceCommand';
import PlayerManager from '../PlayerManager';

export default abstract class Command
{
    protected services: Map<string, ServiceCommand> = new Map();

    abstract name(): string;

    constructor(protected pm: PlayerManager) {}

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

    protected getPlayer(msg) {
        //this.pm.
    }
}
