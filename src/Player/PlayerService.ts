
export interface PlayerService
{
    start(...args): Promise<any>;
    stop();
}
