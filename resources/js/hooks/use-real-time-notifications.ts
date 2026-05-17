import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

interface NotificationData {
  id?: string;
  type: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  created_at?: string;
  [key: string]: any;
}

export function useRealTimeNotifications(userId: number | null, notificationsPath?: string) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifications, setRecentNotifications] = useState<NotificationData[]>([]);
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (!userId || !window.Echo) return;

    const channel = window.Echo.private(`App.Models.User.${userId}`)
      .listen('.notification.created', (data: NotificationData) => {
        setRecentNotifications(prev => [data, ...prev].slice(0, 50));
        setUnreadCount(prev => prev + 1);

        toast(data.title, {
          description: data.message,
          duration: 5000,
          action: notificationsPath ? {
            label: 'View',
            onClick: () => window.location.href = notificationsPath,
          } : undefined,
        });
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        window.Echo.leave(`App.Models.User.${userId}`);
      }
    };
  }, [userId, notificationsPath]);

  const resetUnreadCount = () => setUnreadCount(0);

  return { unreadCount, recentNotifications, resetUnreadCount };
}
