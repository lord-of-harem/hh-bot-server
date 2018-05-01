import { Opponent } from './Opponent';

export interface Arena
{
    opponents: Array<Opponent>;
    timeout: number;
}
