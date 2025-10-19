import { useState, useEffect } from 'react';
import { Bell, Trash2, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Lightbulb, Clock, Settings } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from '@/services/notificationService';
import { Notification, NotificationType } from '@/lib/supabase';

interface NotificationsScreenProps {
  onNavigateToSettings: () => void;
}

export const NotificationsScreen = ({ onNavigateToSettings }: NotificationsScreenProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const loadNotifications = async () => {
    setLoading(true);
    const { data } = await getNotifications();
    setNotifications(data);
    setLoading(false);
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: string) => {
    await markNotificationAsRead(notificationId);
    setNotifications(
      notifications.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      )
    );
  };

  const handleMarkAllAsRead = async () => {
    await markAllNotificationsAsRead();
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
  };

  const handleDelete = async (notificationId: string) => {
    await deleteNotification(notificationId);
    setNotifications(notifications.filter((n) => n.id !== notificationId));
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'income':
        return <TrendingUp className="h-5 w-5 text-success" />;
      case 'expense':
        return <TrendingDown className="h-5 w-5 text-destructive" />;
      case 'insight':
        return <Lightbulb className="h-5 w-5 text-primary" />;
      case 'reminder':
        return <Clock className="h-5 w-5 text-warning" />;
    }
  };

  const getPriorityVariant = (priority: string): "destructive" | "default" | "secondary" => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'default';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="animate-fade-in">
      <div className="bg-primary text-primary-foreground p-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-1 flex items-center gap-2">
              <Bell className="h-6 w-6" />
              Notifications
            </h1>
            <p className="text-sm opacity-90">
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onNavigateToSettings}
            className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark all as read
          </Button>
        )}

        {loading ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading notifications...</p>
          </Card>
        ) : notifications.length === 0 ? (
          <Card className="p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
            <h3 className="font-semibold text-foreground mb-1">No notifications yet</h3>
            <p className="text-sm text-muted-foreground">
              You'll receive alerts here when you add transactions
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 transition-all duration-200 hover:shadow-md ${
                  !notification.is_read ? 'bg-primary/5 border-primary/30' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="pt-1">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-semibold text-foreground flex items-center gap-2">
                          {notification.title}
                          {!notification.is_read && (
                            <span className="h-2 w-2 bg-primary rounded-full" />
                          )}
                        </h3>
                        {notification.category && (
                          <Badge variant="secondary" className="text-xs mt-1">
                            {notification.category}
                          </Badge>
                        )}
                      </div>
                      <Badge variant={getPriorityVariant(notification.priority)} className="shrink-0 text-xs">
                        {notification.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    {notification.amount && (
                      <p className="text-sm font-semibold mb-2">
                        Amount: ₹{notification.amount.toLocaleString()}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.created_at)}
                      </p>
                      <div className="flex gap-2">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-7 text-xs"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Mark read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(notification.id)}
                          className="h-7 text-xs text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
