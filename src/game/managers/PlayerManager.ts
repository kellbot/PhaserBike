import { EventBus

 } from "../EventBus";
class PlayerManager {

    coinCount: number; 
    restingHR: number;
    maxHR: number;

    enemyDistance: number = 0;

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

    getZoneMin(zone: number)
    {
        return this.maxHR * (40 + zone * 10) / 100;
    }

    getZoneMax(zone: number)
    {
        return this.maxHR * (50 + zone * 10) / 100;
    }
}

export const playerManager = new PlayerManager();
