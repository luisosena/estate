/*
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Home, 
  BarChart3, 
  Users, 
  Settings, 
  Search,
  Bell,
  Download,
  Send,
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  Activity,
  CreditCard
} from 'lucide-react';

export default function Dashboard() {
  const [message, setMessage] = useState('');

  const payments = [
    { name: 'Kenneth Thompson', email: 'ken99@yahoo.com', amount: '$316.00', status: 'success' },
    { name: 'Abraham Lincoln', email: 'abe45@gmail.com', amount: '$242.00', status: 'success' },
    { name: 'Monserrat Rodriguez', email: 'monserrat44@gmail.com', amount: '$837.00', status: 'processing' },
    { name: 'Silas Johnson', email: 'silas22@gmail.com', amount: '$874.00', status: 'success' },
    { name: 'Carmella DeVito', email: 'carmella@hotmail.com', amount: '$721.00', status: 'failed' },
    { name: 'Maria Garcia', email: 'maria@gmail.com', amount: '$529.00', status: 'success' },
    { name: 'James Wilson', email: 'james34@outlook.com', amount: '$438.00', status: 'processing' },
    { name: 'Sarah Jones', email: 'sarah.j@yahoo.com', amount: '$692.00', status: 'success' },
  ];

  const teamMembers = [
    { name: 'Toby Belhome', email: 'contact@bundui.io', role: 'Viewer' },
    { name: 'Jackson Lee', email: 'pre@example.com', role: 'Developer' },
    { name: 'Hally Gray', email: 'hally@site.com', role: 'Viewer' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar }
      <aside className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-black rounded"></div>
            <span className="font-semibold">Shadcn UI Kit</span>
          </div>
          
          <nav className="space-y-1">
            <Button variant="ghost" className="w-full justify-start bg-gray-100">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Users className="w-4 h-4 mr-2" />
              Team
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </nav>
        </div>

        <div className="p-6 border-t">
          <Card>
            <CardHeader className="p-4">
              <CardTitle className="text-sm">Download</CardTitle>
              <CardDescription className="text-xs">
                Unlock lifetime access to all dashboards, templates and components.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Button className="w-full" size="sm">Get Shadcn UI Kit</Button>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Main Content }
      <div className="flex-1 overflow-auto">
        {/* Header }
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input 
                  placeholder="Search..." 
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <Bell className="w-5 h-5" />
              </Button>
              <Avatar>
                <AvatarFallback>TB</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Dashboard Content }
        <main className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <p className="text-sm text-gray-500">26 Dec 2025 - 22 Jan 2026</p>
            </div>
            <Button>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Stats Grid }
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$15,231.89</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Subscriptions</CardTitle>
                <Users className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+4850</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +180.1% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Sales</CardTitle>
                <CreditCard className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+12,234</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +19% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Active Now</CardTitle>
                <Activity className="w-4 h-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+573</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +201 since last hour
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Grid }
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column }
            <div className="lg:col-span-2 space-y-6">
              {/* Team Members }
              <Card>
                <CardHeader>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Invite your team members to collaborate.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMembers.map((member, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{member.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{member.name}</p>
                            <p className="text-xs text-gray-500">{member.email}</p>
                          </div>
                        </div>
                        <Badge variant="secondary">{member.role}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Latest Payments }
              <Card>
                <CardHeader>
                  <CardTitle>Latest Payments</CardTitle>
                  <CardDescription>See recent payments from your customers here.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b text-sm">
                          <th className="text-left py-3 font-medium">Customer</th>
                          <th className="text-left py-3 font-medium">Email</th>
                          <th className="text-left py-3 font-medium">Amount</th>
                          <th className="text-left py-3 font-medium">Status</th>
                          <th className="py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {payments.map((payment, i) => (
                          <tr key={i} className="border-b text-sm">
                            <td className="py-3">{payment.name}</td>
                            <td className="py-3 text-gray-500">{payment.email}</td>
                            <td className="py-3">{payment.amount}</td>
                            <td className="py-3">
                              <Badge variant={
                                payment.status === 'success' ? 'default' : 
                                payment.status === 'processing' ? 'secondary' : 
                                'destructive'
                              }>
                                {payment.status}
                              </Badge>
                            </td>
                            <td className="py-3">
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column }
            <div className="space-y-6">
              {/* Chat }
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>SD</AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-sm">Sofia Davis</CardTitle>
                      <CardDescription className="text-xs">m@example.com</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    <div className="flex justify-end">
                      <div className="bg-black text-white px-3 py-2 rounded-lg text-sm max-w-[80%]">
                        Hi, how can I help you today?
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm max-w-[80%]">
                        Hey, I'm having trouble with my account.
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-black text-white px-3 py-2 rounded-lg text-sm max-w-[80%]">
                        What seems to be the problem?
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm max-w-[80%]">
                        I can't log in.
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Type a message..." 
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                    />
                    <Button size="icon">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Exercise Minutes }/*
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Exercise Minutes</CardTitle>
                    <Button variant="outline" size="sm">Export</Button>
                  </div>
                  <CardDescription>Your exercise minutes are ahead of where you normally are.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg"></div>
                </CardContent>
              </Card>

              {/* Payment Method }/*
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                  <CardDescription>Add a new payment method to your account.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Card</Button>
                    <Button variant="ghost" size="sm">Paypal</Button>
                    <Button variant="ghost" size="sm">Apple</Button>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name on the card</Label>
                    <Input id="name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card">Card number</Label>
                    <Input id="card" placeholder="1234 5678 9012 3456" />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-2">
                      <Label htmlFor="month">Expires</Label>
                      <Select>
                        <SelectTrigger id="month">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="01">01</SelectItem>
                          <SelectItem value="02">02</SelectItem>
                          <SelectItem value="03">03</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year</Label>
                      <Select>
                        <SelectTrigger id="year">
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2026">2026</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvc">CVC</Label>
                      <Input id="cvc" placeholder="123" />
                    </div>
                  </div>
                  <Button className="w-full">Continue</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}*/
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Home, 
  BarChart3, 
  Users, 
  Settings, 
  Search,
  Bell,
  Download,
  Send,
  MoreHorizontal,
  TrendingUp,
  DollarSign,
  Activity,
  CreditCard,
  Moon,
  Sun
} from 'lucide-react';
import { SidebarProvider, Sidebar, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';

export default function Dashboard() {
  const [message, setMessage] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const payments = [
    { name: 'Kenneth Thompson', email: 'ken99@yahoo.com', amount: '$316.00', status: 'success' },
    { name: 'Abraham Lincoln', email: 'abe45@gmail.com', amount: '$242.00', status: 'success' },
    { name: 'Monserrat Rodriguez', email: 'monserrat44@gmail.com', amount: '$837.00', status: 'processing' },
    { name: 'Silas Johnson', email: 'silas22@gmail.com', amount: '$874.00', status: 'success' },
    { name: 'Carmella DeVito', email: 'carmella@hotmail.com', amount: '$721.00', status: 'failed' },
    { name: 'Maria Garcia', email: 'maria@gmail.com', amount: '$529.00', status: 'success' },
    { name: 'James Wilson', email: 'james34@outlook.com', amount: '$438.00', status: 'processing' },
    { name: 'Sarah Jones', email: 'sarah.j@yahoo.com', amount: '$692.00', status: 'success' },
  ];

  const teamMembers = [
    { name: 'Toby Belhome', email: 'contact@bundui.io', role: 'Viewer' },
    { name: 'Jackson Lee', email: 'pre@example.com', role: 'Developer' },
    { name: 'Hally Gray', email: 'hally@site.com', role: 'Viewer' },
  ];

  return (
    <div className="flex h-screen bg-background font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&display=swap');
        
        :root {
          --background: oklch(1 0 0);
          --foreground: oklch(0.145 0 0);
          --card: oklch(1 0 0);
          --card-foreground: oklch(0.145 0 0);
          --popover: oklch(1 0 0);
          --popover-foreground: oklch(0.145 0 0);
          --primary: oklch(0.205 0 0);
          --primary-foreground: oklch(0.985 0 0);
          --secondary: oklch(0.97 0 0);
          --secondary-foreground: oklch(0.205 0 0);
          --muted: oklch(0.97 0 0);
          --muted-foreground: oklch(0.556 0 0);
          --accent: oklch(0.97 0 0);
          --accent-foreground: oklch(0.205 0 0);
          --destructive: oklch(0.577 0.245 27.325);
          --destructive-foreground: oklch(0.985 0 0);
          --border: oklch(0.922 0 0);
          --input: oklch(0.922 0 0);
          --ring: oklch(0.87 0 0);
          --chart-1: oklch(0.646 0.222 41.116);
          --chart-2: oklch(0.6 0.118 184.704);
          --chart-3: oklch(0.398 0.07 227.392);
          --chart-4: oklch(0.828 0.189 84.429);
          --chart-5: oklch(0.769 0.188 70.08);
          --radius: 0.625rem;
          --sidebar: oklch(0.985 0 0);
          --sidebar-foreground: oklch(0.145 0 0);
          --sidebar-primary: oklch(0.205 0 0);
          --sidebar-primary-foreground: oklch(0.985 0 0);
          --sidebar-accent: oklch(0.97 0 0);
          --sidebar-accent-foreground: oklch(0.205 0 0);
          --sidebar-border: oklch(0.922 0 0);
          --sidebar-ring: oklch(0.87 0 0);
        }
        
        .dark {
          --background: oklch(0.145 0 0);
          --foreground: oklch(0.985 0 0);
          --card: oklch(0.145 0 0);
          --card-foreground: oklch(0.985 0 0);
          --popover: oklch(0.145 0 0);
          --popover-foreground: oklch(0.985 0 0);
          --primary: oklch(0.985 0 0);
          --primary-foreground: oklch(0.205 0 0);
          --secondary: oklch(0.269 0 0);
          --secondary-foreground: oklch(0.985 0 0);
          --muted: oklch(0.269 0 0);
          --muted-foreground: oklch(0.708 0 0);
          --accent: oklch(0.269 0 0);
          --accent-foreground: oklch(0.985 0 0);
          --destructive: oklch(0.396 0.141 25.723);
          --destructive-foreground: oklch(0.637 0.237 25.331);
          --border: oklch(0.269 0 0);
          --input: oklch(0.269 0 0);
          --ring: oklch(0.439 0 0);
          --chart-1: oklch(0.488 0.243 264.376);
          --chart-2: oklch(0.696 0.17 162.48);
          --chart-3: oklch(0.769 0.188 70.08);
          --chart-4: oklch(0.627 0.265 303.9);
          --chart-5: oklch(0.645 0.246 16.439);
          --sidebar: oklch(0.205 0 0);
          --sidebar-foreground: oklch(0.985 0 0);
          --sidebar-primary: oklch(0.985 0 0);
          --sidebar-primary-foreground: oklch(0.985 0 0);
          --sidebar-accent: oklch(0.269 0 0);
          --sidebar-accent-foreground: oklch(0.985 0 0);
          --sidebar-border: oklch(0.269 0 0);
          --sidebar-ring: oklch(0.439 0 0);
        }
        
        * {
          font-family: 'Instrument Sans', ui-sans-serif, system-ui, sans-serif;
        }
      `}</style>

      {/* Sidebar */}
      <SidebarProvider>
        <Sidebar>
        <aside className="w-64 bg-sidebar border-r border-sidebar-border overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-8 h-8 bg-sidebar-primary rounded-[var(--radius)]"></div>
              <span className="font-semibold text-sidebar-foreground">Shadcn UI Kit</span>
            </div>
            
            <nav className="space-y-1">
              <Button variant="ghost" className="w-full justify-start bg-sidebar-accent text-sidebar-accent-foreground">
                <Home className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Users className="w-4 h-4 mr-2" />
                Team
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </nav>
          </div>

          <div className="p-6 border-t border-sidebar-border">
            <Card className="bg-card border-border">
              <CardHeader className="p-4">
                <CardTitle className="text-sm text-card-foreground">Download</CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Unlock lifetime access to all dashboards, templates and components.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90" size="sm">
                  Get Shadcn UI Kit
                </Button>
              </CardContent>
            </Card>
          </div>
        </aside>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset>
          <SidebarTrigger />
        <div className="flex-1 overflow-auto">
          {/* Header */}
          <header className="bg-card border-b border-border px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search..." 
                    className="pl-10 bg-background border-input text-foreground focus-visible:ring-ring"
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={toggleTheme}
                  className="text-foreground hover:bg-accent hover:text-accent-foreground"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent hover:text-accent-foreground">
                  <Bell className="w-5 h-5" />
                </Button>
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">TB</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
                <p className="text-sm text-muted-foreground">26 Dec 2025 - 22 Jan 2026</p>
              </div>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">Total Revenue</CardTitle>
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">$15,231.89</div>
                  <p className="text-xs text-chart-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +20.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">Subscriptions</CardTitle>
                  <Users className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">+4850</div>
                  <p className="text-xs text-chart-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +180.1% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">Sales</CardTitle>
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">+12,234</div>
                  <p className="text-xs text-chart-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +19% from last month
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-card-foreground">Active Now</CardTitle>
                  <Activity className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-card-foreground">+573</div>
                  <p className="text-xs text-chart-1 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    +201 since last hour
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Team Members */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Team Members</CardTitle>
                    <CardDescription className="text-muted-foreground">Invite your team members to collaborate.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {teamMembers.map((member, i) => (
                        <div key={i} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-secondary text-secondary-foreground">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-sm font-medium text-card-foreground">{member.name}</p>
                              <p className="text-xs text-muted-foreground">{member.email}</p>
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-secondary text-secondary-foreground">
                            {member.role}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Latest Payments */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Latest Payments</CardTitle>
                    <CardDescription className="text-muted-foreground">See recent payments from your customers here.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border text-sm">
                            <th className="text-left py-3 font-medium text-foreground">Customer</th>
                            <th className="text-left py-3 font-medium text-foreground">Email</th>
                            <th className="text-left py-3 font-medium text-foreground">Amount</th>
                            <th className="text-left py-3 font-medium text-foreground">Status</th>
                            <th className="py-3"></th>
                          </tr>
                        </thead>
                        <tbody>
                          {payments.map((payment, i) => (
                            <tr key={i} className="border-b border-border text-sm">
                              <td className="py-3 text-foreground">{payment.name}</td>
                              <td className="py-3 text-muted-foreground">{payment.email}</td>
                              <td className="py-3 text-foreground">{payment.amount}</td>
                              <td className="py-3">
                                <Badge 
                                  variant={payment.status === 'success' ? 'default' : payment.status === 'processing' ? 'secondary' : 'destructive'}
                                  className={
                                    payment.status === 'success' 
                                      ? 'bg-primary text-primary-foreground' 
                                      : payment.status === 'processing' 
                                      ? 'bg-secondary text-secondary-foreground' 
                                      : 'bg-destructive text-destructive-foreground'
                                  }
                                >
                                  {payment.status}
                                </Badge>
                              </td>
                              <td className="py-3">
                                <Button variant="ghost" size="icon" className="text-foreground hover:bg-accent">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Chat */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarFallback className="bg-secondary text-secondary-foreground">SD</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-sm text-card-foreground">Sofia Davis</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">m@example.com</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      <div className="flex justify-end">
                        <div className="bg-primary text-primary-foreground px-3 py-2 rounded-[var(--radius-md)] text-sm max-w-[80%]">
                          Hi, how can I help you today?
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-muted text-muted-foreground px-3 py-2 rounded-[var(--radius-md)] text-sm max-w-[80%]">
                          Hey, I'm having trouble with my account.
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <div className="bg-primary text-primary-foreground px-3 py-2 rounded-[var(--radius-md)] text-sm max-w-[80%]">
                          What seems to be the problem?
                        </div>
                      </div>
                      <div className="flex justify-start">
                        <div className="bg-muted text-muted-foreground px-3 py-2 rounded-[var(--radius-md)] text-sm max-w-[80%]">
                          I can't log in.
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Input 
                        placeholder="Type a message..." 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="bg-background border-input text-foreground focus-visible:ring-ring"
                      />
                      <Button size="icon" className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Exercise Minutes */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-card-foreground">Exercise Minutes</CardTitle>
                      <Button variant="outline" size="sm" className="border-border text-foreground hover:bg-accent">
                        Export
                      </Button>
                    </div>
                    <CardDescription className="text-muted-foreground">Your exercise minutes are ahead of where you normally are.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="h-32 rounded-[var(--radius-md)]" 
                      style={{
                        background: `linear-gradient(to right, ${getComputedStyle(document.documentElement).getPropertyValue('--chart-2').trim()}, ${getComputedStyle(document.documentElement).getPropertyValue('--chart-1').trim()})`
                      }}
                    ></div>
                  </CardContent>
                </Card>

                {/* Payment Method */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-card-foreground">Payment Method</CardTitle>
                    <CardDescription className="text-muted-foreground">Add a new payment method to your account.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="border-border text-foreground bg-accent">
                        Card
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                        Paypal
                      </Button>
                      <Button variant="ghost" size="sm" className="text-muted-foreground hover:bg-accent hover:text-accent-foreground">
                        Apple
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-foreground">Name on the card</Label>
                      <Input id="name" className="bg-background border-input text-foreground focus-visible:ring-ring" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="card" className="text-foreground">Card number</Label>
                      <Input id="card" placeholder="1234 5678 9012 3456" className="bg-background border-input text-foreground focus-visible:ring-ring" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="month" className="text-foreground">Expires</Label>
                        <Select>
                          <SelectTrigger id="month" className="bg-background border-input text-foreground">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="01">01</SelectItem>
                            <SelectItem value="02">02</SelectItem>
                            <SelectItem value="03">03</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="year" className="text-foreground">Year</Label>
                        <Select>
                          <SelectTrigger id="year" className="bg-background border-input text-foreground">
                            <SelectValue placeholder="Year" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border">
                            <SelectItem value="2024">2024</SelectItem>
                            <SelectItem value="2025">2025</SelectItem>
                            <SelectItem value="2026">2026</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvc" className="text-foreground">CVC</Label>
                        <Input id="cvc" placeholder="123" className="bg-background border-input text-foreground focus-visible:ring-ring" />
                      </div>
                    </div>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                      Continue
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </main>
        </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}