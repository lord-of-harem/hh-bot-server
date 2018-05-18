
export interface Command
{
    name(): string;
    exec(msg, ...args): void;
}
