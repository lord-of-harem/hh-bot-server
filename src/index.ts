import PlayerManager from './PlayerManager';
import { Service } from './Player';
import discord from './Discord';
import StartCommand from "./discord/StartCommand";
import Harem from "./discord/services/harem";
import StopCommand from "./discord/StopCommand";
import RestartCommand from "./discord/RestartCommand";
import StatusCommand from "./discord/StatusCommand";
import Boss from "./discord/services/boss";
import Pachinko from "./discord/services/pachinko";
import Pvp from "./discord/services/pvp";
import Quest from "./discord/services/quest";
import Shop from "./discord/services/shop";

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
c.addService(Harem);
c.addService(Boss);
c.addService(Pachinko);
c.addService(Pvp);
c.addService(Quest);
c.addService(Shop);
discord.addCommand(c);

c = new StopCommand();
c.addService(Harem);
c.addService(Boss);
c.addService(Pachinko);
c.addService(Pvp);
c.addService(Quest);
c.addService(Shop);
discord.addCommand(c);

c = new RestartCommand();
c.addService(Harem);
c.addService(Boss);
c.addService(Pachinko);
c.addService(Pvp);
c.addService(Quest);
c.addService(Shop);
discord.addCommand(c);

c = new StatusCommand();
c.addService(Harem);
c.addService(Boss);
c.addService(Pachinko);
c.addService(Pvp);
c.addService(Quest);
c.addService(Shop);
discord.addCommand(c);
