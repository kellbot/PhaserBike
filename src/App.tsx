import { useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame';
import { MainMenu } from './game/scenes/MainMenu';
import { GameBike } from './game/GameBike';
import { Game } from './game/scenes/Game';
import HeartRateService from './bluetooth/heart-rate.service';

function App()
{


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
        
    
    // Event emitted from the PhaserGame component
    const currentScene = (scene: Phaser.Scene) => {

        setCanMoveSprite(scene.scene.key !== 'MainMenu');
        
    }

    const [device, setDevice] = useState<BluetoothDevice | null>(null);
    const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
    const [server, setServer] = useState<BluetoothRemoteGATTServer | null>(null);
    const [service, setService] = useState<BluetoothRemoteGATTService | null>(null);



    return (
        <div id="app">
            <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
            <div>
                <div>
                <HeartRateService />
                </div>
                
                
            </div>
        </div>
    )
}


export default App
