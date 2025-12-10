/**
 * Slack Notification Service
 *
 * Sends notifications to Slack for ingestion failures and recoveries.
 */

export type NotificationType = 'error' | 'warning' | 'success' | 'info';

export interface SlackNotification {
  type: NotificationType;
  title: string;
  message: string;
  fields?: Array<{ title: string; value: string; short?: boolean }>;
}

export interface IngestionFailureNotification {
  jobType: string;
  entityId: string;
  error: string;
  retryCount?: number;
  maxRetries?: number;
}

export interface RecoveryNotification {
  failureId: string;
  jobType: string;
  entityId: string;
}

export interface MaxRetriesNotification {
  failureId: string;
  jobType: string;
  entityId: string;
  retryCount: number;
}

const SLACK_COLORS: Record<NotificationType, string> = {
  error: 'danger',
  warning: 'warning',
  success: 'good',
  info: '#2196F3',
};

/**
 * Send a notification to Slack
 *
 * @param notification - Notification details
 */
export async function sendSlackNotification(notification: SlackNotification): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!webhookUrl) {
    console.log('[SlackNotifier] Webhook URL not configured, skipping notification');
    return;
  }

  const { type, title, message, fields } = notification;

  const payload = {
    attachments: [
      {
        color: SLACK_COLORS[type],
        title,
        text: message,
        fields: fields?.map((f) => ({
          title: f.title,
          value: f.value,
          short: f.short ?? true,
        })),
        footer: 'KRace Ingestion System',
        ts: Math.floor(Date.now() / 1000),
      },
    ],
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`[SlackNotifier] Failed to send notification: ${response.status}`);
    }
  } catch (error) {
    console.error('[SlackNotifier] Error sending notification:', error);
  }
}

/**
 * Send notification for an ingestion failure
 *
 * @param params - Failure details
 */
export async function notifyIngestionFailure(params: IngestionFailureNotification): Promise<void> {
  const { jobType, entityId, error, retryCount = 0, maxRetries = 5 } = params;

  await sendSlackNotification({
    type: retryCount >= 3 ? 'error' : 'warning',
    title: `🚨 Ingestion Failure: ${jobType}`,
    message: error,
    fields: [
      { title: 'Job Type', value: jobType },
      { title: 'Entity ID', value: entityId },
      { title: 'Retry Count', value: `${retryCount}/${maxRetries}` },
      { title: 'Time', value: new Date().toISOString() },
    ],
  });
}

/**
 * Send notification when a failure is successfully recovered
 *
 * @param params - Recovery details
 */
export async function notifyRecoveryComplete(params: RecoveryNotification): Promise<void> {
  const { failureId, jobType, entityId } = params;

  await sendSlackNotification({
    type: 'success',
    title: `✅ Recovery Complete: ${jobType}`,
    message: `Successfully recovered from failure`,
    fields: [
      { title: 'Failure ID', value: failureId },
      { title: 'Job Type', value: jobType },
      { title: 'Entity ID', value: entityId },
      { title: 'Recovered At', value: new Date().toISOString() },
    ],
  });
}

/**
 * Send notification when max retries is exceeded
 *
 * @param params - Max retries details
 */
export async function notifyMaxRetriesExceeded(params: MaxRetriesNotification): Promise<void> {
  const { failureId, jobType, entityId, retryCount } = params;

  await sendSlackNotification({
    type: 'error',
    title: `❌ Max Retries Exceeded: ${jobType}`,
    message: `Failure has exceeded maximum retry attempts and requires manual intervention`,
    fields: [
      { title: 'Failure ID', value: failureId },
      { title: 'Job Type', value: jobType },
      { title: 'Entity ID', value: entityId },
      { title: 'Total Retries', value: retryCount.toString() },
      { title: 'Action Required', value: 'Manual review needed' },
    ],
  });
}

/**
 * Send daily summary notification
 *
 * @param stats - Daily statistics
 */
export async function notifyDailySummary(stats: {
  totalRaces: number;
  successfulCollections: number;
  failedCollections: number;
  pendingFailures: number;
}): Promise<void> {
  const successRate =
    stats.totalRaces > 0
      ? ((stats.successfulCollections / stats.totalRaces) * 100).toFixed(1)
      : '0';

  const type: NotificationType =
    stats.failedCollections > 0 ? (stats.pendingFailures > 5 ? 'warning' : 'info') : 'success';

  await sendSlackNotification({
    type,
    title: `📊 Daily Ingestion Summary`,
    message: `Collection success rate: ${successRate}%`,
    fields: [
      { title: 'Total Races', value: stats.totalRaces.toString() },
      { title: 'Successful', value: stats.successfulCollections.toString() },
      { title: 'Failed', value: stats.failedCollections.toString() },
      { title: 'Pending Failures', value: stats.pendingFailures.toString() },
    ],
  });
}
