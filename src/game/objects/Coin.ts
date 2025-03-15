import { GameObjects } from "phaser";
export { Coin, Coins };

class Coin extends GameObjects.Sprite
{
    captured: boolean = false;

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
        } else if (!this.captured) {
            this.y += 30 * delta / 1000;
        }

    }

    despawn()
    {
        this.setActive(false).setVisible(false);
        this.captured = false;
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

    getClosestCoin(x: number, y: number)
    {
        let closestCoin: Coin = this.getFirstAlive(false);
        let closestDistance = Number.MAX_VALUE;

        let children = this.getChildren();
        children.forEach((child: any) => {
            const coin = child as Coin;
            if (coin.active && coin.visible)
            {
                console.log(coin.x, coin.y);
                const dx = x - coin.x;
                const dy = y - coin.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < closestDistance && !coin.captured)
                {
                    closestDistance = distance;
                    closestCoin = coin;
                }
            }
        });

        return closestCoin;
    }
}