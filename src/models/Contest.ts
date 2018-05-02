import { Quest } from './Quest';

export interface Contest
{
    nextUpdate: number;
    quests: Array<Quest>;
}
