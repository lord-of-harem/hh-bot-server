import Command from './Command';
import PlayerManager from '../PlayerManager';
import Player from "../Player";
import {PlayerDay} from "../models/PlayerDay";

export default class StatCommand extends Command
{
    constructor(pm: PlayerManager) {
        super(pm);
    }

    name(): string {
        return 'stat';
    }

    async exec(msg) {
        let response = await this.getStatMessage(msg.author.id);

        if ( response === '' ) {
            response = `Je n'ai malheureusement aucune statistiques pour aujourd'hui.`;
        }

        msg.reply(response);
    }

    public async getStatMessage(discordId: string): Promise<string> {
        const p: Player = await this.pm.getPlayerDiscord(discordId);
        const day: PlayerDay = await p.getCurrentDay();

        let response = '';

        function newLine() {
            if ( response !== '' ) {
                response += "\n";
            }
        }

        if ( day.harem.nbCollect !== 0 ) {
            newLine();
            response += `J'ai réalisé ${day.harem.nbCollect.toLocaleString('fr-BE')} collectes pour un total de ${day.harem.money.toLocaleString('fr-BE')} $`;
        }

        if ( day.boss.nbBattle !== 0 ) {
            newLine();
            let loose = '';
            let reward = '';

            if ( day.boss.nbBattleLoose !== 0 ) {
                loose = ` malheureusement j'ai perdu ${day.boss.nbBattleLoose} fois`;
            }

            if ( day.boss.reward.length !== 0 ) {
                reward = ` Ainsi que les récompenses suivantes:${this.reward(day.boss.reward)}`;
            }

            response += `J'ai combatu les boss ${day.boss.nbBattle.toLocaleString('fr-BE')} fois${loose}. J'ai remporté un total de ${day.boss.money.toLocaleString('fr-BE')} $.${reward}`;
        }

        if ( day.pvp.nbBattle !== 0 ) {
            newLine();
            let loose = '';
            let reward = '';

            if ( day.pvp.nbBattleLoose !== 0 ) {
                loose = `, malheureusement j'ai perdu ${day.pvp.nbBattleLoose} fois`;
            }

            if ( day.pvp.reward.length !== 0 ) {
                reward = ` Ainsi que les récompenses suivantes:${this.reward(day.pvp.reward)}`;
            }

            response += `J'ai combatu en pvp ${day.pvp.nbBattle.toLocaleString('fr-BE')} fois${loose}. J'ai remporté un total de ${day.pvp.money.toLocaleString('fr-BE')} $, ${day.pvp.xp} xp et ${day.pvp.mojo} mojo.${reward}`;
        }

        return response;
    }

    private reward(rewards: any[]) {
        let index = 0;
        const indexDelete = [];
        let total = 0;

        for ( const reward of rewards ) {
            let cIndex = 0;

            if ( !reward.hasOwnProperty('quantity') ) {
                reward.quantity = 1;
            }

            total += parseInt(reward.price_sell, 10);

            for ( const cReward of rewards ) {
                if ( cIndex <= index || indexDelete.find(i => cIndex === i) ) {
                    cIndex++;
                    continue;
                }

                if ( reward.id_item === cReward.id_item ) {
                    reward.quantity++;
                    indexDelete.push(cIndex);
                }

                cIndex++;
            }

            index++;
        }

        indexDelete
            .sort((n1, n2) => n1 - n2)
            .forEach((index, i) => {
                rewards.splice(index - i, 1);
            })
        ;

        let result = '';

        for ( const reward of rewards ) {
            result += `\n${reward.quantity} x ${reward.name} ${reward.rarity} à une valeur de revente de ${reward.price_sell.toLocaleString('fr-BE')} $`;
        }

        return result + `\nPour une valeur totale de ${total.toLocaleString('fr-BE')} $`;
    }
}
