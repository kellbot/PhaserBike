import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Coins } from '../objects/Coin';
import { Ship } from '../objects/Ship';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.TileSprite;
    gameText: Phaser.GameObjects.Text;
    ship: Ship;
    coin: Phaser.GameObjects.Sprite;
    coins: Coins;

    constructor ()
    {
        super('Game');

    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.tileSprite(0,0, 600, 1600, 'space-background').setOrigin(0).setScrollFactor(0,1);

        this.anims.create({
            key: 'pulse',
            frames: 'green-thrust',
            frameRate: 8,
            repeat: -1
        });

        this.anims.create({
            key: 'spin',
            frames: 'coin-spinning',
            frameRate: 8,
            repeat: -1
        });

        this.ship = new Ship(this);
        this.add.existing(this.ship);
      
        this.coins = new Coins(this);//this.add.sprite(200, 400, 'coin-spinning').play('spin');
        this.coins.spawnCoin(200, 400);

        this.add.existing(this.coins);



        this.gameText = this.add.text(300, 200, 'Press Spacebar to Grab Coins', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);

        this.input.keyboard?.on('keydown-SPACE', () =>
            {
                this.ship.capture(this.coins.getClosestCoin(this.ship.x, this.ship.y));
            });
    }

    update (time: number, delta: number)
    {
        this.background.tilePositionY -= 0.05;
        this.coins.preUpdate(time, delta);

        if (!this.coins.lastSpawnTime) {
            this.coins.lastSpawnTime = time;
        }

        if (time - this.coins.lastSpawnTime > Math.random() * 2000 + 2500) {
            this.coins.spawnCoin(Phaser.Math.Between(50, 550), 0);
            this.coins.lastSpawnTime = time;
        }

        this.ship.update(time, delta);
    }

    changeScene ()
    {
        // this.scene.start('GameOver');
    }
}
