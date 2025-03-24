import { EventBus

 } from "../EventBus";
class PlayerManager {

    coinCount: number; 
    restingHR: number;
    maxHR: number;
    playerHR: number;

    enemyDistance: number = 0;
    enemySpeed: number = 1; // km per second

    playerDistance: number = 0;


    playerBaseSpeed: number = 0.2; // this is different than ship speed, which is about animation speed
    
    targetDuration: number = 10; // minutes
    targetDistance: number = this.targetDuration * 60 * this.enemySpeed; // km

    isHRSpeedActive: boolean = false;

    constructor()
    {
        this.coinCount = 0;

        EventBus.addListener('newHeartRate', (hr: number) =>{ this.playerHR = hr}, this)
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

    getModifiedSpeed()
    {
        if (this.isHRSpeedActive)
        {
            let modifierHR = 1 + this.playerHR / this.maxHR;
            return this.playerBaseSpeed * modifierHR;
        } else {
            return this.playerBaseSpeed;
        }
    }
}

export const playerManager = new PlayerManager();
