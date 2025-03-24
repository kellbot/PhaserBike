import { Bullets } from './Bullet';
import { EventBus } from '../EventBus';


const DODGE_TOOL: string = 'Dodge';
const TRACTOR_TOOL: string = 'Tractor Beam';
const GUN_TOOL:string = 'gun';
const SHIELD_TOOL:string = 'shield';

export class Ship extends Phaser.GameObjects.Container
{
    private shipSprite: Phaser.GameObjects.Image;
    private thrustSprites: Phaser.GameObjects.Sprite[] = [];

    // Add movement speed property
    readonly SHIP_SPEED: number = 100; // pixels per second
    
    dodgeTween: Phaser.Tweens.Tween;
    body: Phaser.Physics.Arcade.Body;
    heldItem: any;
    activeTool: string = DODGE_TOOL;
    tractorBeam:  Phaser.GameObjects.Graphics = this.scene.add.graphics();
    bullets: Bullets;

    thrustEnabled: boolean = false;

    // Initially these are all locked to the player
    private tools = {
        [DODGE_TOOL]: {
            name: 'Dodge',
            description: 'Dodge asteroids',
            enabled: false,
        },
        [TRACTOR_TOOL]: {
            name: 'Tractor Beam',
            description: 'Capture items',
            enabled: false,
        },
        [GUN_TOOL]: {
            name: 'Gun',
            description: 'Shoot bullets',
            enabled: false,
        },
        [SHIELD_TOOL]: {
            name: 'Shield',
            description: 'Protect yourself',
            enabled: false
        },
    }
    
 
    rateOfFire: number = 0.5; // in shots per second
    lastFireTime: number = 0;
    
    constructor (scene: Phaser.Scene)
    {
        super(scene, 300, 700);
        this.setSize(48, 48);
        this.shipSprite = scene.add.image(0, 0, 'player-ship').setOrigin(0.5,0.5);
        this.add(this.shipSprite);

 
        // enable physics for the ship
        scene.physics.world.enable(this);
    }

    enableThrust(){
        this.thrustEnabled = true;

        const leftThrust = this.scene.add.sprite(-3, 30, 'green-thrust');
        leftThrust.play('pulse');
        const rightThrust = this.scene.add.sprite(7, 30, 'green-thrust');
        rightThrust.play('pulse');

        this.add(leftThrust);
        this.add(rightThrust);

        this.thrustSprites.push(leftThrust, rightThrust);
        this.activateTool(TRACTOR_TOOL);
        this.enableTool(TRACTOR_TOOL);
        EventBus.emit('thrustEnabled');

    }

    enableTool(tool_name: string) {
        if (this.tools[tool_name]) {
            this.tools[tool_name].enabled = true;
        }
    }

    setThrustVisibility(visible: boolean)
    {
        this.thrustSprites.forEach(thrust => thrust.setVisible(visible));
    }

    activateTool(tool_name: string) {
        this.activeTool = tool_name;
    }

    cycleTools() {
        const toolKeys = Object.keys(this.tools);
        let currentIndex = toolKeys.indexOf(this.activeTool);

        // Check if there is at least one enabled tool
        if (!toolKeys.some(key => this.tools[key].enabled)) {
            return; // Exit if no tools are enabled
        }

        do {
            currentIndex = (currentIndex + 1) % toolKeys.length;
        } while (!this.tools[toolKeys[currentIndex]].enabled);

        this.activateTool(toolKeys[currentIndex]);
        EventBus.emit('active-tool-changed', this.activeTool);
    }


    useActiveTool(item?: any){
        if (this.activeTool === DODGE_TOOL) {
            this.dodge();
        } else if (this.activeTool === TRACTOR_TOOL) {
            this.capture(item);
        }
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

    // Randomly move the ship left or right to dodge asteroids
    dodge()
    {
        if (this.dodgeTween && this.dodgeTween.isPlaying()) {
            return; // If the dodge tween is already playing, do nothing
        }

        const direction = Math.random() < 0.5 ? -1 : 1;
        let targetX = this.x + direction * 50;

        // Prevent the ship from going off the edge of the screen
        const screenWidth = this.scene.scale.width;
        if (targetX < 50) {
            targetX += 50;
        } else if (targetX > screenWidth-50) {
            targetX -= 50;
        }

        const frames = 10;

        // Create a tween to move the ship to the target position
        this.dodgeTween = this.scene.tweens.add({
            targets: this,
            x: targetX,
            duration: frames * (1000 / 60), // assuming 60 FPS
            ease: 'Linear'
        });
    }

    blowUp()
    {
        this.setThrustVisibility(false);
        this.shipSprite.setVisible(false);
        this.scene.physics.world.disable(this);
        this.setSize(64,64);
        
        this.scene.add.sprite(this.x, this.y, 'explosion').play('shipExplode');
        const explosion = this.scene.add.sprite(this.x, this.y, 'explosion').play('shipExplode');
        explosion.on('animationcomplete', () => {
            this.scene.scene.start('GameOver'); 
        });

        
    }

    isToolEnabled(tool_name:string){
        return this.tools[tool_name].enabled;
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
