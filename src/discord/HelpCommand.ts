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
        function tab(n: number) {
            return `\t`.repeat(n);
        }

        msg.reply(`Liste des commandes:
        start/stop boss \`bossId\`${tab(3)}- Gère les combats de boss
        start/stop pvp${tab(7)}- Gère les combats pvp
        start/stop harem${tab(6)}- Collecte l'argent du harem
        start/stop shop${tab(7)}- Actualise automatiquement la page du marché
        start/stop mission${tab(5)}- Lance automatiquement les mission quotidienne
        start/stop pachinko${tab(5)}- Récupère dés que possible le cadeau gratuit quotidien
        stat${tab(12)}- Donne le rapport de ce qu'à fait le système pour la journée en cour`);
    }
}
