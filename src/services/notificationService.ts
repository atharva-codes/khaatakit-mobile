import { supabase, NotificationType } from '@/lib/supabase';
import { toast } from 'sonner';

interface NotificationPayload {
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, any>;
}

const getNotificationIcon = (type: NotificationType): string => {
  switch (type) {
    case 'income':
      return '💰';
    case 'expense':
      return '⚠️';
    case 'insight':
      return '📊';
    case 'reminder':
      return '🔔';
    default:
      return '📬';
  }
};

export const sendNotification = async (payload: NotificationPayload): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.warn('No authenticated user found');
      return;
    }

    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (preferences?.app_notifications_enabled !== false) {
      const icon = getNotificationIcon(payload.type);
      toast(`${icon} ${payload.title}`, {
        description: payload.message,
        duration: 5000,
      });
    }

    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: payload.type,
        title: payload.title,
        message: payload.message,
        metadata: payload.metadata,
      });

    if (error) {
      console.error('Failed to save notification:', error);
    }

    if (preferences?.sms_alerts_enabled && preferences?.phone_number) {
      await sendSMS(preferences.phone_number, `${payload.title}: ${payload.message}`);
    }
  } catch (error) {
    console.error('Error sending notification:', error);
  }
};

const sendSMS = async (phoneNumber: string, message: string): Promise<void> => {
  try {
    console.log(`SMS would be sent to ${phoneNumber}: ${message}`);
  } catch (error) {
    console.error('Failed to send SMS:', error);
  }
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    console.error('Failed to mark notification as read:', error);
    throw error;
  }
};

export const deleteNotification = async (notificationId: string): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId);

  if (error) {
    console.error('Failed to delete notification:', error);
    throw error;
  }
};

export const markAllAsRead = async (): Promise<void> => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return;

  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false);

  if (error) {
    console.error('Failed to mark all notifications as read:', error);
    throw error;
  }
};
