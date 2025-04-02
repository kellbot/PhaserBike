import { useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame';

function App()
{


    // The sprite can only be moved in the MainMenu Scene
    const [canMoveSprite, setCanMoveSprite] = useState(true);

    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const [spritePosition, setSpritePosition] = useState({ x: 0, y: 0 });

  
    

    const [device, setDevice] = useState<BluetoothDevice | null>(null);
    const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
    const [server, setServer] = useState<BluetoothRemoteGATTServer | null>(null);
    const [service, setService] = useState<BluetoothRemoteGATTService | null>(null);



    return (
        <div id="app">
            <PhaserGame ref={phaserRef} />
            <div>
                
                
                
            </div>
        </div>
    )
}


export default App
