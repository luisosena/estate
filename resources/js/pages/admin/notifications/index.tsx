import { Link, router } from '@inertiajs/react';
import { Bell, Check, CheckCheck, Filter, Trash2, X, AlertCircle, Info, Users, Shield } from 'lucide-react';
import { useState } from 'react';
import React from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import Pagination from '@/components/shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface NotificationData {
  title?: string;
  message?: string;
  priority?: 'high' | 'medium' | 'low';
  landlord_id?: number;
  landlord_email?: string;
  ended_count?: number;
  expiring_count?: number;
  [key: string]: any;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  created_at: string;
  read_at: string | null;
  data: NotificationData;
}

interface AdminNotificationsProps {
  notifications: {
    data: Notification[];
    meta: {
      current_page: number;
      total: number;
      links: Array<{
        url: string | null;
        label: string;
        active: boolean;
      }>;
    };
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

const getTypeIcon = (type: string, priority: string) => {
  if (type.includes('NewLandlordRegistered')) return <Users className="h-4 w-4" />;
  if (type.includes('LandlordVerified')) return <Shield className="h-4 w-4" />;
  if (type.includes('TenancyMassExpiry')) return <Bell className="h-4 w-4" />;
  if (type.includes('SystemError')) return <AlertCircle className="h-4 w-4" />;
  switch (priority) {
    case 'high': return <AlertCircle className="h-4 w-4" />;
    case 'medium': return <Bell className="h-4 w-4" />;
    default: return <Info className="h-4 w-4" />;
  }
};

export default function AdminNotifications({ notifications, unreadCount, filters }: AdminNotificationsProps) {
  const [localFilters, setLocalFilters] = useState(filters);

  const notificationList = notifications?.data || [];
  const meta = notifications?.meta || { total: 0, links: [] as any[] };
  const links = meta.links || [];

  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = { ...localFilters, [filterType]: value };
    setLocalFilters(newFilters);
    
    router.get(route('admin.notifications.index'), newFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const markAsRead = (id: string) => {
    router.put(route('admin.notifications.read', id), {}, {
      preserveScroll: true,
    });
  };

  const markAsUnread = (id: string) => {
    router.put(route('admin.notifications.unread', id), {}, {
      preserveScroll: true,
    });
  };

  const markAllAsRead = () => {
    router.put(route('admin.notifications.read-all'), {}, {
      preserveScroll: true,
    });
  };

  const deleteNotification = (id: string) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      router.delete(route('admin.notifications.destroy', id), {
        preserveScroll: true,
      });
    }
  };

  return (
    <AppLayout>
      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
        
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                <Shield className="w-3 h-3" />
                Admin Center
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              System Notifications
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor platform events, registrations, and system alerts
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {unreadCount > 0 && (
              <Button onClick={markAllAsRead} variant="outline" className="bg-card border-border/50 shadow-sm font-bold text-xs uppercase tracking-widest gap-2">
                <CheckCheck className="h-4 w-4" />
                Mark All Read
              </Button>
            )}
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="border-border/50 shadow-none bg-muted/20">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Events</CardTitle>
                <Bell className="h-4 w-4 text-muted-foreground/50" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-foreground">{meta.total}</div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-none bg-rose-500/5 border-rose-500/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-rose-600">Unread</CardTitle>
                <div className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-rose-600">{unreadCount}</div>
              </CardContent>
            </Card>

            <Card className="border-border/50 shadow-none bg-emerald-500/5 border-emerald-500/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-emerald-600">Acknowledged</CardTitle>
                <Check className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-black text-emerald-600">{meta.total - unreadCount}</div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card className="border-border/50 shadow-sm">
            <CardContent className="py-4">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Filter Stream</span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Status</label>
                  <Select value={localFilters.filter} onValueChange={(value) => handleFilterChange('filter', value)}>
                    <SelectTrigger className="w-32 bg-muted/30 border-none shadow-none text-xs font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="unread">Unread Only</SelectItem>
                      <SelectItem value="read">Read Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Category</label>
                  <Select value={localFilters.type} onValueChange={(value) => handleFilterChange('type', value)}>
                    <SelectTrigger className="w-48 bg-muted/30 border-none shadow-none text-xs font-semibold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="App\Notifications\NewLandlordRegistered">New Landlords</SelectItem>
                      <SelectItem value="App\Notifications\LandlordVerified">Verified Landlords</SelectItem>
                      <SelectItem value="App\Notifications\TenancyMassExpiry">Tenancy Summary</SelectItem>
                      <SelectItem value="App\Notifications\SystemError">System Errors</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications List */}
          <Card className="border-border/50 shadow-sm overflow-hidden">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold">Recent Events</CardTitle>
                  <CardDescription>
                    {notificationList.length === 0 
                      ? 'No system events found' 
                      : `Reviewing ${notificationList.length} recent platform events`
                    }
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {notificationList.length === 0 ? (
                <div className="py-24 text-center">
                  <Bell className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
                  <h3 className="text-sm font-bold text-foreground mb-1">Inbox Empty</h3>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">No notifications found matching your current filter criteria.</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {notificationList.map((notification) => (
                    <div
                      key={notification.id}
                      className={`flex items-start justify-between p-5 transition-all group ${
                        notification.read_at ? 'opacity-80' : 'bg-primary/[0.02]'
                      }`}
                    >
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className={`mt-1 h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                            notification.read_at 
                            ? 'bg-muted/50 text-muted-foreground border-border/50' 
                            : 'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {getTypeIcon(notification.type, notification.priority)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h3 className={`text-sm font-bold truncate ${notification.read_at ? 'text-muted-foreground' : 'text-foreground font-black'}`}>
                              {notification.title}
                            </h3>
                            <Badge variant="outline" className={`${getPriorityColor(notification.priority)} text-[10px] border-none uppercase font-bold px-1.5 h-4`}>
                              {notification.priority}
                            </Badge>
                            {!notification.read_at && (
                              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed max-w-3xl">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2.5">
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{formatDate(notification.created_at)}</span>
                            {notification.data.landlord_email && (
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                {notification.data.landlord_email}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 ml-4 self-center">
                        {!notification.read_at ? (
                          <Button
                            onClick={() => markAsRead(notification.id)}
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            onClick={() => markAsUnread(notification.id)}
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            title="Mark as unread"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          onClick={() => deleteNotification(notification.id)}
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
              <div className="p-4 border-t bg-muted/20">
                <Pagination links={links} />
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </AppLayout>
  );
}
