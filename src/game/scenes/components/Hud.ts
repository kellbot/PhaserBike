import { Scene } from "phaser";
import { EventBus } from "../../EventBus";


import { playerManager } from "../../managers/PlayerManager";

export class HudScene extends Scene 
{
    hud: Hud;
    playerHeartRate: number = 0;
    elapsedTimeText: Phaser.GameObjects.Text;
    startTime: number;
    distanceTrack: Phaser.GameObjects.Graphics;
    redDot: Phaser.GameObjects.Graphics;
    greenDot: Phaser.GameObjects.Graphics;
    enemyDistanceText: Phaser.GameObjects.Text;
    playerSpeedText: Phaser.GameObjects.Text;

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

        EventBus.on('game-scene-loaded', this.addDistanceTrack, this);
    }

    addDistanceTrack()
    {
        this.distanceTrack = this.add.graphics();
        this.distanceTrack.fillStyle(0x333333, 1); // Set to dark gray
        this.distanceTrack.fillRect(this.scale.width - 20, 0, 20, this.scale.height);
        this.distanceTrack.setDepth(50); // Ensure it is on top

        // Draw a light gray vertical line, 10 pixels wide, down the middle of distanceTrack
        const lineX = this.scale.width - 15; // Middle of the 20-pixel wide distanceTrack
        this.distanceTrack.fillStyle(0xCCCCCC, 1); // Set to light gray
        this.distanceTrack.fillRect(lineX, 10, 10, this.scale.height - 20); // 10 pixels wide, starting 10 pixels below the top and ending 10 pixels above the bottom

        // Add a red dot to the distanceTrack
        this.redDot = this.add.graphics();
        this.redDot.setDepth(101); // Ensure it is on top of the distanceTrack
        this.enemyDistanceText = this.add.text(this.scale.width - 10, this.scale.height - 10, '', {
            fontFamily: 'Arial', fontSize: 10, color: '#ffffff', 
            align: 'center'
        });
        this.greenDot = this.add.graphics().setDepth(99);
        
        this.enemyDistanceText.setDepth(105).setOrigin(0.5, 0.5);

        this.playerSpeedText = this.add.text(this.scale.width - 30, this.scale.height - 20, this.formatPlayerSpeed(playerManager.playerSpeed),
            {
                 fontFamily: 'Arial', fontSize: 10, color: '#ffffff', stroke: '#000000', strokeThickness: 1,
            align: 'right'
            }
        ).setOrigin(1, 0.5);

        this.enableDistanceTrack();
    }

    enableDistanceTrack()
    {
        if (this.distanceTrack) {
            this.distanceTrack.setVisible(true);
        }
    }

    disableDistanceTrack()
    {
        if (this.distanceTrack) {
            this.distanceTrack.setVisible(false);
        }
    }

    handleHeartRateUpdate(heartRate: number) {
        
        this.playerHeartRate = heartRate;
        this.hud.setHeartRate(heartRate);


    }
    updateCoinDisplay() {
        this.hud.coinDisplay.setText(`$${playerManager.coinCount.toString()}`);
    }

 
    shutdown() {
        EventBus.off('newHeartRate', this.handleHeartRateUpdate, this);
        EventBus.off('coinScoreUpdate', this.updateCoinDisplay, this);  
        EventBus.off('game-scene-loaded', this.addDistanceTrack, this);
    }

    update(time: number, delta: number)
    {
        // Calculate the elapsed time since the Game scene started
        const elapsedTime = Math.floor((time - this.startTime) / 1000);
        const hours = Math.floor(elapsedTime / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((elapsedTime % 3600) / 60).toString().padStart(2, '0');
        const seconds = (elapsedTime % 60).toString().padStart(2, '');

        // Update the elapsed time text
        this.hud.elapsedTimeText.setText(`${hours}:${minutes}:${seconds}`);
        
      this.updateDistanceTrack(time, delta);


    }
    formatPlayerSpeed(speed: number){
        let units = 'km/s';
        let speedStr = speed.toString();
        if (speed < 1) {
            units = 'm/s';
            speedStr = (speed * 1000).toString();
        } else if (speed < 1000) {
            speedStr = speed.toFixed(1).toString();
        }
        return `Your Speed: ${speedStr} ${units}`;
      }

    updateDistanceTrack(time: number, delta: number)
    {
        if (this.redDot){
            // Move the red dot from the bottom to the top over 30 minutes
            const totalDuration = playerManager.targetDuration * 60000; // 30 minutes in milliseconds
            
            // The enemy moves at a fixed rate towards the end of the track
            const enemyProgress = Math.min((time - this.startTime) / totalDuration, 1); // Ensure progress does not exceed 1
            
            // the player moves based on their distance
            const playerProgress = Math.min((playerManager.playerDistance / playerManager.targetDistance), 1);

            const enemyY = this.scale.height - 10 - (this.scale.height - 20) * enemyProgress;
            const playerY = this.scale.height - 10 - (this.scale.height - 20) * playerProgress;

            // Clear and redraw the red dot at the new position
            this.redDot.clear();
            this.redDot.fillStyle(0xFF0000, 1); // Set to red
            this.redDot.fillCircle(this.scale.width - 10, enemyY, 12); // 18 pixels wide
       
            // Clear and redraw the green dot at the new position
            this.greenDot.clear();
            this.greenDot.fillStyle(0x44CC22, 1);
            this.greenDot.fillCircle(this.scale.width - 10, playerY, 12);

            this.enemyDistanceText.setY(enemyY);  
            this.enemyDistanceText.setText(`${(playerManager.enemyDistance/1000).toFixed(1)}\nkm`);

            this.playerSpeedText.setText(this.formatPlayerSpeed(playerManager.playerSpeed));
        }
       
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

    }


    setHeartRate(heartRate: number) {
        this.heartRateDisplay.setText('❤️ '+ heartRate.toString());
    }
}
