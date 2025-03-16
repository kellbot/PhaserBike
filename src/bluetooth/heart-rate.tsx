import React from 'react';
import { EventBus } from '@/game/EventBus';

export { Bluetooth };

interface BluetoothProps {
    setDevice: (device: BluetoothDevice | null) => void;
    setCharacteristic: (characteristic: BluetoothRemoteGATTCharacteristic | null) => void;
    setServer: (server: BluetoothRemoteGATTServer | null) => void;
    setService: (service: BluetoothRemoteGATTService | null) => void;
}


const Bluetooth: React.FC<BluetoothProps> = ({ setDevice, setCharacteristic, setServer, setService }) => {
    const connectToDevice = async () => {
        const device = await navigator.bluetooth.requestDevice({
            filters: [
                { services: ['heart_rate'] }
            ]
        });
        setDevice(device);
        console.log('Device selected:', device);
        const server = await device.gatt?.connect();
        if (server) setServer(server);
        const service = await server?.getPrimaryService('heart_rate');
        if (service) setService(service);
        const characteristic = await service?.getCharacteristic('heart_rate_measurement');
        if (characteristic) setCharacteristic(characteristic);

        characteristic?.startNotifications();
        console.log('Notifications started for characteristic:', characteristic);
        characteristic?.addEventListener('characteristicvaluechanged', (event: Event) => {
            const characteristic = event.target as BluetoothRemoteGATTCharacteristic;
            const value = characteristic.value;
            if (value){
                EventBus.emit('heart-rate-update', parseHeartRate(value));
            }

        });
        device.addEventListener('gattserverdisconnected', onDisconnected);
    };

    const onDisconnected = (event: Event) => {
        alert("Device Disconnected");
        setDevice(null);
    };



    return (
        <button className="bluetooth button" onClick={connectToDevice}>Connect Heart Rate Monitor</button>
    );
};

function parseHeartRate(data: DataView): number{
    const flags = data.getUint8(0)
    const rate16Bits = flags & 0x1

    if (rate16Bits) {
      return data.getUint16(1, /*littleEndian=*/ true)
    } else {
      return data.getUint8(1)
    }
}