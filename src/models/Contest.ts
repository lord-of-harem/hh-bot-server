import { Mission } from './Mission';

export interface Contest
{
    nextUpdate: number;
    quests: Array<Mission>;
}
