import PlayerManager from './PlayerManager';
import { Service } from './Player';
import discord from './Discord';
import StartCommand from "./discord/StartCommand";
import Harem from "./discord/services/harem";
import StopCommand from "./discord/StopCommand";
import RestartCommand from "./discord/RestartCommand";
import StatusCommand from "./discord/StatusCommand";

/*
PlayerManager
    .register('test', 'test')
    .catch(console.error)
    .then(() => {
        console.log('stop');
        PlayerManager.stopService('', Service.Harem);

        setTimeout(() => {
            PlayerManager.startService('', Service.Harem);
            console.log('start');
        }, 20000);
    })
;*/

let c;

c = new StartCommand();
c.addService(new Harem());
discord.addCommand(c);

c = new StopCommand();
c.addService(new Harem());
discord.addCommand(c);

c = new RestartCommand();
c.addService(new Harem());
discord.addCommand(c);

c = new StatusCommand();
c.addService(new Harem());
discord.addCommand(c);
