
export interface Battle {
    nbBattle: number;
    nbBattleLoose: number;
    money: number;
    xp: number;
    mojo: number;
    reward: Array<any>;
}

export interface PlayerDay {
    _id: string;
    date: Date;
    harem: {
        nbCollect: number;
        money: number;
    };
    boss: Battle;
    pvp: Battle;
}
