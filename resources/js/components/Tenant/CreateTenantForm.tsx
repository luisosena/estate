import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Home, Calendar, DollarSign } from 'lucide-react';

interface AvailableUnit {
    id: number;
    unit_code: string;
    unit_name: string;
    property: {
        id: number;
        name: string;
        address: string;
    };
}

interface TenantFormData {
    full_name: string;
    phone: string;
    email: string;
    emergency_contact_name: string;
    emergency_contact_phone: string;
    emergency_contact_relation: string;
    unit_id: string;
    move_in_date: string;
    monthly_rent: string;
    security_deposit: string;
    tenancy_agreement: File | null;
}

interface CreateTenantFormProps {
    availableUnits: AvailableUnit[];
    errors?: Record<string, string>;
    success?: string;
}

export default function CreateTenantForm({ availableUnits, errors = {}, success }: CreateTenantFormProps) {
    const { data, setData, post, processing, reset } = useForm<TenantFormData>({
        full_name: '',
        phone: '',
        email: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        emergency_contact_relation: '',
        unit_id: '',
        move_in_date: '',
        monthly_rent: '',
        security_deposit: '',
        tenancy_agreement: null,
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
                            Fill in the tenant information, select a unit, and set up the tenancy details. The tenant code will be generated automatically.
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
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Home className="mr-2 h-5 w-5" />
                                        Personal Information
                                    </h3>
                                    
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

                                {/* Unit Assignment & Tenancy */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                        <Calendar className="mr-2 h-5 w-5" />
                                        Unit & Tenancy
                                    </h3>
                                    
                                    <div>
                                        <Label htmlFor="unit_id">Select Unit *</Label>
                                        <Select value={data.unit_id} onValueChange={(value) => setData('unit_id', value)}>
                                            <SelectTrigger className={errors.unit_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Choose a unit" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableUnits.map((unit) => (
                                                    <SelectItem key={unit.id} value={unit.id.toString()}>
                                                        {unit.unit_code} - {unit.unit_name}
                                                        <div className="text-xs text-gray-500">
                                                            {unit.property.name}
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.unit_id && (
                                            <p className="text-red-500 text-sm mt-1">{errors.unit_id}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="move_in_date">Move-in Date *</Label>
                                        <Input
                                            id="move_in_date"
                                            type="date"
                                            value={data.move_in_date}
                                            onChange={(e) => setData('move_in_date', e.target.value)}
                                            required
                                            className={errors.move_in_date ? 'border-red-500' : ''}
                                        />
                                        {errors.move_in_date && (
                                            <p className="text-red-500 text-sm mt-1">{errors.move_in_date}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="monthly_rent">Monthly Rent *</Label>
                                        <Input
                                            id="monthly_rent"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.monthly_rent}
                                            onChange={(e) => setData('monthly_rent', e.target.value)}
                                            placeholder="0.00"
                                            required
                                            className={errors.monthly_rent ? 'border-red-500' : ''}
                                        />
                                        {errors.monthly_rent && (
                                            <p className="text-red-500 text-sm mt-1">{errors.monthly_rent}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="security_deposit">Security Deposit</Label>
                                        <Input
                                            id="security_deposit"
                                            type="number"
                                            step="0.01"
                                            min="0"
                                            value={data.security_deposit}
                                            onChange={(e) => setData('security_deposit', e.target.value)}
                                            placeholder="0.00 (optional)"
                                            className={errors.security_deposit ? 'border-red-500' : ''}
                                        />
                                        {errors.security_deposit && (
                                            <p className="text-red-500 text-sm mt-1">{errors.security_deposit}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="tenancy_agreement">Tenancy Agreement</Label>
                                        <Input
                                            id="tenancy_agreement"
                                            type="file"
                                            accept=".pdf,.doc,.docx"
                                            onChange={(e) => setData('tenancy_agreement', e.target.files?.[0] || null)}
                                            className={errors.tenancy_agreement ? 'border-red-500' : ''}
                                        />
                                        {errors.tenancy_agreement && (
                                            <p className="text-red-500 text-sm mt-1">{errors.tenancy_agreement}</p>
                                        )}
                                        <p className="text-xs text-gray-500 mt-1">
                                            PDF or Word document (max 10MB)
                                        </p>
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
