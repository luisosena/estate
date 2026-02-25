import React, { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Field, FieldGroup, FieldLabel, FieldDescription, FieldError, FieldSeparator } from '@/components/ui/field';
import { Separator } from '@/components/ui/separator';
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
        <div className="w-72 p-auto">
            <div className="mb-6">
                <Button
                    variant="ghost"
                    onClick={handleBack}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>
                
                <Card className="w-full mx-auto">
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

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <FieldGroup>
                                {/* Personal Information */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Home className="h-5 w-5" />
                                        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <Field>
                                            <FieldLabel htmlFor="full_name">
                                                Full Name <span className="text-red-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                id="full_name"
                                                type="text"
                                                value={data.full_name}
                                                onChange={(e) => setData('full_name', e.target.value)}
                                                placeholder="Enter tenant's full name"
                                                required
                                                aria-invalid={!!errors.full_name}
                                            />
                                            <FieldError>{errors.full_name}</FieldError>
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="phone">
                                                Phone Number <span className="text-red-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={data.phone}
                                                onChange={(e) => setData('phone', e.target.value)}
                                                placeholder="Enter phone number"
                                                required
                                                aria-invalid={!!errors.phone}
                                            />
                                            <FieldError>{errors.phone}</FieldError>
                                        </Field>

                                        <Field className="md:col-span-2">
                                            <FieldLabel htmlFor="email">Email Address</FieldLabel>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) => setData('email', e.target.value)}
                                                placeholder="Enter email address (optional)"
                                                aria-invalid={!!errors.email}
                                            />
                                            <FieldError>{errors.email}</FieldError>
                                        </Field>
                                    </div>
                                </div>

                                <FieldSeparator>Emergency Contact</FieldSeparator>

                                {/* Emergency Contact */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <Field>
                                            <FieldLabel htmlFor="emergency_contact_name">
                                                Contact Name <span className="text-red-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                id="emergency_contact_name"
                                                type="text"
                                                value={data.emergency_contact_name}
                                                onChange={(e) => setData('emergency_contact_name', e.target.value)}
                                                placeholder="Enter emergency contact name"
                                                required
                                                aria-invalid={!!errors.emergency_contact_name}
                                            />
                                            <FieldError>{errors.emergency_contact_name}</FieldError>
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="emergency_contact_phone">
                                                Contact Phone <span className="text-red-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                id="emergency_contact_phone"
                                                type="tel"
                                                value={data.emergency_contact_phone}
                                                onChange={(e) => setData('emergency_contact_phone', e.target.value)}
                                                placeholder="Enter emergency contact phone"
                                                required
                                                aria-invalid={!!errors.emergency_contact_phone}
                                            />
                                            <FieldError>{errors.emergency_contact_phone}</FieldError>
                                        </Field>

                                        <Field className="md:col-span-2">
                                            <FieldLabel htmlFor="emergency_contact_relation">
                                                Relationship <span className="text-red-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                id="emergency_contact_relation"
                                                type="text"
                                                value={data.emergency_contact_relation}
                                                onChange={(e) => setData('emergency_contact_relation', e.target.value)}
                                                placeholder="e.g., Spouse, Parent, Sibling"
                                                required
                                                aria-invalid={!!errors.emergency_contact_relation}
                                            />
                                            <FieldError>{errors.emergency_contact_relation}</FieldError>
                                        </Field>
                                    </div>
                                </div>

                                <FieldSeparator>
                                    <span className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        Unit & Tenancy
                                    </span>
                                </FieldSeparator>

                                {/* Unit Assignment & Tenancy */}
                                <div className="space-y-4">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <Field>
                                            <FieldLabel htmlFor="unit_id">
                                                Select Unit <span className="text-red-500">*</span>
                                            </FieldLabel>
                                            <Select value={data.unit_id} onValueChange={(value) => setData('unit_id', value)}>
                                                <SelectTrigger aria-invalid={!!errors.unit_id}>
                                                    <SelectValue placeholder="Choose a unit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableUnits.map((unit) => (
                                                        <SelectItem key={unit.id} value={unit.id.toString()}>
                                                            <div>
                                                                <div>{unit.unit_code} - {unit.unit_name}</div>
                                                                <div className="text-xs text-gray-500">
                                                                    {unit.property?.name || 'Unknown Property'}
                                                                </div>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FieldError>{errors.unit_id}</FieldError>
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="move_in_date">
                                                Move-in Date <span className="text-red-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                id="move_in_date"
                                                type="date"
                                                value={data.move_in_date}
                                                onChange={(e) => setData('move_in_date', e.target.value)}
                                                required
                                                aria-invalid={!!errors.move_in_date}
                                            />
                                            <FieldError>{errors.move_in_date}</FieldError>
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="monthly_rent">
                                                Monthly Rent <span className="text-red-500">*</span>
                                            </FieldLabel>
                                            <Input
                                                id="monthly_rent"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.monthly_rent}
                                                onChange={(e) => setData('monthly_rent', e.target.value)}
                                                placeholder="0.00"
                                                required
                                                aria-invalid={!!errors.monthly_rent}
                                            />
                                            <FieldError>{errors.monthly_rent}</FieldError>
                                        </Field>

                                        <Field>
                                            <FieldLabel htmlFor="security_deposit">Security Deposit</FieldLabel>
                                            <Input
                                                id="security_deposit"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                value={data.security_deposit}
                                                onChange={(e) => setData('security_deposit', e.target.value)}
                                                placeholder="0.00 (optional)"
                                                aria-invalid={!!errors.security_deposit}
                                            />
                                            <FieldError>{errors.security_deposit}</FieldError>
                                        </Field>

                                        <Field className="md:col-span-2">
                                            <FieldLabel htmlFor="tenancy_agreement">Tenancy Agreement</FieldLabel>
                                            <Input
                                                id="tenancy_agreement"
                                                type="file"
                                                accept=".pdf,.doc,.docx"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file && file.size > 10 * 1024 * 1024) {
                                                        alert('File size must be less than 10MB');
                                                        e.target.value = '';
                                                        return;
                                                    }
                                                    setData('tenancy_agreement', file || null);
                                                }}
                                                aria-invalid={!!errors.tenancy_agreement}
                                            />
                                            <FieldError>{errors.tenancy_agreement}</FieldError>
                                            <FieldDescription>
                                                PDF or Word document (max 10MB)
                                            </FieldDescription>
                                        </Field>
                                    </div>
                                </div>
                            </FieldGroup>

                            <Separator className="my-6" />
                            <div className="flex justify-end space-x-4">
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
