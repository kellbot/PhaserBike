export { GameBike };

class GameBike extends  Phaser.Events.EventEmitter
{
    lastUpdated: number = 0;
    cadence: number = 0;
    power: number = 0; // power in watts

    constructor()
    {
        super();
        this.lastUpdated = Date.now();
    }

    setPower(power: number)
    {
        this.power = power;
        this.emit('bike-started');
        setInterval(() => {
            this.power += Math.floor(Math.random() * 21) - 10;
            this.emit('power-changed', this.power);
        }, 3000);
    }
}