// interface Navigator {
//     bluetooth: {
//         requestDevice(options: { filters: Array<{ namePrefix?: string; services?: string[] }> }): Promise<BluetoothDevice>;
//     };
// }

// interface BluetoothDevice {
//     gatt: {
//         connect(): Promise<BluetoothRemoteGATTServer>;
//     };
//     addEventListener(event: string, callback: (event: Event) => void): void;
// }

// interface BluetoothRemoteGATTServer {
//     getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
// }

// interface BluetoothRemoteGATTService {
//     getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
// }

// interface BluetoothRemoteGATTCharacteristic {}
