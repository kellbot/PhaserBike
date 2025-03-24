import { playerManager } from '@/game/managers/PlayerManager';
import { EventBus } from '../game/EventBus';

export class SimulatedHRM {

    currentValue: number;

    constructor() {
        this.currentValue = 60;

        // Need to use an arrow function so it will inherit the parent scope
        setInterval(() => this.emitRandomValue(), 2000);

    }

    private emitRandomValue(){
        let adjustment = Phaser.Math.Between(-5, 5);
        let newValue = this.currentValue + adjustment;
        if (newValue < playerManager.restingHR) newValue = playerManager.restingHR;
        this.currentValue = newValue;
        EventBus.emit('newHeartRate', this.currentValue )

    }
}