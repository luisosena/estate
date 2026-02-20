import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft } from 'lucide-react';

interface TenantFormData {
    full_name: string;
    phone: string;
    email: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relation: string;
}

interface CreateTenantFormProps {
    errors?: Record<string, string>;
    success?: string;
}

export default function CreateTenantForm({ errors = {}, success }: CreateTenantFormProps) {
    const { data, setData, post, processing, reset } = useForm<TenantFormData>({
        full_name: '',
        phone: '',
        email: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/landlord/tenants', {
            onSuccess: () => {
                reset();
            },
        });
    };

    const handleBack = () => {
        router.visit('/landlord/dashboard');
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Add New Tenant</CardTitle>
                        <CardDescription>
                            Fill in the tenant information below. The tenant code will be generated automatically.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {success && (
                            <Alert className="mb-6 bg-green-50 border-green-200">
                                <AlertDescription className="text-green-800">
                                    {success}
                                </AlertDescription>
                            </Alert>
                        )}

                        {Object.keys(errors).length > 0 && (
                            <Alert className="mb-6 bg-red-50 border-red-200">
                                <AlertDescription className="text-red-800">
                                    Please fix the errors below.
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                                    
                                    <div>
                                        <Label htmlFor="full_name">Full Name *</Label>
                                        <Input
                                            id="full_name"
                                            type="text"
                                            value={data.full_name}
                                            onChange={(e) => setData('full_name', e.target.value)}
                                            placeholder="Enter tenant's full name"
                                            required
                                            className={errors.full_name ? 'border-red-500' : ''}
                                        />
                                        {errors.full_name && (
                                            <p className="text-red-500 text-sm mt-1">{errors.full_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="phone">Phone Number *</Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => setData('phone', e.target.value)}
                                            placeholder="Enter phone number"
                                            required
                                            className={errors.phone ? 'border-red-500' : ''}
                                        />
                                        {errors.phone && (
                                            <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="email">Email Address</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => setData('email', e.target.value)}
                                            placeholder="Enter email address (optional)"
                                            className={errors.email ? 'border-red-500' : ''}
                                        />
                                        {errors.email && (
                                            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Emergency Contact */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Emergency Contact</h3>
                                    
                                    <div>
                                        <Label htmlFor="emergency_contact_name">Contact Name *</Label>
                                        <Input
                                            id="emergency_contact_name"
                                            type="text"
                                            value={data.emergency_contact_name}
                                            onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                            placeholder="Enter emergency contact name"
                                            required
                                            className={errors.emergency_contact_name ? 'border-red-500' : ''}
                                        />
                                        {errors.emergency_contact_name && (
                                            <p className="text-red-500 text-sm mt-1">{errors.emergency_contact_name}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="emergency_contact_phone">Contact Phone *</Label>
                                        <Input
                                            id="emergency_contact_phone"
                                            type="tel"
                                            value={data.emergency_contact_phone}
                                            onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                            placeholder="Enter emergency contact phone"
                                            required
                                            className={errors.emergency_contact_phone ? 'border-red-500' : ''}
                                        />
                                        {errors.emergency_contact_phone && (
                                            <p className="text-red-500 text-sm mt-1">{errors.emergency_contact_phone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="emergency_contact_relation">Relationship *</Label>
                                        <Input
                                            id="emergency_contact_relation"
                                            type="text"
                                            value={data.emergency_contact_relation}
                                            onChange={(e) => setData('emergency_contact_relation', e.target.value)}
                                            placeholder="e.g., Spouse, Parent, Sibling"
                                            required
                                            className={errors.emergency_contact_relation ? 'border-red-500' : ''}
                                        />
                                        {errors.emergency_contact_relation && (
                                            <p className="text-red-500 text-sm mt-1">{errors.emergency_contact_relation}</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-4 pt-6 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleBack}
                                    disabled={processing}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={processing}
                                >
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Tenant
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
