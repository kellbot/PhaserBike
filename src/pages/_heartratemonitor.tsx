import React, { useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import { heartRateService } from '../bluetooth/heart-rate.service';
import { EventBus } from '@/game/EventBus';

const HeartRateMonitor: React.FC = () => {
    const [heartRate, setHeartRate] = useState<number | null>(null);

    useEffect(() => {
        const subscription: Subscription = heartRateService.heartRateMeasurement$.subscribe(
            (heartRate) => {
                setHeartRate(heartRate);
                EventBus.emit('heart-rate-update', heartRate);
            },
            (error) => {
                console.error('Error receiving heart rate measurement:', error);
            }
        );

        // Cleanup subscription on component unmount
        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <div>
            <p>Current Heart Rate: <br />{heartRate !== null ? heartRate : 'No data'}</p>
        </div>
    );
};

export default HeartRateMonitor;