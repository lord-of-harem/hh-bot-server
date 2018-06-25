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
import RegisterCommand from "./discord/RegisterCommand";
import HelpCommand from "./discord/HelpCommand";

const pm = new PlayerManager();

let c;

c = new StartCommand(pm);
c.addService(Harem);
c.addService(Boss);
c.addService(Pachinko);
c.addService(Pvp);
c.addService(Quest);
c.addService(Shop);
discord.addCommand(c);

c = new StopCommand(pm);
c.addService(Harem);
c.addService(Boss);
c.addService(Pachinko);
c.addService(Pvp);
c.addService(Quest);
c.addService(Shop);
discord.addCommand(c);

c = new RestartCommand(pm);
c.addService(Harem);
c.addService(Boss);
c.addService(Pachinko);
c.addService(Pvp);
c.addService(Quest);
c.addService(Shop);
discord.addCommand(c);

c = new StatusCommand(pm);
c.addService(Harem);
c.addService(Boss);
c.addService(Pachinko);
c.addService(Pvp);
c.addService(Quest);
c.addService(Shop);
discord.addCommand(c);

c = new RegisterCommand(pm);
discord.addCommand(c);

c = new HelpCommand(pm);
discord.addCommand(c);
