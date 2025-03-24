import { playerManager } from '@/game/managers/PlayerManager';
import { EventBus } from '../game/EventBus';

export class SimulatedHRM {

    currentValue: number;

    constructor() {
        this.currentValue = 60;


        EventBus.addListener('raise-hr', this.raiseHR, this);
        EventBus.addListener('lower-hr', this.lowerHR, this);
        // Need to use an arrow function so it will inherit the parent scope
        setInterval(() => this.emitRandomValue(), 2000);

    }

    raiseHR() {
        this.currentValue += 1;
        EventBus.emit('newHeartRate', this.currentValue);
    }

    lowerHR()
    {
        this.currentValue -= 5;
    }

    private emitRandomValue(){
        let adjustment = Phaser.Math.Between(-5, 5);
        let newValue = this.currentValue + adjustment;
        if (newValue < playerManager.restingHR) newValue = playerManager.restingHR;
        this.currentValue = newValue;
        EventBus.emit('newHeartRate', this.currentValue )

    }
}