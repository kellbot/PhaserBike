import { EventBus

 } from "../EventBus";
class PlayerManager {

    coinCount: number; 

    constructor()
    {
        this.coinCount = 0;
    }

    addCoins(quantity: number)
    {
        this.coinCount = this.coinCount + quantity;
        EventBus.emit('coinScoreUpdate', this.coinCount);
        return this.coinCount;
    }
}

export const playerManager = new PlayerManager();
