import PlayerManager from './PlayerManager';
import { Service } from './Player';
import discord from './Discord';
import StartCommand from "./discord/StartCommand";

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

discord.addCommand(new StartCommand());
