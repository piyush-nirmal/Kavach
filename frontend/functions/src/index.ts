import { onDocumentCreated } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";

admin.initializeApp();

export const sendBroadcastNotification = onDocumentCreated("broadcasts/{broadcastId}", async (event) => {
    // 1. Get the newly created broadcast data
    const snapshot = event.data;
    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }

    const broadcastData = snapshot.data();
    const title = broadcastData.title || "New Healthcare Broadcast";
    const body = broadcastData.message || "A provider has sent a new update.";

    try {
        // 2. Query all users from the 'users' collection to grab their FCM tokens
        const usersSnapshot = await admin.firestore().collection("users").get();
        const tokens: string[] = [];

        usersSnapshot.forEach((userDoc) => {
            const userData = userDoc.data();
            // Assuming we save the token as 'fcmToken' in the user's document
            if (userData.fcmToken) {
                tokens.push(userData.fcmToken);
            }
        });

        // 3. If no tokens exist, we don't need to do anything
        if (tokens.length === 0) {
            console.log("No devices registered for push notifications.");
            return;
        }

        // 4. Create the Notification payload
        const message = {
            notification: {
                title: title,
                body: body,
            },
            tokens: tokens,
        };

        // 5. Send the multi-cast message via Firebase Admin SDK
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`Successfully sent ${response.successCount} messages; Failed: ${response.failureCount}`);

    } catch (error) {
        console.error("Error sending push notifications:", error);
    }
});
