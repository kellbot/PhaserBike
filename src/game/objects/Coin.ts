export { Coin, Coins };

class Coin extends Phaser.GameObjects.Sprite
{
    constructor (scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y, 'coin-spinning');
        this.play('spin');

        this.setVisible(true);
    }

    preUpdate(time: number, delta: number)
    {
        super.preUpdate(time, delta);

        if (this.y > this.scene.cameras.main.height + 32)
        {
            this.setActive(false).setVisible(false);
        } else {
            this.y += 25 * delta / 1000;
        }

    }
}

class Coins extends Phaser.GameObjects.Group
{
    lastSpawnTime: number = 0;
    
    constructor(scene: Phaser.Scene)
    {
        super(scene);

        this.createMultiple({
            classType: Coin,
            frameQuantity: 10,
            active: false,
            visible: false,
            key: 'coin-spinning',
        });

    }

    spawnCoin(x: number, y: number)
    {
        const coin = this.getFirstDead(false);
        if (coin)
        {
            coin.setActive(true).setVisible(true).setPosition(x, y).play('spin');
            coin.update(0, 0);
        }
    }

}