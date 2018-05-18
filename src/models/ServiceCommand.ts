
export interface ServiceCommand
{
    name(): string;
    exec(msg, ...args): void;
}
