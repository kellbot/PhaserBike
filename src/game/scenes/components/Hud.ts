import { Scene } from "phaser";
import { EventBus } from "../../EventBus";


import { playerManager } from "../../managers/PlayerManager";

export class HudScene extends Scene 
{
    hud: Hud;
    playerHeartRate: number = 0;
    elapsedTimeText: Phaser.GameObjects.Text;
    startTime: number;

    constructor()
    {
        super({key: 'HudScene', active: true})
    }

    create()
    {
        this.hud = new Hud(this, 0, 0);
        this.add.existing(this.hud);

        EventBus.on('newHeartRate', this.handleHeartRateUpdate, this)
        
        EventBus.on('coinScoreUpdate', this.updateCoinDisplay, this);

        this.startTime = this.scene.get('Game').sys.game.loop.time;

    }

    handleHeartRateUpdate(heartRate: number) {
        
         this.playerHeartRate = heartRate;
        this.hud.setHeartRate(heartRate);


    }
    updateCoinDisplay() {
        console.log("Updating HUD");
        this.hud.coinDisplay.setText(`$${playerManager.coinCount.toString()}`);
    }

 
    shutdown() {
        EventBus.off('newHeartRate', this.handleHeartRateUpdate, this);
        EventBus.off('coinScoreUpdate', this.updateCoinDisplay, this);  
    }

    update()
    {
        // Calculate the elapsed time since the Game scene started
        const elapsedTime = Math.floor((this.sys.game.loop.time - this.startTime) / 1000);
        const hours = Math.floor(elapsedTime / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((elapsedTime % 3600) / 60).toString().padStart(2, '0');
        const seconds = (elapsedTime % 60).toString().padStart(2, '0');

        // Update the elapsed time text
        this.hud.elapsedTimeText.setText(`${hours}:${minutes}:${seconds}`);
        
        // Update the enemy distance text with 1 digit after the decimal
        this.hud.enemyDistanceText.setText(`Your Speed: 200 \n Enemy Speed: 1000 \n Enemy Distance: ${(playerManager.enemyDistance / 1000).toFixed(1)} km`);
    }
}

class Hud extends Phaser.GameObjects.Container {

    coinDisplay: Phaser.GameObjects.Text;
    heartRateDisplay: Phaser.GameObjects.Text;
    elapsedTimeText: Phaser.GameObjects.Text;
    enemyDistanceText: Phaser.GameObjects.Text;
    coinCount: number = 0;


    constructor(scene: Phaser.Scene, x: number, y: number) {
        super(scene);

        this.scene = scene;
        this.x = x;
        this.y = y;

        this.heartRateDisplay = scene.add.text(100, 50, '❤️ 00', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.coinDisplay = scene.add.text(500, 50, '$0', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.elapsedTimeText = scene.add.text(300, 50, '00:00:00', {
            fontFamily: 'Arial Black', fontSize: 20, color: '#ffffff',  
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.enemyDistanceText = scene.add.text(300, 100, 'Enemy Distance', {
            fontFamily: 'Arial Black', fontSize: 20, color: '#ffffff',  
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

    }


    setHeartRate(heartRate: number) {
        this.heartRateDisplay.setText('❤️ '+ heartRate.toString());
    }
}
