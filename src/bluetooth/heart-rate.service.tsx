import React, { useRef, useState } from 'react';
import { EventBus } from '@/game/EventBus';

const HeartRateService: React.FC = () => {
  const [device, setDevice] = useState<BluetoothDevice | null>(null);
  const [server, setServer] = useState<BluetoothRemoteGATTServer | null>(null);
  const [service, setService] = useState<BluetoothRemoteGATTService | null>(null);
  const [characteristic, setCharacteristic] = useState<BluetoothRemoteGATTCharacteristic | null>(null);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const connectToDevice = async () => {
    const device = await navigator.bluetooth.requestDevice({
      filters: [{ services: ['heart_rate'] }]
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
      if (value) {
        const heartRateValue = parseHeartRate(value);
        setHeartRate(heartRateValue);
        EventBus.emit('heart-rate-update', heartRateValue);
      }
    });
    device.addEventListener('gattserverdisconnected', onDisconnected);

    buttonRef.current?.blur();
    
  };

  const onDisconnected = (event: Event) => {
    alert("Device Disconnected");
    setDevice(null);
  };

  const parseHeartRate = (data: DataView): number => {
    const flags = data.getUint8(0);
    const rate16Bits = flags & 0x1;

    if (rate16Bits) {
      return data.getUint16(1, /*littleEndian=*/ true);
    } else {
      return data.getUint8(1);
    }
  };

  return (
    <>
      <button className="button" onClick={connectToDevice}>Connect to Heart Rate Monitor</button>
      <div>
        <p>Heart Rate: <span id="heart-rate-value">{heartRate !== null ? heartRate : 'N/A'}</span></p>
      </div>
    </>
  );
};

export default HeartRateService;