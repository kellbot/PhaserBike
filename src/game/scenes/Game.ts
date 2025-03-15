import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Coins } from '../objects/Coin';
import { Ship } from '../objects/Ship';
import { Hud } from '../objects/Hud';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.TileSprite;
    gameText: Phaser.GameObjects.Text;
    ship: Ship;
    coin: Phaser.GameObjects.Sprite;
    coins: Coins;
    hud: Hud;

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
            key: 'bulletPulse',
            frames: 'bullet',
            frameRate: 8,
            repeat: -1
        });

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
      
        this.coins = new Coins(this);
        this.coins.spawnCoin(200, 400);

        this.add.existing(this.coins);

        this.gameText = this.add.text(300, 200, 'Press C to enable thrust', {
            fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
            stroke: '#000000', strokeThickness: 6,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.hud = new Hud(this, 0, 0);
        this.add.existing(this.hud);

        EventBus.emit('current-scene-ready', this);

        this.input.keyboard?.on('keydown-C', () =>
            {
                this.ship.enableThrust();
            });

        this.input.keyboard?.on('keydown-SPACE', () =>
            {
                this.ship.capture(this.coins.getClosestCoin(this.ship.x, this.ship.y));
            });

        EventBus.on('thrustEnabled', () => {
            this.gameText.setText('Press Spacebar to Collect Coins');
        });
    }

    

    update (time: number, delta: number)
    {
        // Scroll the background if thrust is enabled
        if (this.ship.thrustEnabled) {
            this.background.tilePositionY -= 0.05;
        }
        this.coins.preUpdate(time, delta);

        if (!this.coins.lastSpawnTime) {
            this.coins.lastSpawnTime = time;
        }

        if (time - this.coins.lastSpawnTime > Math.random() * 2000 + 2500) {
            this.coins.spawnCoin(Phaser.Math.Between(50, 550), 0);
            this.coins.lastSpawnTime = time;
        }

        if (this.ship.gunEnabled && time - this.ship.lastFireTime > 1000 / this.ship.rateOfFire) {
            this.ship.fire();
            this.ship.lastFireTime = time;
        }

        this.ship.update(time, delta);
    }

    changeScene ()
    {
        // this.scene.start('GameOver');
    }
}
