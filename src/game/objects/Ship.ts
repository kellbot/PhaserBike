import { Bullets } from './Bullet';
import { EventBus } from '../EventBus';


export { Ship };

class Ship extends Phaser.GameObjects.Container
{
    heldItem: any;
    tractorBeam:  Phaser.GameObjects.Graphics = this.scene.add.graphics();
    bullets: Bullets;

    // Initially these are all locked to the player
    thrustEnabled: boolean = false;
    tractorEnabled: boolean = false;
    gunEnabled: boolean = false;
    shieldEnabled: boolean = false;

    rateOfFire: number = 0.5; // in shots per second
    lastFireTime: number = 0;
    
    constructor (scene: Phaser.Scene)
    {
        super(scene, 300, 700);
        this.add(scene.add.image(0, 0, 'player-ship'));

        this.bullets = new Bullets(scene);
    }

    enableThrust(){
        this.thrustEnabled = true;
        this.add(this.scene.add.sprite(-3, 30, 'green-thrust').play('pulse'));
        this.add(this.scene.add.sprite(7, 30, 'green-thrust').play('pulse'));
        EventBus.emit('thrustEnabled');

    }

    capture(item: any)
    {
        // you can only capture one item at a time
        if (this.heldItem) {
            return;
        }
        if (item) {
            this.heldItem = item;
            item.captured = true;
        }
    }

    fire() 
    { 
        this.bullets.fireBullet(this.x, this.y - 20);
    }

    update(time: number, delta: number): void {
        if (this.heldItem) {
                let child = this.heldItem;
                const dx = this.x - child.x;
                const dy = this.y - child.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 5) {
                    const angle = Math.atan2(dy, dx);
                    child.x += Math.cos(angle) * 0.1 * delta;
                    child.y += Math.sin(angle) * 0.1 * delta;

                    this.tractorBeam.clear();
                    this.tractorBeam.lineStyle(4, 0x5533CC, 1);
                    this.tractorBeam.beginPath();
                    this.tractorBeam.moveTo(this.x, this.y);
                    this.tractorBeam.lineTo(child.x, child.y);
                    this.tractorBeam.closePath();
                    this.tractorBeam.strokePath();
                } else {
                    this.heldItem.captureSuccess();
                    this.heldItem = null;
                    this.tractorBeam.clear();
                }
            }
        }
}

