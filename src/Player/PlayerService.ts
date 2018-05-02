
export interface PlayerServiceInterface
{
    start(...args): Promise<any>;
    stop();
    restart(...args);
}

export abstract class PlayerService implements PlayerServiceInterface
{
    abstract start(...args);
    abstract stop();

    restart(...args) {
        return Promise.resolve()
            .then(() => this.stop())
            .then(() => this.start(...args))
        ;
    }
}
