import { EventBus } from "../EventBus";
import { Spacefield } from "../scenes/Spacefield";

export { Asteroid, Asteroids };

class Asteroid extends Phaser.GameObjects.Sprite
{
    speed: number = 200;
    manager: Asteroids;

    constructor (scene: Spacefield, x: number, y: number, manager: Asteroids)
    {
        super(scene, x, y, 'small-asteroid');
        this.setOrigin(0.5, 0.5);


        scene.physics.world.enable(this);
        if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setCircle(16);
        }

        this.manager = manager;
    }

    preUpdate(time: number, delta: number)
    {
        super.preUpdate(time, delta);

        if (this.y > this.scene.cameras.main.height)
        {
            this.despawn();
        } else {
            this.y += this.speed * delta / 1000;
        }
    }

    despawn()
    {
        this.manager.onDespawn();
        this.setActive(false).setVisible(false);
    }
}


interface AsteroidSpawnConfig {
    type: string; // Type of spawn
    quantity?: number;       // Number of asteroids to spawn (default: 1)
}

class Asteroids extends Phaser.GameObjects.Group
{
    lastSpawnTime: number = 0;
    isSpawnActive: boolean = false;
    spawnRate: number = 2;
    spawnJitter: number = 0;
    nextSpawnTime: number = 0;
    scene: Phaser.Scene;

    spawnCount: number = 0;
    despawnCount: number = 0;

    constructor(scene: Phaser.Scene)
    {
        super(scene);

        this.createMultiple({
            classType: Asteroid,
            frameQuantity: 20,
            active: false,
            visible: false,
            key: 'asteroid',
        });
        // Manually set the manager property for each Asteroid
        this.children.iterate((asteroid: Phaser.GameObjects.GameObject) => {
            if (asteroid instanceof Asteroid) {
                asteroid.manager = this; // Set the parent manager
                return true;
            }
            return false;
        });
    }
    getDeadAsteroids(count: number = 3): Asteroid[] {
        // Retrieve all children and filter for inactive Asteroids
        const deadAsteroids = this.getChildren()
            .filter((child) => child instanceof Asteroid && !child.active) as Asteroid[];
    
        // Return the first `count` dead Asteroids
        return deadAsteroids.slice(0, count);
    }

    spawnAsteroid(x: number, y: number, config: AsteroidSpawnConfig)
    {
        this.spawnCount++;

        const { type = 'single', quantity = 1 } = config; // Destructure config with default quantity

        if (type == 'single'){

            const asteroid = this.getFirstDead(false);

            if (asteroid)
            {
                asteroid.setPosition(x, y);
                asteroid.setActive(true);
                asteroid.setVisible(true);
            }
        } else if (type == 'line') {
            const deadAsteroids = this.getDeadAsteroids(3);
            deadAsteroids.forEach((asteroid, index) => {
                asteroid.setPosition(x + (index * 25 ) - 25, y);
                asteroid.setActive(true);
                asteroid.setVisible(true); 
            })
        }

    }

    // This is basically idential to coins and I should make a generic class for flying objects
    setSpawnRate(seconds: number)
    {
        this.spawnRate = seconds;
    }

    onDespawn()
    {
        this.despawnCount++;
        if (this.despawnCount == 3)
        {
            EventBus.emit('3-asteroids-dodged');
        }
    }

    update(time: number)
    {
        
        if (this.isSpawnActive){
            if (!this.lastSpawnTime) {
                this.lastSpawnTime = time;
            }

            const spawnRateMS = this.spawnRate * 1000;
            const spawnJitterMS = this.spawnJitter * 1000;

            if (time > this.nextSpawnTime) {
                let asteroidType = 'single';
                if (this.spawnCount == 3 ) asteroidType = 'line';
                this.spawnAsteroid(Phaser.Math.Between(50, 550), 0, {type: asteroidType});
                this.lastSpawnTime = time;
                this.nextSpawnTime = time + Phaser.Math.Between(-spawnJitterMS, spawnJitterMS) + spawnRateMS;
            } 
        }
    }
}