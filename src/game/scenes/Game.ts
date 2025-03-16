import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Coins } from '../objects/Coin';
import { Ship } from '../objects/Ship';
import { Hud } from '../objects/Hud';
import { GameBike } from '../GameBike';
import { Asteroids } from '../objects/Asteroid';

export class Game extends Scene
{

    private tutorialStep: number = 0;

    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.TileSprite;
    gameText: Phaser.GameObjects.Text;
    ship: Ship;
    coin: Phaser.GameObjects.Sprite;
    coins: Coins;
    asteroids: Asteroids;
    hud: Hud;
    bike: GameBike = new GameBike();

    asteroidsActive: boolean = false;
    coinsActive: boolean = false;

    nextAsteroidIn: number = 0;

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

        this.anims.create({
            key: 'shipExplode',
            frames: 'explosion',
            frameRate: 16,
            repeat: 0
        });

        this.ship = new Ship(this);
        this.add.existing(this.ship);
      
        this.coins = new Coins(this);

        this.asteroids = new Asteroids(this);

        this.add.existing(this.coins);

        if (this.bike.power == 0) {
            this.gameText = this.add.text(300, 200, 'Start biking to enable thrust', {
                fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
                stroke: '#000000', strokeThickness: 6,
                align: 'center',
                wordWrap: { width: 500, useAdvancedWrap: true }
            }).setOrigin(0.5).setDepth(100);
        }

        this.hud = new Hud(this, 0, 0);
        this.add.existing(this.hud);

        this.physics.add.overlap(this.ship, this.asteroids, this.handleShipAsteroidCollision, undefined, this);


        this.bike.on('bike-started', () =>
            {
                this.ship.enableThrust();
            });

        this.input.keyboard?.on('keydown-SPACE', () =>
            {

                this.ship.useActiveTool(this.coins.getClosestCoin(this.ship.x, this.ship.y));
                if (!this.coinsActive) {
                    this.coinsActive = true;
                    this.coins.lastSpawnTime = this.time.now;
                    this.setTutorialText('Press V to switch to tractor beam');
                    this.tutorialStep = 3;
                    this.ship.enableTool('tractor');
                }
                if (this.tutorialStep == 3 && this.ship.activeTool == 'tractor') {
                    this.setTutorialText('Press V to switch between dodge and tractor beam');
                    this.tutorialStep = 4;
                }
            });

        this.input.keyboard?.on('keydown-V', () =>
            {
                this.ship.cycleTools()
            });

        EventBus.on('thrustEnabled', () => {
            this.setTutorialText('Press Spacebar to Dodge Asteroids');
            this.asteroids.lastSpawnTime = this.time.now;
            this.nextAsteroidIn = 5000;
            this.asteroidsActive = true;
            this.ship.enableTool('dodge');
            this.asteroids.spawnAsteroid(this.ship.x, 0);
        });

        EventBus.on('heart-rate-update', (heartRate: number) => {
            if (this.scene.isActive('Game')) {
             this.hud.setHeartRate(heartRate);
            }
        });

        EventBus.emit('current-scene-ready', this);

    }

    

    update (time: number, delta: number)
    {
        // Scroll the background if thrust is enabled
        if (this.ship.thrustEnabled) {
            this.background.tilePositionY -= 0.05;
        }
        this.coins.preUpdate(time, delta);
        this.asteroids.preUpdate(time, delta);

        if (this.coinsActive){
            if (!this.coins.lastSpawnTime) {
                this.coins.lastSpawnTime = time;
            }

            if (time - this.coins.lastSpawnTime > Math.random() * 2000 + 2500) {
                this.coins.spawnCoin(Phaser.Math.Between(50, 550), 0);
                this.coins.lastSpawnTime = time;
            }
        }

        if (this.ship.isToolEnabled('gun') && time - this.ship.lastFireTime > 1000 / this.ship.rateOfFire) {
            this.ship.fire();
            this.ship.lastFireTime = time;
        }
        
        if (this.asteroidsActive) {
            if (time - this.asteroids.lastSpawnTime > this.nextAsteroidIn){
   
                let xValues = [];
                for (let i = -1; i <= 1; i++) {
                    xValues.push(this.ship.x + i *50);
                }


                let spawnX = Phaser.Math.RND.pick(xValues);
  
                this.asteroids.spawnAsteroid(spawnX, 0);
                this.asteroids.lastSpawnTime = time;
                this.nextAsteroidIn = Phaser.Math.Between(1, 5) * 1000;
            }
        }

        this.ship.update(time, delta);
    }

    handleShipAsteroidCollision(ship: any, asteroid: any)
    {
        this.ship.blowUp();
        //this.scene.start('GameOver');
    }

    setTutorialText(text: string)
    {
        this.gameText.setText(text);
    }

}
