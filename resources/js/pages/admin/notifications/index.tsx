import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell } from 'lucide-react';

interface Props {
  notifications: {
    data: any[];
    total: number;
  };
  unreadCount: number;
}

export default function Notifications({ notifications, unreadCount }: Props) {
  return (
    <main className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">System Notifications</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage and view system-wide alerts and updates.</p>
      </header>

      <Card className="border-border/50 shadow-none">
        <CardHeader>
          <CardTitle className="text-lg font-bold">Inbox</CardTitle>
          <CardDescription>You have {unreadCount} unread notifications.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
            <Bell className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-sm font-bold text-foreground">No recent notifications</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-[250px]">
            System-level notifications are not yet implemented for the Admin portal. Check back later for updates.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}

Notifications.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
