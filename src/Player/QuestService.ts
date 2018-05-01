import { PlayerService } from './PlayerService';
import Game from '../Game';
import { Quest } from '../models/Quest';

export default class QuestService implements PlayerService
{
    private quest = null;

    constructor(private game: Game) {}

    start(): Promise<any> {
        return this.game.getQuests()
            .then(quests => {
                let questRun: Quest | null = null;

                for ( const quest of quests ) {
                    if ( quest.remaining_time !== null && quest.remaining_time > 0 ) {
                        questRun = quest;
                    }
                }

                // Si une mission est en cour
                if ( questRun !== null ) {
                    console.log('wait');
                    this.quest = setTimeout(() => this.start().catch(console.error), questRun.remaining_time * 1000);
                }

                // Si aucune mission n'est en cour
                else {
                    for ( const quest of quests ) {
                        // Si la mission est a executée
                        if ( quest.remaining_time === null ) {
                            return this.launchQuest(quest);
                        }
                    }
                }
            })
        ;
    }

    stop() {
        clearTimeout(this.quest);
    }

    /**
     * Lance une quête
     * @param {Quest} quest
     */
    private launchQuest(quest: Quest) {
        console.log('launch quest');

        return this.game
            .launchQuest(quest)
            .then(() => this.start())
            .catch(console.error)
        ;
    }
}
