import admin from 'firebase-admin';
import cron from 'node-cron';
import User from '../models/user.js';
import RecallItem from '../models/recallItem.js';
import { readFileSync } from 'fs';

try {
  // Read the JSON file from the config folder outside src
  const serviceAccount = JSON.parse(
    readFileSync(new URL('../../config/firebase-service-account.json', import.meta.url))
  );

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin Initialized successfully!");
  }
} catch (error) {
  console.log("Firebase Admin failed to initialize.", error.message);
}

export const sendPushNotification = async (fcmToken, title, body) => {
  try {
    const message = {
      notification: { title, body },
      token: fcmToken
    };

    // If firebase is initialized properly, send it
    if (admin.apps.length > 0) {
      await admin.messaging().send(message);
    } else {
      console.log(`[SIMULATED PUSH] Sent to ${fcmToken}: ${title} - ${body}`);
    }
  } catch (error) {
    console.error('Error sending push notification:', error.message);

    // BEST PRACTICE: Automatically delete dead tokens so we don't spam Firebase!
    if (error.code === 'messaging/registration-token-not-registered') {
      console.log(`[Push Service] Token is dead. Deleting token ${fcmToken} from database...`);
      await User.updateMany(
        { fcmToken: fcmToken },
        { $unset: { fcmToken: "" } }
      );
    }
  }
};

// Start the cron job to run every minute for testing
export const startCronJobs = () => {
  console.log("Started Push Notification Cron Job (Runs every minute for testing)");

  cron.schedule('* * * * *', async () => {
    try {
      // BEST PRACTICE: Only fetch cards that are due AND haven't been notified yet!
      const dueByUser = await RecallItem.aggregate([
        { $match: { 
            status: 'active', 
            nextReviewAt: { $lte: new Date() },
            notificationSent: { $ne: true } // Handles both false and undefined (legacy data)
        }},
        { $group: { _id: '$userId', count: { $sum: 1 } } }
      ]);

      if (dueByUser.length === 0) return; // No new due cards

      // Fetch the FCM tokens for these specific users
      const userIds = dueByUser.map(item => item._id);
      const users = await User.find({ _id: { $in: userIds }, fcmToken: { $exists: true, $ne: null } });

      // Create a map of userId -> fcmToken for fast lookup
      const tokenMap = {};
      users.forEach(user => {
        tokenMap[user._id.toString()] = user.fcmToken;
      });

      // Fire notifications and flip the flag
      for (const group of dueByUser) {
        const token = tokenMap[group._id.toString()];
        if (token) {
          await sendPushNotification(token, 'Time for Ormayundo!', `You have ${group.count} flashcards due for active recall.`);
          
          // CRITICAL: Flip the flag so we don't spam the user again!
          await RecallItem.updateMany(
            { 
              userId: group._id, 
              status: 'active', 
              nextReviewAt: { $lte: new Date() },
              notificationSent: { $ne: true }
            },
            { $set: { notificationSent: true } }
          );
        } else {
          console.log(`[Cron] Found ${group.count} flashcards due for user ${group._id}, but they have NO FCM TOKEN saved in the database! Notification skipped.`);
        }
      }
    } catch (error) {
      console.error('Cron Job Error:', error);
    }
  });
};
