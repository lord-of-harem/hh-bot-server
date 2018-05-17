import { Service } from '../Player';

export interface PlayerModel
{
    _id: string;
    username: string;
    password: string;
    services: Array<Service>;
}
