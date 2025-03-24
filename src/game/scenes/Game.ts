import { EventBus } from '../EventBus';
import { Coin, Coins } from '../objects/Coin';
import { Ship } from '../objects/Ship';
import { Planet } from '../objects/Planet';
import { HudScene } from './components/Hud';
import { Asteroids } from '../objects/Asteroid';
import { ProgressionManager, TutorialStep } from '../managers/ProgressionManager'
import { playerManager } from '../managers/PlayerManager';

export class Game extends Phaser.Scene
{

    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.TileSprite;
    gameText: Phaser.GameObjects.Text;
    ship: Ship;
    coin: Phaser.GameObjects.Sprite;
    coins: Coins;
    asteroids: Asteroids;

    asteroidsActive: boolean = false;


    planet: Planet;

    nextAsteroidIn: number = 0;

    tutorialManager: ProgressionManager;
    activeTutorial: TutorialStep;

    private cursors: Phaser.Types.Input.Keyboard.CursorKeys;


    constructor ()
    {
        super('Game');

    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.tileSprite(0,0, 600, 1600, 'space-background').setOrigin(0).setScrollFactor(0,1);
        // Initialize cursor keys
        if (this.input.keyboard) this.cursors = this.input.keyboard.createCursorKeys();
    

        // Start the HudScene and keep it active
        this.scene.launch('HudScene');

        // Emit an event to indicate that the Game scene is loaded
        this.events.once('update', () => {
            EventBus.emit('game-scene-loaded');
        });

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


        this.asteroids = new Asteroids(this);

 
        // Set up the shop planet
        this.planet = new Planet(this, 300, 300 )
        this.add.existing(this.planet);
        this.planet.setVisible(false);
        this.planet.setActive(false);

  

        // Initialize the progression manager
        this.tutorialManager = new ProgressionManager(this);
        


        
        const tutorialText = this.tutorialManager.activeStep ? this.tutorialManager.activeStep.getText() : '';
            this.gameText = this.add.text(300, 200, tutorialText, {
                fontFamily: 'Arial Black', fontSize: 28, color: '#ffffff',
                stroke: '#000000', strokeThickness: 6,
                align: 'center',
                wordWrap: { width: 500, useAdvancedWrap: true }
            }).setOrigin(0.5).setDepth(100);

        this.physics.world.enableBody(this.ship);

        this.physics.add.overlap(this.ship, this.planet, this.handleShipPlanetCollision, undefined, this)

        this.physics.add.overlap(this.ship, this.asteroids, this.handleShipAsteroidCollision, undefined, this);
        this.physics.add.overlap(this.ship, this.coins, this.handleShipCoinCollision, undefined, this);
                  
 

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
        playerManager.playerDistance += delta/1000 * playerManager.playerSpeed;

        // Scroll the background if thrust is enabled
        if (this.ship.thrustEnabled) {
            this.background.tilePositionY -= 0.05;
        }
        this.coins.preUpdate(time, delta);
        this.asteroids.preUpdate(time, delta);

        this.asteroids.update(time);
        this.coins.update(time);
        this.planet?.update(time, delta);
        this.ship.update(time, delta);

        // Move the enemy ship
        playerManager.enemyDistance += Math.floor(delta * playerManager.enemySpeed);
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

    handleShipCoinCollision(ship: any, coin: any){
        coin.captureSuccess()
    }

    setTutorialText(step: TutorialStep)
    {
        if (step?.text) this.gameText.setText(step.text);
    }

}
