import {Command} from '../models/Command';
import {ServiceCommand} from '../models/ServiceCommand';

export default class StopCommand implements Command
{
    services: Map<string, ServiceCommand> = new Map();

    name(): string {
        return 'stop';
    }

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
