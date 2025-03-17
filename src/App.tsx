import { useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame';
import { MainMenu } from './game/scenes/MainMenu';
import { GameBike } from './game/GameBike';
import { Game } from './game/scenes/Game';
import { heartRateService } from './bluetooth/heart-rate.service';
import HeartRateMonitor from './pages/_heartratemonitor';

function App()
{
    const [device, setDevice] = useState<BluetoothDevice | null>(null);
    const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
    const [server, setServer] = useState<BluetoothRemoteGATTServer | null>(null);
    const [service, setService] = useState<BluetoothRemoteGATTService | null>(null);


    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true);

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

    const changeScene = () => {

        if(phaserRef.current)
        {     
            const scene = phaserRef.current.scene as MainMenu;
            
            if (scene)
            {
                scene.changeScene();
            }
        }
    }

    const startBike = (event: React.MouseEvent<HTMLButtonElement>) => {
        if(phaserRef.current)
        {
            const scene = phaserRef.current.scene as Game;

            if (scene)
            {
                scene.bike.setPower(100);
            }
        }
        event.currentTarget.blur();
    }
        
    

    const connectBluetoothHr = async (event: React.MouseEvent<HTMLButtonElement>) => {
        event.currentTarget.blur();
        const deviceName = await heartRateService.connect();
        console.log('Connected to device:', deviceName);
        await heartRateService.startNotifications();
        console.log('Notifications started');
    }

    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {

        setCanMoveSprite(scene.scene.key !== 'MainMenu');
        
    }

    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            <div>
                <div>
                    <button className="button" onClick={startBike}>Start Biking</button>
                </div>
                <div>
                    <button className="button" onClick={connectBluetoothHr}>Connect Heart Rate Monitor</button>
                    <div>
                       <HeartRateMonitor />
                    </div>
                </div>
                
                
            </div>
        </div>
    )
}


export default App
