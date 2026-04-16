import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone, MapPin, Building, User, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface Landlord {
  id: number;
  name: string;
  username: string;
  email: string;
  role: string;
  email_verified_at: string | null;
  created_at: string;
}

interface AdminLandlordEditProps {
  landlord: Landlord;
}

export default function AdminLandlordEdit({ landlord }: AdminLandlordEditProps) {
  const { data, setData, put, processing, errors } = useForm({
    name: landlord.name,
    username: landlord.username,
    email: landlord.email,
    password: '',
    password_confirmation: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.put(route('admin.landlords.update', landlord.id), data);
  };

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={route('admin.landlords.show', landlord.id)}
          className="h-9 w-9 flex items-center justify-center rounded-full border border-border/50 bg-background hover:bg-muted text-muted-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Landlord</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Update profile and account settings for <span className="text-foreground font-semibold">{landlord.name}</span>.</p>
        </div>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="shadow-none border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Account Details</CardTitle>
              <CardDescription>Update the primary account information for this manager.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Full Name *</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="John Doe"
                    required
                    className="bg-muted/30 border-none shadow-none focus-visible:ring-1"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="username" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Username *</Label>
                  <Input
                    id="username"
                    value={data.username}
                    onChange={(e) => setData('username', e.target.value)}
                    placeholder="johndoe"
                    required
                    className="bg-muted/30 border-none shadow-none focus-visible:ring-1"
                  />
                  {errors.username && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.username}</p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(e) => setData('email', e.target.value)}
                  placeholder="john@example.com"
                  required
                  className="bg-muted/30 border-none shadow-none focus-visible:ring-1"
                />
                {errors.email && (
                  <p className="text-xs text-destructive mt-1 font-medium">{errors.email}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      placeholder="Leave blank to keep current"
                      className="bg-muted/30 border-none shadow-none focus-visible:ring-1 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password_confirmation" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="password_confirmation"
                      type={showPasswordConfirmation ? 'text' : 'password'}
                      value={data.password_confirmation}
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      placeholder="Confirm new password"
                      className="bg-muted/30 border-none shadow-none focus-visible:ring-1 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                      onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                    >
                      {showPasswordConfirmation ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {errors.password_confirmation && (
                    <p className="text-xs text-destructive mt-1 font-medium">{errors.password_confirmation}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Status Information */}
          <Card className="shadow-none border-border/50 bg-secondary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                System Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${landlord.email_verified_at ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-muted-foreground/40'}`} />
                    <span className="font-semibold text-muted-foreground">Verification Status</span>
                </div>
                <div className="text-right">
                    <span className={`text-xs font-bold uppercase tracking-wider ${landlord.email_verified_at ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {landlord.email_verified_at ? 'Verified Account' : 'Pending Verification'}
                    </span>
                    {landlord.email_verified_at && (
                        <p className="text-[10px] text-muted-foreground">Since {new Date(landlord.email_verified_at).toLocaleDateString()}</p>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end items-center gap-3 pt-2">
            <Button variant="ghost" type="button" asChild className="text-xs font-bold">
              <Link href={route('admin.landlords.show', landlord.id)}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={processing} className="px-8 shadow-md font-bold text-xs uppercase tracking-widest">
              {processing ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

AdminLandlordEdit.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
