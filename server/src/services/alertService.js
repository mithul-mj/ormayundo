import User from '../models/user.js';
import SystemConfig from '../models/systemConfig.js';
import SystemIncident from '../models/systemIncident.js';
import { sendPushNotification } from './pushService.js';
import axios from 'axios';

/**
 * Centrally log and dispatch immediate real-time failure alerts across FCM push,
 * optional Discord/Slack webhooks, and courtesy notifications to affected users.
 */
export const logAndNotifyIncident = async ({
  type,
  severity = 'medium',
  message,
  details = {},
  userId = null,
  jobId = null
}) => {
  try {
    // 1. Record incident in MongoDB
    const incident = await SystemIncident.create({
      type,
      severity,
      message,
      details,
      userId,
      jobId
    });

    console.log(`[AlertService] Logged incident [${type}] with ID: ${incident._id}`);

    // 2. Fetch all admin users and dispatch immediate high-priority FCM push notification
    const admins = await User.find({ role: 'admin', isBlocked: { $ne: true } })
      .select('fcmToken fcmTokens')
      .lean();

    const adminTokens = new Set();
    admins.forEach((admin) => {
      if (admin.fcmToken) adminTokens.add(admin.fcmToken);
      if (Array.isArray(admin.fcmTokens)) {
        admin.fcmTokens.forEach((t) => {
          if (t) adminTokens.add(t);
        });
      }
    });

    const alertTitle = `⚠️ Ormayundo Alert: ${type.replace(/_/g, ' ')}`;
    const alertBody = `${message.substring(0, 120)}`;

    if (adminTokens.size > 0) {
      await Promise.allSettled(
        Array.from(adminTokens).map((token) =>
          sendPushNotification(token, alertTitle, alertBody)
        )
      );
    }

    // 3. Optional Webhook Alerting (Discord / Slack / Generic)
    const config = await SystemConfig.getSettings().catch(() => null);
    if (config?.alertWebhookUrl && config.alertWebhookUrl.startsWith('http')) {
      try {
        await axios.post(
          config.alertWebhookUrl,
          {
            content: `🚨 **Ormayundo System Alert**\n**Type:** \`${type}\`\n**Severity:** **${severity.toUpperCase()}**\n**Message:** ${message}\n**Time:** ${new Date().toISOString()}`
          },
          { timeout: 5000 }
        );
      } catch (webhookErr) {
        console.warn('[AlertService] Failed to send webhook alert:', webhookErr.message);
      }
    }

    // 4. If a specific user's job failed, notify the user so they are informed
    if (userId) {
      try {
        const affectedUser = await User.findById(userId).select('fcmToken fcmTokens').lean();
        if (affectedUser) {
          const userTokens = new Set();
          if (affectedUser.fcmToken) userTokens.add(affectedUser.fcmToken);
          if (Array.isArray(affectedUser.fcmTokens)) {
            affectedUser.fcmTokens.forEach((t) => {
              if (t) userTokens.add(t);
            });
          }

          if (userTokens.size > 0) {
            await Promise.allSettled(
              Array.from(userTokens).map((token) =>
                sendPushNotification(
                  token,
                  'Flashcard Generation Update',
                  'We had trouble generating a flashcard for your recent highlight. Please try highlighting a shorter snippet.'
                )
              )
            );
          }
        }
      } catch (userNotifyErr) {
        console.warn('[AlertService] Failed to notify user of failed job:', userNotifyErr.message);
      }
    }

    return incident;
  } catch (error) {
    console.error('[AlertService] Fatal error while logging incident:', error.message);
  }
};

