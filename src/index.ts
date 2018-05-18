import PlayerManager from './PlayerManager';
import { Service } from './Player';

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
;
