import { Link, router, usePage } from '@inertiajs/react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  Filter, 
  Trash2, 
  X, 
  CreditCard, 
  Zap,
  CalendarDays,
  Info,
  Archive,
  Search,
  AlertCircle
} from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { MetricCard } from '@/components/shared/DashboardComponents';
import Pagination from '@/components/shared/Pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';
import { type SharedData } from '@/types';

interface NotificationData {
  title?: string;
  message?: string;
  priority?: 'high' | 'medium' | 'low';
  payment_id?: number;
  utility_id?: number;
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

interface TenantNotificationsProps {
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

const getPriorityVariant = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'destructive';
    case 'medium':
      return 'secondary';
    case 'low':
      return 'outline';
    default:
      return 'outline';
  }
};

  const getTypeIcon = (type: string) => {
  const t = type.toLowerCase();
  if (t.includes('expiring')) {
    return <CalendarDays className="h-4 w-4 text-warning" />;
  } else if (t.includes('ended')) {
    return <Archive className="h-4 w-4 text-chart-4" />;
  } else if (t.includes('payment')) {
    return <CreditCard className="h-4 w-4 text-success" />;
  } else if (t.includes('utility')) {
    return <Zap className="h-4 w-4 text-chart-2" />;
  }
  return <Bell className="h-4 w-4 text-muted-foreground" />;
};

export default function TenantNotifications({ notifications, unreadCount, filters }: TenantNotificationsProps) {
  const { auth } = usePage<SharedData>().props;
  const [localFilters, setLocalFilters] = useState(filters);

  const notificationList = notifications?.data || [];
  const meta = notifications?.meta || { total: 0, links: [] as any[] };
  const links = meta.links || [];

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
                        <Badge variant="outline" className="text-[10px] bg-card font-black text-muted-foreground border-border/50 flex gap-1.5 items-center uppercase tracking-widest leading-none">
                            <Bell className="w-3 h-3" />
                            Security & Alerts
                        </Badge>
                    </div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black tracking-tight text-foreground">
                            Activity Hub
                        </h1>
                        {unreadCount > 0 && (
                            <Badge variant="destructive" className="rounded-full px-2 py-0 h-5 text-[10px] font-black uppercase tracking-widest border-none shadow-lg shadow-destructive/20">
                                {unreadCount} NEW
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Review your lease milestones, payment status, and system updates.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0} className="bg-card border-border/50 shadow-sm font-bold text-xs uppercase tracking-widest gap-2">
                        <CheckCheck className="h-4 w-4" />
                        Clear All
                    </Button>
                </div>
            </div>
        </header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <MetricCard
                title="Total Alerts"
                value={meta.total}
                icon={Bell}
                description="Cumulative history"
            />
            <MetricCard
                title="Pending Review"
                value={unreadCount}
                icon={AlertCircle}
                description="Requiring your attention"
                alert={unreadCount > 0}
            />
            <MetricCard
                title="Archived"
                value={meta.total - unreadCount}
                icon={Check}
                description="Status processed"
            />
        </section>

        {/* Filters Area */}
        <section className="flex flex-col gap-6">
            <Card className="border-border/50 shadow-sm overflow-hidden border-none rounded-none bg-transparent">
                <CardContent className="p-0 flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-xl border border-border/50">
                        <div className="flex items-center gap-2 pl-2">
                            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">Status</span>
                        </div>
                        <Select value={localFilters.filter} onValueChange={(v) => handleFilterChange('filter', v)}>
                            <SelectTrigger className="w-32 h-8 bg-card border-none shadow-none text-xs font-bold ring-0 focus:ring-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-border/50 shadow-xl">
                                <SelectItem value="all">All Items</SelectItem>
                                <SelectItem value="unread">Unread Only</SelectItem>
                                <SelectItem value="read">Processed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center gap-4 bg-muted/20 p-2 rounded-xl border border-border/50">
                        <div className="flex items-center gap-2 pl-2">
                            <Search className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest whitespace-nowrap">Category</span>
                        </div>
                        <Select value={localFilters.type} onValueChange={(v) => handleFilterChange('type', v)}>
                            <SelectTrigger className="w-48 h-8 bg-card border-none shadow-none text-xs font-bold ring-0 focus:ring-0">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-border/50 shadow-xl">
                                <SelectItem value="all">Any Record</SelectItem>
                                <SelectItem value="App\Notifications\TenancyExpiringNotification">Lease Expiry</SelectItem>
                                <SelectItem value="App\Notifications\TenancyEndedNotification">Vacancy Status</SelectItem>
                                <SelectItem value="App\Notifications\PaymentDueNotification">Financial Alerts</SelectItem>
                                <SelectItem value="App\Notifications\UtilityNotification">Service Alerts</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications List Card */}
            <Card className="shadow-none border-border/50 overflow-hidden border-none rounded-none bg-transparent">
                <CardHeader className="px-0 pt-0 pb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-xl font-black">Record Stream</CardTitle>
                            <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                {notificationList.length === 0 
                                    ? 'No operational records identified.' 
                                    : `Reviewing ${notificationList.length} recent system updates.`}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden shadow-sm">
                        {notificationList.length === 0 ? (
                            <div className="py-24 text-center flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center border border-border/50">
                                    <Bell className="w-8 h-8 text-muted-foreground/20" />
                                </div>
                                <div className="max-w-xs mx-auto">
                                    <h3 className="text-sm font-black uppercase tracking-widest">Inbox Synchronized</h3>
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter mt-1 opacity-70">
                                        All historical operational records have been processed or none matching your criteria exist.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-border/30">
                                {notificationList.map((notification) => (
                                    <div
                                        key={notification.id}
                                        className={cn(
                                            "group flex items-start gap-4 p-6 transition-all",
                                            notification.read_at 
                                                ? "bg-muted/5 opacity-70" 
                                                : "bg-primary/[0.01] border-l-[3px] border-l-primary"
                                        )}
                                    >
                                        <div className={cn(
                                            "mt-1 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all",
                                            notification.read_at ? "bg-muted/50 border-border/50 text-muted-foreground" : "bg-primary/5 border-primary/20 text-primary shadow-sm"
                                        )}>
                                            {getTypeIcon(notification.type)}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2">
                                                <h4 className={cn(
                                                    "text-sm font-black truncate group-hover:text-primary transition-colors uppercase tracking-tight",
                                                    notification.read_at ? "text-muted-foreground" : "text-foreground"
                                                )}>
                                                    {notification.title}
                                                </h4>
                                                {!notification.read_at && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                                )}
                                            </div>
                                            <p className={cn(
                                                "text-xs leading-relaxed",
                                                notification.read_at ? "text-muted-foreground/60" : "text-muted-foreground font-bold"
                                            )}>
                                                {notification.message}
                                            </p>
                                            
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                    <CalendarDays className="w-3.5 h-3.5 opacity-50" />
                                                    {formatDate(notification.created_at)}
                                                </div>
                                                
                                                <Badge variant={getPriorityVariant(notification.priority)} className="rounded-full text-[9px] px-2 py-0 border-none shadow-none font-black uppercase tracking-widest h-4">
                                                    {notification.priority}
                                                </Badge>

                                                {(notification.data.payment_id || notification.data.utility_id) && (
                                                    <Button variant="link" size="sm" asChild className="h-auto p-0 text-[10px] font-black uppercase tracking-widest text-primary hover:no-underline">
                                                        <Link href={notification.data.payment_id ? route('tenant.payments') : route('tenant.utilities')}>
                                                            Explore Record &rarr;
                                                        </Link>
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100">
                                            {!notification.read_at ? (
                                                <Button
                                                    onClick={() => markAsRead(notification.id)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-success hover:bg-success/10 transition-colors"
                                                    title="Process"
                                                >
                                                    <Check className="h-4 w-4" />
                                                </Button>
                                            ) : (
                                                <Button
                                                    onClick={() => markAsUnread(notification.id)}
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 rounded-full text-muted-foreground hover:text-warning hover:bg-warning/10 transition-colors"
                                                    title="Re-open"
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <Button
                                                onClick={() => deleteNotification(notification.id)}
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                                title="Delete Record"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
                
                 {/* Pagination Footer */}
                <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        Activity Stream: {meta.total} records discovered
                    </p>
                    <Pagination links={links} />
                </div>
            </Card>
        </section>

    </main>
  );
}

TenantNotifications.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
