import {
  NotificationFormData,
  NotificationCampaign,
  NotificationStatus,
  createNotificationCampaign,
  updateNotificationCampaign,
  notificationCampaigns,
} from "@/data/notificationData";

export type DeliveryLogEntry = {
  id: number;
  notification_id: string;
  status: "queued" | "sent" | "delivered" | "failed" | "retry";
  recipient_count: number;
  message: string;
  timestamp: string;
};

export type QueueItem = {
  id: number;
  campaign_id: number;
  notification_id: string;
  scheduled_at: string | null;
  status: "pending" | "processing" | "completed" | "failed";
  retry_count: number;
  created_at: string;
};

const DRAFT_STORAGE_KEY = "sv-notification-draft";

export let deliveryLogs: DeliveryLogEntry[] = [];
export let notificationQueue: QueueItem[] = [];
let logId = 1;
let queueId = 1;

function addLog(notificationId: string, status: DeliveryLogEntry["status"], count: number, message: string) {
  deliveryLogs = [
    {
      id: logId++,
      notification_id: notificationId,
      status,
      recipient_count: count,
      message,
      timestamp: new Date().toISOString(),
    },
    ...deliveryLogs,
  ];
}

function enqueue(campaign: NotificationCampaign) {
  notificationQueue = [
    {
      id: queueId++,
      campaign_id: campaign.id,
      notification_id: campaign.notification_id,
      scheduled_at: campaign.scheduled_at,
      status: campaign.delivery_type === "scheduled" ? "pending" : "processing",
      retry_count: 0,
      created_at: new Date().toISOString(),
    },
    ...notificationQueue,
  ];
  addLog(campaign.notification_id, "queued", campaign.estimated_recipients, "Added to delivery queue");
}

export function saveDraftToStorage(form: NotificationFormData, editId?: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ form, editId, savedAt: new Date().toISOString() }));
}

export function loadDraftFromStorage(): { form: NotificationFormData; editId?: number; savedAt: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearDraftStorage() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(DRAFT_STORAGE_KEY);
}

export async function saveDraft(
  form: NotificationFormData,
  createdBy: string,
  editId?: number
): Promise<NotificationCampaign> {
  await delay(400);
  const draftForm = { ...form, status: "draft" as NotificationStatus };
  if (editId) {
    const updated = updateNotificationCampaign(editId, draftForm);
    if (updated) {
      saveDraftToStorage(form, editId);
      addLog(updated.notification_id, "queued", 0, "Draft saved");
      return updated;
    }
  }
  const created = createNotificationCampaign(draftForm, createdBy);
  saveDraftToStorage(form, created.id);
  addLog(created.notification_id, "queued", 0, "Draft created");
  return created;
}

export async function scheduleNotification(
  form: NotificationFormData,
  createdBy: string,
  editId?: number
): Promise<NotificationCampaign> {
  await delay(800);
  const scheduledForm = { ...form, send_now: false, status: "scheduled" as NotificationStatus };
  let campaign: NotificationCampaign;
  if (editId) {
    const updated = updateNotificationCampaign(editId, scheduledForm);
    if (!updated) throw new Error("Failed to update notification");
    campaign = updated;
  } else {
    campaign = createNotificationCampaign(scheduledForm, createdBy);
  }
  enqueue(campaign);
  clearDraftStorage();
  addLog(campaign.notification_id, "queued", campaign.estimated_recipients, `Scheduled for ${campaign.scheduled_at}`);
  return campaign;
}

export async function sendNotificationNow(
  form: NotificationFormData,
  createdBy: string,
  editId?: number
): Promise<NotificationCampaign> {
  await delay(1000);
  const instantForm = { ...form, send_now: true, status: "sending" as NotificationStatus };
  let campaign: NotificationCampaign;
  if (editId) {
    const updated = updateNotificationCampaign(editId, instantForm);
    if (!updated) throw new Error("Failed to update notification");
    campaign = updated;
  } else {
    campaign = createNotificationCampaign(instantForm, createdBy);
  }
  enqueue(campaign);
  clearDraftStorage();

  const idx = notificationCampaigns.findIndex((n) => n.id === campaign.id);
  if (idx >= 0) {
    notificationCampaigns[idx].status = "sent";
    notificationCampaigns[idx].analytics = {
      total_sent: campaign.estimated_recipients,
      delivered: Math.round(campaign.estimated_recipients * 0.96),
      opened: Math.round(campaign.estimated_recipients * 0.34),
      failed: Math.round(campaign.estimated_recipients * 0.04),
      ctr: 34,
      delivery_rate: 96,
      last_delivery_at: new Date().toISOString(),
    };
    campaign = notificationCampaigns[idx];
  }

  addLog(campaign.notification_id, "sent", campaign.estimated_recipients, "Instant delivery completed");
  return campaign;
}

export async function sendTestNotification(form: NotificationFormData, adminEmail: string): Promise<void> {
  await delay(600);
  addLog("TEST-" + Date.now(), "delivered", 1, `Test sent to ${adminEmail}`);
}

export function retryFailedDelivery(notificationId: string) {
  const item = notificationQueue.find((q) => q.notification_id === notificationId && q.status === "failed");
  if (item) {
    item.status = "processing";
    item.retry_count += 1;
    addLog(notificationId, "retry", 0, `Retry attempt #${item.retry_count}`);
    setTimeout(() => {
      item.status = "completed";
      addLog(notificationId, "delivered", 0, "Retry succeeded");
    }, 1200);
  }
}

export function getDeliveryLogs(notificationId?: string) {
  if (!notificationId) return deliveryLogs;
  return deliveryLogs.filter((l) => l.notification_id === notificationId);
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
