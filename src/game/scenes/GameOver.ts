import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameOverText : Phaser.GameObjects.Text;

    constructor ()
    {
        super('GameOver');
    }

    create ()
    {
        this.camera = this.cameras.main
        this.camera.setBackgroundColor(0xff0000);

        this.background = this.add.image(300, 400, 'space-background');
        this.background.setAlpha(0.5);

        this.gameOverText = this.add.text(300, 300, 'Thanks, Obama.', {
            fontFamily: 'Arial Black', fontSize: 32, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        this.addRestartButton();

        EventBus.emit('current-scene-ready', this);
    }

    addRestartButton() {
        const restartButton = this.add.text(300, 400, 'Try Again?', {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            backgroundColor: '#000000', stroke: '#ffffff', padding: { x: 10, y: 5 },
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        restartButton.on('pointerdown', () => {
            this.restartGame();
        });
    }

    restartGame() {
        // Stop the current game scene
        this.scene.stop('Game');

        // Start a new instance of the game scene
        this.scene.start('Game');
    }
}
