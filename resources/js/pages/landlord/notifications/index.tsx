import { Link, router } from '@inertiajs/react';
import { Bell, Check, CheckCheck, Filter, Trash2, X } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import React from 'react';
import { route } from 'ziggy-js';

import LandlordLayout from '@/components/layout/LandlordLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
interface Notification {
  id: string;
  type: string;
  created_at: string;
  read_at: string | null;
  data: {
    title?: string;
    message?: string;
    priority?: 'high' | 'medium' | 'low';
    [key: string]: any;
  };
}

interface NotificationsProps {
  notifications: {
    data: Notification[];
    links: any;
    meta: any;
  };
  unreadCount: number;
  filters: {
    filter: string;
    type: string;
  };
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-500/30';
    case 'medium':
      return 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-500/30';
    case 'low':
      return 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30';
    default:
      return 'bg-muted text-muted-foreground border-border/50';
  }
};

const getTypeIcon = (type: string) => {
  if (type.includes('expiring')) {
    return <Bell className="h-4 w-4 text-orange-500" />;
  } else if (type.includes('ended')) {
    return <Check className="h-4 w-4 text-blue-500" />;
  }
  return <Bell className="h-4 w-4 text-gray-500" />;
};

export default function Notifications({ notifications, unreadCount, filters }: NotificationsProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isLoading, setIsLoading] = useState(false);

  // Transform notification data on the frontend
  const transformedNotifications = useMemo(() => {
    return notifications.data.map((notification: any) => {
      const data = notification.data || {};
      
      return {
        id: notification.id,
        type: notification.type,
        title: data.title || 'Notification',
        message: data.message || '',
        priority: data.priority || 'medium',
        created_at: notification.created_at,
        read_at: notification.read_at,
        data: data,
      };
    });
  }, [notifications.data]);

  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = { ...localFilters, [filterType]: value };
    setLocalFilters(newFilters);
    
    router.get(route('landlord.notifications.index'), newFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const markAsRead = (id: string) => {
    router.put(route('landlord.notifications.read', id), {}, {
      preserveScroll: true,
      onSuccess: () => {
        // Update local state
        const updatedNotifications = transformedNotifications.map(n => 
          n.id === id ? { ...n, read_at: new Date().toISOString() } : n
        );
        // Update the notifications data object
        notifications.data = updatedNotifications;
      },
    });
  };

  const markAsUnread = (id: string) => {
    router.put(route('landlord.notifications.unread', id), {}, {
      preserveScroll: true,
      onSuccess: () => {
        // Update local state
        const updatedNotifications = transformedNotifications.map(n => 
          n.id === id ? { ...n, read_at: null } : n
        );
        // Update the notifications data object
        notifications.data = updatedNotifications;
      },
    });
  };

  const markAllAsRead = () => {
    router.put(route('landlord.notifications.read-all'), {}, {
      preserveScroll: true,
      onSuccess: () => {
        // Update local state
        const updatedNotifications = transformedNotifications.map(n => 
          ({ ...n, read_at: new Date().toISOString() })
        );
        // Update the notifications data object
        notifications.data = updatedNotifications;
      },
    });
  };

  const deleteNotification = (id: string) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      router.delete(route('landlord.notifications.destroy', id), {
        preserveScroll: true,
        onSuccess: () => {
          // Update local state
          const updatedNotifications = transformedNotifications.filter(n => n.id !== id);
          // Update the notifications data object
          notifications.data = updatedNotifications;
        },
      });
    }
  };

  return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                  <Bell className="w-3 h-3" />
                  System Center
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Activity Hub
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your system alerts, updates, and messages
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              {unreadCount > 0 && (
                <Button onClick={markAllAsRead} variant="outline" className="bg-card border-border/50 shadow-sm">
                  <CheckCheck className="mr-2 h-4 w-4" />
                  Mark All Read
                </Button>
              )}
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6">
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {notifications?.meta?.total || 0}
              </div>
              <p className="text-xs text-muted-foreground">All notifications</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread</CardTitle>
              <div className="h-2 w-2 rounded-full bg-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{unreadCount}</div>
              <p className="text-xs text-muted-foreground">Pending your attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Read</CardTitle>
              <Check className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {(notifications?.meta?.total || 0) - unreadCount}
              </div>
              <p className="text-xs text-muted-foreground">Already viewed</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Status:</label>
                <Select value={localFilters.filter} onValueChange={(value) => handleFilterChange('filter', value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm font-medium">Type:</label>
                <Select value={localFilters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="App\Notifications\TenancyExpiringNotification">Expiring</SelectItem>
                    <SelectItem value="App\Notifications\TenancyEndedNotification">Ended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Notifications</CardTitle>
            <CardDescription>
              {transformedNotifications.length === 0 
                ? 'No notifications found' 
                : `Showing ${transformedNotifications.length} of ${notifications.meta.total} notifications`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {transformedNotifications.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                <Bell className="mx-auto mb-4 h-12 w-12 opacity-50" />
                <p>No notifications found</p>
                <p className="text-sm">Notifications will appear here when there are updates</p>
              </div>
            ) : (
              <div className="space-y-4">
                {transformedNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`flex items-start justify-between rounded-lg border p-4 transition-colors ${
                      notification.read_at ? 'bg-muted/30' : 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-900/30'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium truncate">{notification.data?.title || 'Notification'}</h3>
                          <Badge className={getPriorityColor(notification.data?.priority || 'medium')}>
                            {notification.data?.priority || 'medium'}
                          </Badge>
                          {!notification.read_at && (
                            <div className="h-2 w-2 rounded-full bg-blue-500" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {notification.data?.message || ''}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatDate(notification.created_at)}</span>
                          {notification.data.tenant_id && (
                            <Link
                              href={route('landlord.tenants.show', {
                                tenant: notification.data.tenant_code || notification.data.tenant_id
                              })}
                              className="text-blue-600 hover:underline"
                            >
                              View Tenant
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      {!notification.read_at ? (
                        <Button
                          onClick={() => markAsRead(notification.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button
                          onClick={() => markAsUnread(notification.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Mark as unread"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        onClick={() => deleteNotification(notification.id)}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {notifications.links && notifications.links.length > 3 && (
              <div className="mt-6 flex justify-center">
                <div className="flex gap-1">
                  {notifications.links.map((link: any, index: number) => (
                    <Link
                      key={index}
                      href={link.url || '#'}
                      className={`px-3 py-2 text-sm rounded ${
                        link.active
                          ? 'bg-primary text-primary-foreground'
                          : link.url
                          ? 'bg-muted hover:bg-muted/80'
                          : 'bg-muted/50 text-muted cursor-not-allowed'
                      }`}
                      dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          </Card>
          </div>
        </main>
  );
}

Notifications.layout = (page: React.ReactNode) => <LandlordLayout>{page}</LandlordLayout>;
