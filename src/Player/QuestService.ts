import { PlayerService, Status } from './PlayerService';
import Game from '../Game';
import { Quest } from '../models/Quest';
import { EventEmitter } from 'events';

export default class QuestService extends PlayerService
{
    private currentQuest = null;
    private reload = null;

    constructor(private game: Game, private event: EventEmitter) {
        super();
    }

    start(): Promise<any> {
        return this.game.getQuests()
            .then(contest => {
                this.reload = setTimeout(() => this.restart(), contest.nextUpdate * 1000);

                let questRun: Quest | null = null;

                for ( const quest of contest.quests ) {
                    if ( quest.remaining_time !== null && quest.remaining_time > 0 ) {
                        questRun = quest;
                    }
                }

                // Si une mission est en cour
                if ( questRun !== null ) {
                    console.log('wait');
                    this.currentQuest = setTimeout(() => this.start().catch(console.error), questRun.remaining_time * 1000);
                }

                // Si aucune mission n'est en cour
                else {
                    for ( const quest of contest.quests ) {
                        // Si la mission est a executée
                        if ( quest.remaining_time === null ) {
                            return this.launchQuest(quest);
                        }
                    }
                }

                this.currentStatus = Status.Started;
            })
        ;
    }

    stop() {
        clearTimeout(this.currentQuest);
        clearTimeout(this.reload);
        this.currentStatus = Status.Stopped;
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
