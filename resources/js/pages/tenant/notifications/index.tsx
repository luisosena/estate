import { Link, router, usePage } from '@inertiajs/react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Filter, 
  Trash2, 
  X, 
  Home, 
  CreditCard, 
  Zap,
  CalendarDays,
  Info,
  Archive,
  Search,
} from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';

import TenantLayout from '@/components/layout/TenantLayout';
import { MetricCard } from '@/components/shared/DashboardComponents';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { formatDate, getFormattedDate, getStatusVariant } from '@/lib/formatters';
import { type SharedData } from '@/types';

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

interface TenantNotificationsProps {
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



const getPriorityVariant = (priority: string): "destructive" | "default" | "secondary" | "outline" => {
  switch (priority) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'default';
    case 'low':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getTypeIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('expiring')) {
    return <CalendarDays className="h-4 w-4 text-orange-500" />;
  } else if (t.includes('ended')) {
    return <Archive className="h-4 w-4 text-blue-500" />;
  } else if (t.includes('payment')) {
    return <CreditCard className="h-4 w-4 text-green-500" />;
  } else if (t.includes('utility')) {
    return <Zap className="h-4 w-4 text-purple-500" />;
  }
  return <Bell className="h-4 w-4 text-muted-foreground" />;
};

export default function TenantNotifications({ notifications, unreadCount, filters }: TenantNotificationsProps) {
  const { auth } = usePage<SharedData>().props;
  const [localFilters, setLocalFilters] = useState(filters);

  // Transform notification data on the frontend
  const transformedNotifications = (notifications?.data || []).map((notification: any) => {
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

  const handleFilterChange = (filterType: string, value: string) => {
    const newFilters = { ...localFilters, [filterType]: value };
    setLocalFilters(newFilters);
    router.get(route('tenant.notifications.index'), newFilters, {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const markAsRead = (id: string) => {
    router.put(route('tenant.notifications.read', id), {}, { preserveScroll: true });
  };

  const markAsUnread = (id: string) => {
    router.put(route('tenant.notifications.unread', id), {}, { preserveScroll: true });
  };

  const markAllAsRead = () => {
    router.put(route('tenant.notifications.read-all'), {}, { preserveScroll: true });
  };

  const deleteNotification = (id: string) => {
    if (confirm('Are you sure you want to delete this notification?')) {
      router.delete(route('tenant.notifications.destroy', id), { preserveScroll: true });
    }
  };

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
        
        {/* Header Section */}
        <header className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <SidebarTrigger className="-ml-2 md:hidden" />
                        <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                            <Bell className="w-3 h-3" />
                            Security & Alerts
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                            Inbox
                        </h1>
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="rounded-full px-2 py-0 h-5 text-[10px] font-bold">
                                {unreadCount} NEW
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Keep track of your lease milestones, payment status, and utility alerts.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0} className="bg-card border-border/50 shadow-sm">
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Clear All
                    </Button>
                </div>
            </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
                title="Total Alerts"
                value={notifications?.meta?.total || 0}
                icon={Bell}
                description="Cumulative notifications"
            />
            <MetricCard
                title="Unread Attention"
                value={unreadCount}
                icon={Info}
                description="Requiring your review"
                alert={unreadCount > 0}
            />
            <MetricCard
                title="Read History"
                value={(notifications?.meta?.total || 0) - unreadCount}
                icon={Check}
                description="Status processed"
            />
        </section>

        {/* Filters & Actions Area */}
        <section className="flex flex-col gap-4">
            <Card className="shadow-none border-border/50 bg-muted/20">
                <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-4 items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Status</span>
                            <Select value={localFilters.filter} onValueChange={(v) => handleFilterChange('filter', v)}>
                                <SelectTrigger className="w-32 h-9 bg-card">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Items</SelectItem>
                                    <SelectItem value="unread">Unread</SelectItem>
                                    <SelectItem value="read">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center gap-2 border-l pl-4 border-border/50">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Filter By Type</span>
                            <Select value={localFilters.type} onValueChange={(v) => handleFilterChange('type', v)}>
                                <SelectTrigger className="w-48 h-9 bg-card">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Any Notification</SelectItem>
                                    <SelectItem value="App\Notifications\TenancyExpiringNotification">Lease Expiry</SelectItem>
                                    <SelectItem value="App\Notifications\TenancyEndedNotification">Property Vacancy</SelectItem>
                                    <SelectItem value="App\Notifications\PaymentDueNotification">Finance Alerts</SelectItem>
                                    <SelectItem value="App\Notifications\UtilityNotification">Utility Usage</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications List Card */}
            <Card className="shadow-none border-border/50 overflow-hidden">
                <CardHeader className="border-b bg-muted/5">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-lg">Recent Alerts</CardTitle>
                            <CardDescription>
                                {transformedNotifications.length === 0 
                                    ? 'No matching notifications found.' 
                                    : `Viewing ${transformedNotifications.length} communications.`}
                            </CardDescription>
                        </div>
                        <Search className="w-5 h-5 text-muted-foreground opacity-30" />
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {transformedNotifications.length === 0 ? (
                        <div className="py-24 text-center flex flex-col items-center gap-4">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                <Bell className="w-8 h-8 text-muted-foreground opacity-20" />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold">Tidy Inbox!</h3>
                                <p className="text-sm text-muted-foreground max-w-xs mx-auto mt-1">
                                    You don't have any priority notifications at the moment. Check back later for updates.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {transformedNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "group flex items-start gap-4 p-5 transition-all",
                                        notification.read_at 
                                            ? "bg-muted/10 opacity-75" 
                                            : "bg-card border-l-[3px] border-l-primary shadow-[inset_0_1px_0_0_rgba(255,255,255,0.02)]"
                                    )}
                                >
                                    <div className={cn(
                                        "mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border",
                                        notification.read_at ? "bg-muted border-border" : "bg-primary/5 border-primary/10 shadow-sm"
                                    )}>
                                        {getTypeIcon(notification.type)}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className={cn(
                                                "font-bold truncate group-hover:text-primary transition-colors",
                                                notification.read_at ? "text-muted-foreground" : "text-foreground"
                                            )}>
                                                {notification.title}
                                            </h4>
                                            {!notification.read_at && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shrink-0" />
                                            )}
                                        </div>
                                        <p className={cn(
                                            "text-sm leading-relaxed",
                                            notification.read_at ? "text-muted-foreground/70" : "text-muted-foreground font-medium"
                                        )}>
                                            {notification.message}
                                        </p>
                                        
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-xs">
                                            <div className="flex items-center gap-1.5 text-muted-foreground font-medium">
                                                <CalendarDays className="w-3.5 h-3.5" />
                                                {formatDate(notification.created_at)}
                                            </div>
                                            
                                            <Badge variant={getPriorityVariant(notification.priority)} className="rounded-full text-[9px] px-2 py-0 border-none shadow-none font-black uppercase tracking-tighter">
                                                {notification.priority} priority
                                            </Badge>

                                            {notification.data.payment_id && (
                                                <Button variant="link" size="sm" asChild className="h-auto p-0 text-primary font-bold hover:no-underline">
                                                    <Link href={route('tenant.payments')}>Log Payment Record &rarr;</Link>
                                                </Button>
                                            )}
                                            {notification.data.utility_id && (
                                                <Button variant="link" size="sm" asChild className="h-auto p-0 text-primary font-bold hover:no-underline">
                                                    <Link href={route('tenant.utilities')}>Check Service Usage &rarr;</Link>
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {!notification.read_at ? (
                                            <Button
                                                onClick={() => markAsRead(notification.id)}
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-full border-border/50 text-foreground"
                                                title="Archive"
                                            >
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        ) : (
                                            <Button
                                                onClick={() => markAsUnread(notification.id)}
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 rounded-full border-border/50 text-muted-foreground"
                                                title="Mark as unread"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => deleteNotification(notification.id)}
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full text-destructive hover:bg-destructive/10"
                                            title="Permanently remove"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
                
                {/* Pagination Footer */}
                {notifications.links && notifications.links.length > 3 && (
                    <CardFooter className="p-4 border-t bg-muted/5 flex items-center justify-between">
                        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">
                            Page {notifications.meta?.current_page} of {notifications.meta?.last_page}
                        </div>
                        <div className="flex gap-1.5">
                            {notifications.links.map((link: any, idx: number) => (
                                <Button
                                    key={idx}
                                    variant={link.active ? "default" : "outline"}
                                    size="sm"
                                    className="h-8 min-w-[2rem] px-2 shadow-sm rounded-lg"
                                    asChild={!!link.url}
                                    disabled={!link.url}
                                >
                                    {link.url ? (
                                        <Link href={link.url} dangerouslySetInnerHTML={{ __html: link.label.replace('&laquo;', '').replace('&raquo;', '').trim() || (idx === 0 ? 'Prev' : 'Next') }} />
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: link.label.replace('&laquo;', '').replace('&raquo;', '').trim() || (idx === 0 ? 'Prev' : 'Next') }} />
                                    )}
                                </Button>
                            ))}
                        </div>
                    </CardFooter>
                )}
            </Card>
        </section>

    </main>
  );
}


TenantNotifications.layout = (page: React.ReactNode) => <TenantLayout>{page}</TenantLayout>;
