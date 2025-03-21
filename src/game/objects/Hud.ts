import { EventBus } from "../EventBus";

export { Hud };
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

        EventBus.on('coinCaptured', this.updateCoinDisplay, this);
        EventBus.on('active-tool-changed', this.updateToolDisplay, this);
    }

    updateCoinDisplay(coin: any) {
        this.coinCount++;
        this.coinDisplay.setText(this.coinCount.toString().padStart(6, '0'));
    }

    updateToolDisplay(tool: string) {
        this.toolDisplay.setText('Tool: ' + tool);
    }
    setHeartRate(heartRate: number) {
        this.heartRateDisplay.setText('❤️ '+ heartRate.toString());
    }
}
