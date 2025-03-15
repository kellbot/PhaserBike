export { Bullet, Bullets };

class Bullet extends Phaser.Physics.Arcade.Sprite
{
    constructor (scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y, 'bullet');
        this.play('bulletPulse');
    }

    fire (x: number, y: number)
    {
        if (!this.body) return;
        this.body.reset(x, y);

        this.setActive(true);
        this.setVisible(true);

        this.setVelocityY(-300);
    }

    preUpdate (time: number, delta: number)
    {
        super.preUpdate(time, delta);

        if (this.y <= -32)
        {
            this.setActive(false);
            this.setVisible(false);
        }
    }
}

class Bullets extends Phaser.Physics.Arcade.Group
{
    constructor (scene: Phaser.Scene)
    {
        super(scene.physics.world, scene);

        this.createMultiple({
            frameQuantity: 5,
            key: 'bullet',
            active: false,
            visible: false,
            classType: Bullet
        });
    }

    fireBullet (x: number, y: number)
    {
        const bullet = this.getFirstDead(false);

        if (bullet)
        {
            bullet.fire(x, y);
        }
    }
}