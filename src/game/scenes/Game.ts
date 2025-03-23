import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Coins } from '../objects/Coin';
import { Ship } from '../objects/Ship';
import { Planet } from '../objects/Planet';
import { HudScene } from './components/Hud';
import { Asteroids } from '../objects/Asteroid';
import { ProgressionManager, TutorialStep } from '../managers/ProgressionManager'
import { playerManager } from '../managers/PlayerManager';

export class Game extends Scene
{

    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.TileSprite;
    gameText: Phaser.GameObjects.Text;
    ship: Ship;
    coin: Phaser.GameObjects.Sprite;
    coins: Coins;
    asteroids: Asteroids;

    asteroidsActive: boolean = false;
    coinsActive: boolean = false;

    planet: Planet;

    nextAsteroidIn: number = 0;

    playerHeartRate: number = 0;
    tutorialManager: ProgressionManager;
    activeTutorial: TutorialStep;

    constructor ()
    {
        super('Game');

    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.tileSprite(0,0, 600, 1600, 'space-background').setOrigin(0).setScrollFactor(0,1);

        // Start the HudScene and keep it active
        this.scene.launch('HudScene');

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


        // Set up the shop planet
        this.planet = new Planet(this, 300, 300 )
        this.add.existing(this.planet);
        this.planet.setVisible(false);
        this.planet.setActive(false);

        this.physics.add.overlap(this.ship, this.planet, this.handleShipPlanetCollision, undefined, this)


        // Initialize the progression manager
        this.tutorialManager = new ProgressionManager(this);
        


        
        const tutorialText = this.tutorialManager.activeStep ? this.tutorialManager.activeStep.getText() : '';
            this.gameText = this.add.text(300, 200, tutorialText, {
                fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
                stroke: '#000000', strokeThickness: 6,
                align: 'center',
                wordWrap: { width: 500, useAdvancedWrap: true }
            }).setOrigin(0.5).setDepth(100);



        this.physics.add.overlap(this.ship, this.asteroids, this.handleShipAsteroidCollision, undefined, this);

        this.input.keyboard?.on('keydown-SPACE', () =>
            {

                this.ship.useActiveTool(this.coins.getClosestCoin(this.ship.x, this.ship.y));
                if (!this.coinsActive) {
                    this.coinsActive = true;
                    this.coins.lastSpawnTime = this.time.now;

                    this.ship.enableTool('Tractor Beam');
                }

            });

        this.input.keyboard?.on('keydown-V', () =>
            {
                this.ship.cycleTools()
            });


        EventBus.on('tutorial-updated', this.setTutorialText, this);
        EventBus.on('newHeartRate', () =>
        {
            if (!this.ship.thrustEnabled) this.ship.enableThrust();
        }
        );
        EventBus.on('coinCaptured', function() {
            playerManager.addCoins(1);
        } );
        EventBus.on('launchShop', () =>
        {
            this.planet.setActive(true);
            this.planet.setVisible(true);


        }
        );



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

            if (time - this.coins.lastSpawnTime > Math.random() * 3000 + 2500) {
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

        this.planet?.update(time, delta);
        this.ship.update(time, delta);
    }

    // Remove event listeners when the scene is paused
    pause() {
        EventBus.off('tutorial-updated', this.setTutorialText, this);
    }

    // Remove event listeners when the scene is stopped
    shutdown() {
        EventBus.off('tutorial-updated', this.setTutorialText, this);
    }

    // I don't know why it complains if I specify Ship and Planet types
    handleShipPlanetCollision(ship: any, planet: any){
        this.scene.pause();
        this.scene.start('Shop');
    }

    handleShipAsteroidCollision(ship: any, asteroid: any)
    {
        this.ship.blowUp();
    }

    setTutorialText(step: TutorialStep)
    {
        if (step?.text) this.gameText.setText(step.text);
    }

}
