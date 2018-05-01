import Game from './Game';
import { Quest } from './models/Quest';
import { Opponent } from './models/Opponent';

export default class Player
{
    private game: Game;
    private username: string;
    private password: string;
    private isLogged = false;
    private girlsMoney: Map<number, number>;
    private quest = null;
    private pvp = null

    constructor(username: string, password: string) {
        this.game = new Game();
        this.username = username;
        this.password = password;
        this.girlsMoney = new Map();
    }

    /**
     * Lance la collecte d'argent dans le harem
     */
    public runHarem() {
        return this.login()
            .then(() => this.game.getHarem())
            .then(girls =>
                girls.forEach(girl => this.getMoney(girl.id, girl.pay_in * 1000))
            )
        ;
    }

    /**
     * Stop la collecte d'argent dans le harem
     */
    public stopHarem() {
        for ( const timeout of this.girlsMoney.values() ) {
            clearTimeout(timeout);
        }
    }

    /**
     * Lance le lancement automatique des quêtes
     * @returns {Promise<T>}
     */
    public runQuest() {
        return this.login()
            .then(() => this.game.getQuests())
            .then(quests => {
                let questRun: Quest | null = null;

                for ( const quest of quests ) {
                    if ( quest.remaining_time !== null && quest.remaining_time > 0 ) {
                        questRun = quest;
                    }
                }

                // Si une mission est en cour
                if ( questRun !== null ) {
                    console.log('wait');
                    this.quest = setTimeout(() => this.runQuest().catch(console.error), questRun.remaining_time * 1000);
                }

                // Si aucune mission n'est en cour
                else {
                    for ( const quest of quests ) {
                        // Si la mission est a executée
                        if ( quest.remaining_time === null ) {
                            return this.launchQuest(quest);
                        }
                    }
                }
            })
        ;
    }

    /**
     * Stop le lancement automatique des quêtes
     */
    public stopQuest() {
        clearTimeout(this.quest);
    }

    /**
     * Lance les combats automatique contre les autres joueurs
     */
    public runPvp() {
        return this.login()
            .then(() => this.game.getPvpOpponents())
            .then(arena => {
                for ( let opponent of arena.opponents ) {
                    if ( opponent.enable ) {
                        this.fight(opponent);
                    }
                }

                this.pvp = setTimeout(() => this.runPvp(), arena.timeout * 1000);
            })
        ;
    }

    /**
     * Stop les combats automatique contre les autres joueurs
     */
    public stopPvp() {
        clearTimeout(this.pvp);
    }

    /**
     * Authentifie le joueur si nécéssaire
     */
    private login() {
        if ( this.isLogged ) {
            return Promise.resolve();
        }

        return this.game.login(this.username, this.password);
    }

    /**
     * Récupère l'argent d'une fille
     * @param girlId
     * @param timeout
     */
    private getMoney(girlId: number, timeout) {
        this.girlsMoney.set(girlId, setTimeout(() => {
                this.game.getMoney(girlId)
                    .then(salary => {
                        this.getMoney(girlId, salary.time * 1000);
                        console.log('Girl ID', girlId, 'Salary', salary.money);
                    })
                    .catch(console.error)
            }, timeout));
    }

    /**
     * Lance une quête
     * @param {Quest} quest
     */
    private launchQuest(quest: Quest) {
        console.log('launch quest');
        return this.game
            .launchQuest(quest)
            .then(() => this.runQuest())
            .catch(console.error)
        ;
    }

    /**
     * Lance un combat contre un adversaire
     */
    private fight(opponent: Opponent) {
        console.log('fight');
        return this.game.fight(opponent)
            .catch(console.error);
    }

}
