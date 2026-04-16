import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Mail, Phone, MapPin, Building, User, Lock, Eye, EyeOff } from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function AdminLandlordCreate() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
    send_welcome_email: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    router.post(route('admin.landlords.store'), data, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={route('admin.landlords.index')}
          className="h-9 w-9 flex items-center justify-center rounded-full border border-border/50 bg-background hover:bg-muted text-muted-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add New Landlord</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Register a new property manager account.</p>
        </div>
      </div>

      <div className="max-w-3xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card className="shadow-none border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Account Details</CardTitle>
              <CardDescription>Enter the primary account information for this landlord.</CardDescription>
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
                  <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={data.password}
                      onChange={(e) => setData('password', e.target.value)}
                      placeholder="••••••••"
                      required
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
                  <Label htmlFor="password_confirmation" className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">Confirm Password *</Label>
                  <div className="relative">
                    <Input
                      id="password_confirmation"
                      type={showPasswordConfirmation ? 'text' : 'password'}
                      value={data.password_confirmation}
                      onChange={(e) => setData('password_confirmation', e.target.value)}
                      placeholder="••••••••"
                      required
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

          {/* Options */}
          <Card className="shadow-none border-border/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Registration Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3 bg-primary/5 p-3 rounded-lg border border-primary/10">
                <Checkbox
                  id="send_welcome_email"
                  checked={data.send_welcome_email}
                  onCheckedChange={(checked) => setData('send_welcome_email', checked as boolean)}
                />
                <Label htmlFor="send_welcome_email" className="text-sm font-medium leading-none cursor-pointer">
                  Send welcome email with login credentials
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex justify-end items-center gap-3 pt-2">
            <Button variant="ghost" type="button" asChild className="text-xs font-bold">
              <Link href={route('admin.landlords.index')}>Cancel</Link>
            </Button>
            <Button type="submit" disabled={processing} className="px-8 shadow-md font-bold text-xs uppercase tracking-widest">
              {processing ? 'Processing...' : 'Register Account'}
            </Button>
          </div>
        </form>
      </div>
    </main>
  );
}

AdminLandlordCreate.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
