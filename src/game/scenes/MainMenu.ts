import { GameObjects, Scene } from 'phaser';
import { DeviceState } from '../../bluetooth/DeviceState';
import { heartRateService } from '@/bluetooth/hrm.service';
import { SimulatedHRM } from '@/bluetooth/simulatedHRM.service';
import { EventBus } from '../EventBus';
import { NumberInput } from '../ui/NumberInput';
import { playerManager } from '../managers/PlayerManager';

export class MainMenu extends Scene
{
    background: GameObjects.Image;
    logo: GameObjects.Image;
    title: GameObjects.Text;
    bleButton: GameObjects.Text;
    simButton: GameObjects.Text;

    constructor ()
    {
        super('MainMenu');
    }

    create ()
    {
        this.background = this.add.image(512, 384, 'background');

        this.title = this.add.text(300, 150, 'Game Setup', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        // Add number input above existing buttons
        const restingHRInput = new NumberInput(
            this,
            300,  // x position
            230,  // y position
            'Resting HR',  // label
            65,    // initial value
            30,    // min value
            120,  // max value
            (value) => {
                playerManager.restingHR = value;
            }
        );
        
        this.add.existing(restingHRInput);
        const maxHRInput = new NumberInput(
            this,
            300,  // x position
            290,  // y position
            'Max HR',  // label
            150,    // initial value
            65,    // min value
            220,  // max value
            (value) => {
                playerManager.maxHR = value;
            }
        );
        this.add.existing(maxHRInput);

        this.bleButton = this.add.text(300, 370, 'Use BLE Heart Rate Monitor', {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            backgroundColor: '#000000', padding: { x: 10, y: 5 },
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.simButton = this.add.text(300, 440, 'Use Simulated Heart Rate Monitor', {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            backgroundColor: '#000000', padding: { x: 10, y: 5 },
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.bleButton.on('pointerdown', this.useBLEMonitor, this);
        this.simButton.on('pointerdown', this.useSimulatedMonitor, this);
 

        EventBus.emit('current-scene-ready', this);

        playerManager.restingHR = 65;
        playerManager.maxHR = 150;
    }
    
    
    async useBLEMonitor() {

        DeviceState.useHRMSimulator = false;

        await heartRateService.connect();
        console.log('Using BLE Heart Rate Monitor');
        await heartRateService.startNotifications();

        this.scene.start('Game');
        
    }

    useSimulatedMonitor() {
        DeviceState.useHRMSimulator = true;
        DeviceState.isHRMConnected = true; // Simulate connection
        let simHRM = new SimulatedHRM();
        console.log('Using Simulated Heart Rate Monitor');
        this.scene.start('Game');
     
    }
    changeScene ()
    {

        this.scene.start('Game');
    }

   
}
