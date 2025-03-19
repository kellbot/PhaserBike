import { GameObjects, Scene } from 'phaser';
import { DeviceState } from '../../bluetooth/DeviceState';
import { heartRateService } from '@/bluetooth/hrm.service';
import { SimulatedHRM } from '@/bluetooth/simulatedHRM.service';
import { EventBus } from '../EventBus';

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

        this.title = this.add.text(300, 200, 'Game Setup', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        this.bleButton = this.add.text(300, 300, 'Use BLE Heart Rate Monitor', {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            backgroundColor: '#000000', padding: { x: 10, y: 5 },
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.simButton = this.add.text(300, 400, 'Use Simulated Heart Rate Monitor', {
            fontFamily: 'Arial', fontSize: 24, color: '#ffffff',
            backgroundColor: '#000000', padding: { x: 10, y: 5 },
            align: 'center'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        this.bleButton.on('pointerdown', this.useBLEMonitor, this);
        this.simButton.on('pointerdown', this.useSimulatedMonitor, this);
 

        EventBus.emit('current-scene-ready', this);
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
