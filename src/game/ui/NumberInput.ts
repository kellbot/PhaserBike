export class NumberInput extends Phaser.GameObjects.Container {
    private valueText: Phaser.GameObjects.Text;
    private upButton: Phaser.GameObjects.Text;
    private downButton: Phaser.GameObjects.Text;
    private labelText: Phaser.GameObjects.Text;
    private value: number;
    private minValue: number;
    private maxValue: number;
    private onChange: (value: number) => void;

    constructor(scene: Phaser.Scene, x: number, y: number, label: string, initialValue: number, min: number, max: number, onChange: (value: number) => void) {
        super(scene, x, y);

        this.value = initialValue;
        this.minValue = min;
        this.maxValue = max;
        this.onChange = onChange;

        // Create the label
        this.labelText = scene.add.text(-85, 0, label, {
            fontFamily: 'Arial',
            fontSize: '20px',
            color: '#ffffff',
        }).setOrigin(0.5);

        // Create the display text
        this.valueText = scene.add.text(0, 0, initialValue.toString(), {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 },
        }).setOrigin(0.5);

        // Create up/down buttons
        this.upButton = scene.add.text(35, -20, '▲', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setInteractive({ useHandCursor: true });

        this.downButton = scene.add.text(35, 0, '▼', {
            fontFamily: 'Arial',
            fontSize: '24px',
            color: '#ffffff'
        }).setInteractive({ useHandCursor: true });

        // Add event listeners
        this.upButton.on('pointerdown', () => this.increment());
        this.downButton.on('pointerdown', () => this.decrement());

        // Add everything to the container
        this.add([this.labelText, this.valueText, this.upButton, this.downButton]);
    }

    private increment() {
        if (this.value < this.maxValue) {
            this.value++;
            this.valueText.setText(this.value.toString());
            this.onChange(this.value);
        }
    }

    private decrement() {
        if (this.value > this.minValue) {
            this.value--;
            this.valueText.setText(this.value.toString());
            this.onChange(this.value);
        }
    }

    getValue(): number {
        return this.value;
    }
}