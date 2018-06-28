import { Service } from '../Player';

export interface PlayerModel
{
    _id?: string;
    username: string;
    password: string;
    services: Array<{
        service: Service;
        args: Array<any>;
    }>;
    discordId: string;
    server: string;
}
