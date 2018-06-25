import { PlayerService, Status } from './PlayerService';
import Game from '../Game';
import { Mission } from '../models/Mission';
import { EventEmitter } from 'events';

export default class MissionService extends PlayerService
{
    private currentMission = null;
    private reload = null;

    constructor(private game: Game, private event: EventEmitter) {
        super();
    }

    start(): Promise<any> {
        return this.game.getMissions()
            .then(contest => {
                this.reload = setTimeout(() => this.restart(), contest.nextUpdate * 1000);

                let missionRun: Mission | null = null;

                for ( const quest of contest.quests ) {
                    if ( quest.remaining_time !== null && quest.remaining_time > 0 ) {
                        missionRun = quest;
                    }
                }

                // Si une mission est en cour
                if ( missionRun !== null ) {
                    this.currentMission = setTimeout(() => this.restart().catch(console.error), missionRun.remaining_time * 1000);
                }

                // Si aucune mission n'est en cour
                else {
                    for ( const quest of contest.quests ) {
                        // Si la mission est a executée
                        if ( quest.remaining_time === null ) {
                            return this.launchMission(quest);
                        }
                    }
                }

                this.currentStatus = Status.Started;
            })
            .catch(e => {
                console.error(e);
                this.restart();
            })
        ;
    }

    stop() {
        clearTimeout(this.currentMission);
        clearTimeout(this.reload);
        this.currentStatus = Status.Stopped;
    }

    /**
     * Lance une quête
     * @param {Mission} mission
     */
    private launchMission(mission: Mission) {
        return this.game
            .launchMission(mission)
            .then(() => {
                this.event.emit('mission:launch', mission.id_mission);
                this.start();
            })
            .catch(console.error)
        ;
    }
}
