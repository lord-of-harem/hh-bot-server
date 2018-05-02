
export enum Status {Started, Stopped}

export interface PlayerServiceInterface
{
    start(...args): Promise<any>;
    stop();
    restart(...args);
    status(): Status;
}

export abstract class PlayerService implements PlayerServiceInterface
{
    protected currentStatus: Status = Status.Stopped;

    abstract start(...args);
    abstract stop();

    restart(...args) {
        return Promise.resolve()
            .then(() => this.stop())
            .then(() => this.start(...args))
        ;
    }

    status(): Status {
        return this.currentStatus;
    }
}
