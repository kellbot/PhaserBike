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
        this.currentValue = this.currentValue + adjustment;
        EventBus.emit('newHeartRate', this.currentValue )

    }
}