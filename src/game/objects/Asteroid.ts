export { Asteroid, Asteroids };

class Asteroid extends Phaser.GameObjects.Sprite
{
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
            this.y += 50 * delta / 1000;
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
}