import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Bell, Check, CheckCheck, ExternalLink, X, CreditCard, Zap } from 'lucide-react';
import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { useEffect, useState } from 'react';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  read_at: string | null;
  data: any;
}

interface TenantNotificationBellProps {
  initialUnreadCount?: number;
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
  return `${Math.floor(diffMins / 1440)}d ago`;
};

const getTypeIcon = (type: string) => {
  if (type.includes('expiring')) {
    return <Bell className="h-4 w-4 text-orange-500" />;
  } else if (type.includes('ended')) {
    return <Check className="h-4 w-4 text-blue-500" />;
  } else if (type.includes('payment')) {
    return <CreditCard className="h-4 w-4 text-green-500" />;
  } else if (type.includes('utility')) {
    return <Zap className="h-4 w-4 text-purple-500" />;
  }
  return <Bell className="h-4 w-4 text-gray-500" />;
};

export default function TenantNotificationBell({ initialUnreadCount = 0 }: TenantNotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch recent notifications when dropdown opens
  useEffect(() => {
    if (isOpen) {
      fetchRecentNotifications();
    }
  }, [isOpen]);

  // Poll for unread count every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(route('tenant.notifications.unread-count'));
      const data = await response.json();
      setUnreadCount(data.count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      const response = await fetch(route('tenant.notifications.recent'));
      const data = await response.json();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error('Failed to fetch recent notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await router.put(route('tenant.notifications.read', id), {}, {
        preserveScroll: true,
        onSuccess: () => {
          // Update local state
          setNotifications(prev => 
            prev.map(n => n.id === id ? { ...n, read_at: new Date().toISOString() } : n)
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        },
      });
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await router.put(route('tenant.notifications.read-all'), {}, {
        preserveScroll: true,
        onSuccess: () => {
          // Update local state
          setNotifications(prev => 
            prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
          );
          setUnreadCount(0);
        },
      });
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              onClick={markAllAsRead}
              variant="ghost"
              size="sm"
              className="h-auto p-1 text-xs"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground">
            <Bell className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <>
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${!notification.read_at ? 'bg-blue-50/50' : ''}`}
              >
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-1">
                    {getTypeIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`text-sm font-medium truncate ${
                        !notification.read_at ? 'text-blue-600' : ''
                      }`}>
                        {notification.title}
                      </p>
                      {!notification.read_at && (
                        <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatDate(notification.created_at)}
                      </span>
                      <div className="flex items-center gap-1">
                        {notification.data.payment_id && (
                          <Link
                            href={route('tenant.payments')}
                            className="text-blue-600 hover:text-blue-800"
                            title="View payment"
                          >
                            <CreditCard className="h-3 w-3" />
                          </Link>
                        )}
                        {notification.data.utility_id && (
                          <Link
                            href={route('tenant.utilities')}
                            className="text-blue-600 hover:text-blue-800"
                            title="View utilities"
                          >
                            <Zap className="h-3 w-3" />
                          </Link>
                        )}
                        {!notification.read_at && (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            title="Mark as read"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href={route('tenant.notifications.index')}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-800"
              >
                View all notifications
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
