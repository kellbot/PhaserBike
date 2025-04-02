import { EventBus } from '../EventBus';
import { Coins } from '../objects/Coin';
import { Ship } from '../objects/Ship';
import { Planet } from '../objects/Planet';
import { Asteroids } from '../objects/Asteroid';
import { ProgressionManager, TutorialStep } from '../managers/ProgressionManager'
import { playerManager } from '../managers/PlayerManager';

export class Spacefield extends Phaser.Scene
{

    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.TileSprite;
    gameText: Phaser.GameObjects.Text;
    ship: Ship;
    coin: Phaser.GameObjects.Sprite;
    coins: Coins;
    asteroidManager: Asteroids;

    asteroidsActive: boolean = false;


    planet: Planet;

    nextAsteroidIn: number = 0;

    tutorialManager: ProgressionManager;
    activeTutorial: TutorialStep;

    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;


    constructor ()
    {
        super('Spacefield');

    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x222222);

        this.background = this.add.tileSprite(0,playerManager.hudHeight, 600, 1600, 'space-background').setOrigin(0).setScrollFactor(0,1);
        // Initialize cursor keys
        if (this.input.keyboard) this.cursors = this.input.keyboard.createCursorKeys();
    

        this.scene.launch('HudScene');

        this.anims.create({
            key: 'bulletPulse',
            frames: 'bullet',
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
        this.add.existing(this.coins);


        this.asteroidManager = new Asteroids(this);

 
        // Set up the shop planet
        this.planet = new Planet(this, 300, 300 )
        this.add.existing(this.planet);
        this.planet.setVisible(false);
        this.planet.setActive(false);

  

        // Initialize the progression manager
        this.tutorialManager = new ProgressionManager(this);
                
        const tutorialText = this.tutorialManager.activeStep ? this.tutorialManager.activeStep.getText() : '';
            this.gameText = this.add.text(300, 100, tutorialText, {
                fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
                stroke: '#000000', strokeThickness: 6,
                align: 'center',
                wordWrap: { width: 500, useAdvancedWrap: true }
            }).setOrigin(0.5).setDepth(100);

        this.physics.world.enableBody(this.ship);

        this.physics.add.overlap(this.ship, this.planet, this.handleShipPlanetCollision, undefined, this)

        this.physics.add.overlap(this.ship, this.asteroidManager, this.handleShipAsteroidCollision, undefined, this);
        this.physics.add.overlap(this.ship, this.coins, this.handleShipCoinCollision, undefined, this);
                  
 

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
        // tools for HRM simulator
        this.input.keyboard?.on('keydown-L', () =>
            {
                EventBus.emit('raise-hr');
            });
            this.input.keyboard?.on('keydown-K', () =>
                {
                    EventBus.emit('lower-hr');
                });
        EventBus.on('tutorial-updated', this.setTutorialText, this);
        this.events.once('update', () => {
            EventBus.emit('game-scene-loaded');
        });
        EventBus.emit('current-scene-ready', this);


    }

    

    update (time: number, delta: number)
    {

        // Ensure ship stays within screen bounds
        if (this.ship.x < 0) {
            this.ship.x = 0;
            this.ship.body.setVelocityX(0);
        } else if (this.ship.x > this.cameras.main.width - 50) {
            this.ship.x = this.cameras.main.width - 50;
            this.ship.body.setVelocityX(0);
        }

        // Handle ship movement
        if (this.cursors.left.isDown) {
            this.ship.body.setVelocityX(-this.ship.speed);
        } else if (this.cursors.right.isDown) {
            this.ship.body.setVelocityX(this.ship.speed);
        } else {
            this.ship.body.setVelocityX(0);
        }

  
        // Increment player distance
        playerManager.playerDistance += delta/1000 * playerManager.getModifiedSpeed();

        // Scroll the background if thrust is enabled
        if (this.ship.thrustEnabled) {
            this.background.tilePositionY -= 0.05;
        }
        this.coins.preUpdate(time, delta);
        this.asteroidManager.preUpdate(time, delta);

        this.asteroidManager.update(time);
        this.coins.update(time);
        this.planet?.update(time, delta);
        this.ship.update(time, delta);

        // Move the enemy ship
        playerManager.enemyDistance += Math.floor(delta * playerManager.enemySpeed);

        // update player speed
        if (playerManager.isHRSpeedActive) {
            
        }
    }


    // I don't know why it complains if I specify Ship and Planet types
    handleShipPlanetCollision(ship: any, planet: any){
        this.scene.pause();
        this.scene.start('Shop');
    }

    handleShipAsteroidCollision(ship: any, asteroid: any)
    {
        this.ship.blowUp();
        this.gameOver();
    }

    handleShipCoinCollision(ship: any, coin: any){
        coin.captureSuccess()
    }

    setTutorialText(step: TutorialStep)
    {
        if (step?.text) this.gameText.setText(step.text);
    }

    gameOver() {
        // Transition to the game over scene
        
        EventBus.off('tutorial-updated', this.setTutorialText, this);
        this.scene.stop('HudScene'); // Stop the HudScene
        this.scene.start('GameOver');
    }

}
