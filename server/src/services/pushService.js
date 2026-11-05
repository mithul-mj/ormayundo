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

// Mutex lock to prevent overlapping runs
let isCronRunning = false;

// Start the cron job to run every minute
export const startCronJobs = () => {
  console.log("Started Push Notification Cron Job");

  cron.schedule('* * * * *', async () => {
    if (isCronRunning) {
      console.log("[Cron] Previous push notification cycle still active, skipping to prevent overlap.");
      return;
    }
    isCronRunning = true;

    try {
      // Fetch cards that are due and haven't been notified yet
      const dueByUser = await RecallItem.aggregate([
        { 
          $match: { 
            status: 'active', 
            nextReviewAt: { $lte: new Date() },
            notificationSent: { $ne: true }
          }
        },
        { $group: { _id: '$userId', count: { $sum: 1 } } }
      ]);

      if (dueByUser.length === 0) return;

      // Fetch FCM tokens for these specific users
      const userIds = dueByUser.map(item => item._id);
      const users = await User.find({ _id: { $in: userIds }, fcmToken: { $exists: true, $ne: null } }).lean();

      const tokenMap = new Map();
      users.forEach(user => {
        tokenMap.set(user._id.toString(), user.fcmToken);
      });

      const notifiedUserIds = [];

      // Process push notifications in parallel chunks of 10 to handle high concurrency
      const BATCH_SIZE = 10;
      for (let i = 0; i < dueByUser.length; i += BATCH_SIZE) {
        const batch = dueByUser.slice(i, i + BATCH_SIZE);
        await Promise.allSettled(
          batch.map(async (group) => {
            const token = tokenMap.get(group._id.toString());
            if (token) {
              await sendPushNotification(token, 'Time for Ormayundo!', `You have ${group.count} flashcards due for active recall.`);
              notifiedUserIds.push(group._id);
            }
          })
        );
      }

      // Bulk update all notified cards in a single database query
      if (notifiedUserIds.length > 0) {
        await RecallItem.updateMany(
          { 
            userId: { $in: notifiedUserIds }, 
            status: 'active', 
            nextReviewAt: { $lte: new Date() },
            notificationSent: { $ne: true }
          },
          { $set: { notificationSent: true } }
        );
      }
    } catch (error) {
      console.error('Cron Job Error:', error);
    } finally {
      isCronRunning = false;
    }
  });
};
