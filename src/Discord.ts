import {Client, User} from 'discord.js';
import Command from './discord/Command';

export class Discord
{
    private client;
    private commands: Map<string, Command> = new Map();

    constructor() {
        this.client = new Client();
        this.client
            .on('message', msg => this.message(msg))
            .on('ready', () => this.ready())
            .on('error', console.error)
        ;
        this.client.login(process.env.DISCORD_TOKEN);
    }

    async message(msg) {
        const args = msg.content.split(/ +/);
        const command = args.shift().toLowerCase();

        if ( this.commands.has(command) ) {
            this.commands.get(command).exec(msg, ...args)
        }
    }

    addCommand(command: Command) {
        this.commands.set(command.name(), command);
    }

    async ready() {
        console.log('discord bot ready');
    }

    async fetchUser(id: string): Promise<User> {
        return await this.client.fetchUser(id);
    }
}

export default new Discord();
