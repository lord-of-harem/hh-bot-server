import Command from './Command';
import PlayerManager from '../PlayerManager';

export default class HelpCommand extends Command
{
    constructor(pm: PlayerManager) {
        super(pm);
    }

    name(): string {
        return 'help';
    }

    exec(msg): void {
        msg.channel.send({embed:{
            title: "Help",
            description: "Besoin d'aide ? Pas de panique, toute les commandes disponible sont lister ci-dessous !",
            color: 12397708,
            fields: [{
                name: "``start [processus]``",
                value: "Lance l'un de ces processus: ``boss``*, ``pvp``, ``harem``, ``shop``, ``mission``, ``pachinko``\nEx: ``start pvp``\n*: Il faut également spécifier l'id du boss. Ex: ``start boss 1``"
            },{
                name: "``stop [processus]``",
                value: "Lance l'un de ces processus: ``boss``, ``pvp``, ``harem``, ``shop``, ``mission``, ``pachinko``\nEx: ``stop pvp``"
            },{
                name: "``stat``",
                value: "Affiche un rapport sur les actions réaliser par le système pour la journée en cours."
            }]
        }});
    }
}
