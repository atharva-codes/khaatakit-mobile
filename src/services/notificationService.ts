import { supabase, NotificationType, NotificationPriority } from '@/lib/supabase';
import { toast } from 'sonner';

export interface NotificationData {
  type: NotificationType;
  title: string;
  message: string;
  category?: string;
  amount?: number;
  priority?: NotificationPriority;
  metadata?: Record<string, any>;
}

const GUEST_USER_ID = 'guest-user';

export const sendNotification = async (data: NotificationData) => {
  const {
    type,
    title,
    message,
    category,
    amount,
    priority = 'medium',
    metadata = {},
  } = data;

  const userId = (await supabase.auth.getUser()).data.user?.id || GUEST_USER_ID;

  if (userId === GUEST_USER_ID) {
    const notificationsKey = 'khaataKitab_notifications';
    const existingNotifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');

    const newNotification = {
      id: Date.now().toString(),
      user_id: GUEST_USER_ID,
      type,
      title,
      message,
      category,
      amount,
      is_read: false,
      priority,
      metadata,
      created_at: new Date().toISOString(),
    };

    existingNotifications.unshift(newNotification);
    localStorage.setItem(notificationsKey, JSON.stringify(existingNotifications));

    showInAppNotification(title, message, type);

    return { success: true, notification: newNotification };
  }

  const { data: settings } = await supabase
    .from('notification_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (settings && !settings.app_notifications_enabled) {
    return { success: false, reason: 'Notifications disabled' };
  }

  if (settings) {
    const shouldNotify =
      (type === 'income' && settings.notify_on_income) ||
      (type === 'expense' && settings.notify_on_expense) ||
      (type === 'insight' && settings.notify_on_insights) ||
      (type === 'reminder' && settings.notify_on_reminders);

    if (!shouldNotify) {
      return { success: false, reason: `Notifications disabled for ${type}` };
    }

    if (
      type === 'expense' &&
      settings.expense_threshold &&
      amount &&
      amount < settings.expense_threshold
    ) {
      return { success: false, reason: 'Below expense threshold' };
    }
  }

  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      type,
      title,
      message,
      category,
      amount,
      priority,
      metadata,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating notification:', error);
    return { success: false, error };
  }

  showInAppNotification(title, message, type);

  if (settings?.sms_alerts_enabled && settings.phone_number) {
    await sendSMS(settings.phone_number, message);
  }

  return { success: true, notification };
};

const showInAppNotification = (title: string, message: string, type: NotificationType) => {
  const icons = {
    income: '💰',
    expense: '⚠️',
    insight: '📊',
    reminder: '🔔',
  };

  toast(`${icons[type]} ${title}`, {
    description: message,
    duration: 5000,
  });
};

const sendSMS = async (phoneNumber: string, message: string) => {
  console.log(`SMS would be sent to ${phoneNumber}: ${message}`);
  return { success: true };
};

export const markNotificationAsRead = async (notificationId: string) => {
  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    const notificationsKey = 'khaataKitab_notifications';
    const notifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
    const updated = notifications.map((n: any) =>
      n.id === notificationId ? { ...n, is_read: true } : n
    );
    localStorage.setItem(notificationsKey, JSON.stringify(updated));
    return { success: true };
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', userId);

  return { success: !error, error };
};

export const markAllNotificationsAsRead = async () => {
  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    const notificationsKey = 'khaataKitab_notifications';
    const notifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
    const updated = notifications.map((n: any) => ({ ...n, is_read: true }));
    localStorage.setItem(notificationsKey, JSON.stringify(updated));
    return { success: true };
  }

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  return { success: !error, error };
};

export const deleteNotification = async (notificationId: string) => {
  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    const notificationsKey = 'khaataKitab_notifications';
    const notifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
    const updated = notifications.filter((n: any) => n.id !== notificationId);
    localStorage.setItem(notificationsKey, JSON.stringify(updated));
    return { success: true };
  }

  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId);

  return { success: !error, error };
};

export const getNotifications = async (limit = 50) => {
  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    const notificationsKey = 'khaataKitab_notifications';
    const notifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
    return { data: notifications.slice(0, limit), error: null };
  }

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  return { data: data || [], error };
};

export const getUnreadCount = async () => {
  const userId = (await supabase.auth.getUser()).data.user?.id;

  if (!userId) {
    const notificationsKey = 'khaataKitab_notifications';
    const notifications = JSON.parse(localStorage.getItem(notificationsKey) || '[]');
    return notifications.filter((n: any) => !n.is_read).length;
  }

  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  return count || 0;
};
