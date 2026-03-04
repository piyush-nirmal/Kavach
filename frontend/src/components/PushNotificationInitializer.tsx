import { useEffect } from 'react';
import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'sonner';

export function PushNotificationInitializer() {
    const { user } = useAuth();

    useEffect(() => {
        // Only run on native platforms (Android/iOS)
        if (Capacitor.isNativePlatform()) {
            // 1. Request permissions from the user
            PushNotifications.requestPermissions().then((result) => {
                if (result.receive === 'granted') {
                    // 2. Register with Firebase/APNS
                    PushNotifications.register();
                } else {
                    console.warn('Push notification permission denied by user.');
                }
            });

            // 3. Listen for successful registration & Token
            PushNotifications.addListener('registration', async (token) => {
                console.log('Push registration success, token: ' + token.value);

                // Save the device token to the current user's document in Firestore
                if (user?.id) {
                    try {
                        await updateDoc(doc(db, 'users', user.id), {
                            fcmToken: token.value
                        });
                        console.log('Saved FCM token successfully.');
                    } catch (error) {
                        console.error('Error saving FCM to Firestore:', error);
                    }
                }
            });

            // 4. Listen for errors
            PushNotifications.addListener('registrationError', (error) => {
                console.error('Error on registration: ' + JSON.stringify(error));
            });

            // 5. Listen for incoming notifications while app is open
            PushNotifications.addListener('pushNotificationReceived', (notification) => {
                console.log('Push received: ' + JSON.stringify(notification));
                toast.info(notification.title || 'New Alert', {
                    description: notification.body,
                });
            });

            // 6. Listen for notification clicks
            PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
                console.log('Push action performed: ' + JSON.stringify(action));
                // You could route to a specific page here, e.g. /notifications
            });
        }

        return () => {
            if (Capacitor.isNativePlatform()) {
                PushNotifications.removeAllListeners();
            }
        };
    }, [user]); // Re-run if user context changes to save token to the specific account

    return null;
}
