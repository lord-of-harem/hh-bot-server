import { PlayerService, Status } from './PlayerService';
import { Mission } from '../models/Mission';
import Player from "../Player";

export default class MissionService extends PlayerService
{
    private currentMission = null;
    private reload = null;

    constructor(private player: Player) {
        super();
    }

    async start(): Promise<any> {
        this.currentStatus = Status.Started;
        this.player.event.emit('mission:start');
        this.exec();
    }

    stop() {
        clearTimeout(this.currentMission);
        clearTimeout(this.reload);
        this.currentStatus = Status.Stopped;
        this.player.event.emit('mission:stop');
    }

    private async exec() {
        try {
            let contest = await this.player.game.getMissions();
            let missionRun: Mission | null = null;

            this.reload = setTimeout(() => this.exec(), contest.nextUpdate * 1000);

            for (const quest of contest.quests) {
                if (quest.remaining_time !== null && quest.remaining_time > 0) {
                    missionRun = quest;
                }
            }

            // Si une mission est en cour
            if (missionRun !== null) {
                this.currentMission = setTimeout(() => this.exec(), missionRun.remaining_time * 1000);
            }

            // Si aucune mission n'est en cour
            else {
                for (const quest of contest.quests) {
                    // Si la mission est a executée
                    if (quest.remaining_time === null) {
                        return this.launchMission(quest);
                    }
                }
            }
        }

        catch (e) {
            console.error(e);
            this.restart();
        }
    }

    /**
     * Lance une quête
     * @param {Mission} mission
     */
    private async launchMission(mission: Mission) {
        try {
            await this.player.game.launchMission(mission);
            this.player.event.emit('mission:launch', mission.id_mission);
            this.exec();
        }

        catch (e) {
            console.error(e);
        }
    }
}
