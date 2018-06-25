import {Client} from 'discord.js';
import Command from './models/Command';

class Discord
{
    private client;
    private commands: Map<string, Command> = new Map();

    constructor() {
        this.client = new Client();
        this.client
            .on('message', msg => this.message(msg))
            .on('ready', () => console.log('discord bot ready'))
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
}

export default new Discord();
