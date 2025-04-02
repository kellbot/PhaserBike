import { GameObjects } from "phaser";
import { EventBus } from "../EventBus";
import { spawn } from "child_process";
import { playerManager } from "../managers/PlayerManager";
export { Coin, Coins };

class Coin extends GameObjects.Sprite
{
    captured: boolean = false;
    speed: number = 50;

    constructor (scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y, 'coin-spinning');
        this.play('spin');

        this.setVisible(true);

        scene.physics.world.enable(this);
        if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setCircle(12);
            // Adjust the hitbox to be a few pixels down and to the right
            this.body.setOffset(5, 5);
        }
    }

    preUpdate(time: number, delta: number)
    {
        super.preUpdate(time, delta);

        if (this.y > this.scene.cameras.main.height + 32)
        {
            this.setActive(false).setVisible(false);
        } else if (!this.captured) {
            this.y += this.speed * delta / 1000;
        }

    }

    captureSuccess()
    {
        EventBus.emit('coinCaptured', this);
        this.despawn();
    }

    despawn()
    {
        this.setActive(false).setVisible(false);
        this.captured = false;
        this.setPosition(-50, -50);
        
    }
}

class Coins extends Phaser.GameObjects.Group
{
    lastSpawnTime: number = 0;
    isSpawnActive: boolean = false;
    spawnRate: number; // in seconds
    spawnJitter: number = 0; // variability, in seconds
    nextSpawnTime: number = 0; // The next time to spawn a coin
    
    constructor(scene: Phaser.Scene)
    {
        super(scene);

        this.createMultiple({
            classType: Coin,
            quantity: 10,
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
                this.spawnCoin(Phaser.Math.Between(50, 550), playerManager.hudHeight);
                this.lastSpawnTime = time;
                this.nextSpawnTime = time + Phaser.Math.Between(-spawnJitterMS, spawnJitterMS) + spawnRateMS;
            } 
        }
    }
}