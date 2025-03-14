import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.TileSprite;
    gameText: Phaser.GameObjects.Text;
    ship: Phaser.GameObjects.Container;

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.tileSprite(0,0, 600, 1600, 'space-background').setOrigin(0).setScrollFactor(0,1);
        this.ship = this.add.container(300, 700);
        this.ship.add(this.add.image(0, 0, 'player-ship'));

        this.anims.create({
            key: 'thrust',
            frames: 'green-thrust',
            frameRate: 8,
            repeat: -1
        });

        this.ship.add(this.add.sprite(-3, 30, 'green-thrust').play('thrust'));
        this.ship.add(this.add.sprite(7, 30, 'green-thrust').play('thrust'));


        this.gameText = this.add.text(300, 200, 'Press Spacebar to Grab Coins', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);
    }

    update (time: number, delta: number)
    {
        this.background.tilePositionY -= 0.1;
    }


    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
