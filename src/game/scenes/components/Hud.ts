import { Scene } from "phaser";
import { EventBus } from "../../EventBus";


import { playerManager } from "../../managers/PlayerManager";

export class HudScene extends Scene 
{
    hud: Hud;
    playerHeartRate: number = 0;

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
        EventBus.on('active-tool-changed', this.updateToolDisplay, this);

    }

    handleHeartRateUpdate(heartRate: number) {
        
         this.playerHeartRate = heartRate;
        this.hud.setHeartRate(heartRate);


    }
    updateCoinDisplay() {
        console.log("Updating HUD");
        this.hud.coinDisplay.setText(playerManager.coinCount.toString().padStart(6, '0'));
    }

    updateToolDisplay(tool: string) {
        this.hud.toolDisplay.setText('Tool: ' + tool);
    }
    shutdown() {
        EventBus.off('newHeartRate', this.handleHeartRateUpdate, this);
        EventBus.off('coinScoreUpdate', this.updateCoinDisplay, this);
        EventBus.off('active-tool-changed', this.updateToolDisplay, this);       
    }
}

class Hud extends Phaser.GameObjects.Container {

    coinDisplay: Phaser.GameObjects.Text;
    heartRateDisplay: Phaser.GameObjects.Text;
    toolDisplay: Phaser.GameObjects.Text;
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

        this.coinDisplay = scene.add.text(500, 50, '000000', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.toolDisplay = scene.add.text(300, 50, 'Tool: None', {
            fontFamily: 'Arial Black', fontSize: 20, color: '#ffffff',  
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

    }


    setHeartRate(heartRate: number) {
        this.heartRateDisplay.setText('❤️ '+ heartRate.toString());
    }
}
