import { playerManager } from "../managers/PlayerManager";
export class Planet extends Phaser.GameObjects.Container
{

    planetSprite: Phaser.GameObjects.Image;
    fx: any;
    minText: Phaser.GameObjects.Text;

    minCoinsNeeded: number;

    constructor(scene: Phaser.Scene, x: number, y: number)
    {
        super(scene, x, y);

        this.minCoinsNeeded = 5;

        // Containers inherently do not have a size
        this.setSize(48, 48);
        this.planetSprite = scene.add.image(0, 0, 'planet').setOrigin(0.5,0.5);
        this.add(this.planetSprite);

        this.add(this.scene.add.text(0,0, 'Shop', {align: 'center'}).setOrigin(0.5,0.5));
        this.minText = this.scene.add.text(0,30, '', {align: 'center'}).setOrigin(0.5,0.5);
        this.add(this.minText);

        if (this.planetSprite) this.fx = this.planetSprite.preFX?.addColorMatrix();
        if (this.fx) this.fx.grayscale(1);

        // Collision physics
        scene.physics.world.enable(this);
        if (this.body && this.body instanceof Phaser.Physics.Arcade.Body) {
            this.body.setCircle(24);
        }

    }

    update(time: number, delta: number): void {
        if (playerManager.coinCount < this.minCoinsNeeded){
            this.minText.setText(`$${this.minCoinsNeeded} needed`);
        } else {
            this.minText.setText('');
            this.fx.grayscale(0);
        }

         if (this.y < this.scene.cameras.main.height + 32)
        {
            this.y += 10 * delta / 1000;
        } else {
            this.destroy();
        }

    }
}