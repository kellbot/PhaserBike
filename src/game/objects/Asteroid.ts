export { Asteroid, Asteroids };

class Asteroid extends Phaser.GameObjects.Sprite
{
    speed: number = 200;

    constructor (scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y, 'small-asteroid');
        this.setOrigin(0.5, 0.5);


        scene.physics.world.enable(this);
        if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setCircle(16);
        }
    }

    preUpdate(time: number, delta: number)
    {
        super.preUpdate(time, delta);

        if (this.y > this.scene.cameras.main.height + 32)
        {
            this.setActive(false).setVisible(false);
        } else {
            this.y += this.speed * delta / 1000;
        }
    }

    despawn()
    {
        this.setActive(false).setVisible(false);
    }
}

class Asteroids extends Phaser.GameObjects.Group
{
    lastSpawnTime: number = 0;
    isSpawnActive: boolean = false;
    spawnRate: number = 0;
    spawnJitter: number = 0;
    nextSpawnTime: number = 0;

    constructor(scene: Phaser.Scene)
    {
        super(scene);

        this.createMultiple({
            classType: Asteroid,
            frameQuantity: 10,
            active: false,
            visible: false,
            key: 'asteroid',
        });
    }

    spawnAsteroid(x: number, y: number)
    {
        const asteroid = this.getFirstDead(false);

        if (asteroid)
        {
            asteroid.setPosition(x, y);
            asteroid.setActive(true);
            asteroid.setVisible(true);
        }
    }

    // This is basically idential to coins and I should make a generic class for flying objects
    setSpawnRate(seconds: number)
    {
        this.spawnRate = seconds;
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
                this.spawnAsteroid(Phaser.Math.Between(50, 550), 0);
                this.lastSpawnTime = time;
                this.nextSpawnTime = time + Phaser.Math.Between(-spawnJitterMS, spawnJitterMS) + spawnRateMS;
            } 
        }
    }
}