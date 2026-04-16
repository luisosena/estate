import { Link, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Building,
    Building2,
    Home,
    Plus,
    Settings,
    Users,
    X,
} from 'lucide-react';
import React, { useState } from 'react';
import { route } from 'ziggy-js';

import AdminLayout from '@/components/layout/AdminLayout';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';

/* ─── Interfaces ─────────────────────────────────────────────────── */

interface Landlord {
    id: number;
    name: string;
}

interface AdminPropertyCreateProps {
    landlords: Landlord[];
}

const propertyTypes = [
    { value: 'apartment', label: 'Apartment', icon: Building },
    { value: 'house', label: 'House', icon: Home },
    { value: 'commercial', label: 'Commercial', icon: Settings },
    { value: 'mixed', label: 'Mixed Use', icon: Users },
];

const statuses = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'maintenance', label: 'Under Maintenance' },
];

/* ─── Main Component ─────────────────────────────────────────────── */

export default function AdminPropertyCreate({ landfills, landlords = [] }: any) {
    // Note: The prop might be named landlords based on my controller fix
    const availableLandlords = landlords || [];

    const { data, setData, post, processing, errors, reset } = useForm({
        owner_id: '',
        name: '',
        address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        property_type: '',
        total_units: '',
        status: 'active',
        description: '',
        amenities: [''],
        policies: [''],
    });

    const [amenities, setAmenities] = useState(['']);
    const [policies, setPolicies] = useState(['']);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const filteredAmenities = amenities.filter((a) => a.trim() !== '');
        const filteredPolicies = policies.filter((p) => p.trim() !== '');

        const formData = {
            ...data,
            amenities: filteredAmenities,
            policies: filteredPolicies,
        };

        router.post(route('admin.properties.store'), formData, {
            onSuccess: () => {
                reset();
            },
        });
    };

    const addAmenity = () => setAmenities([...amenities, '']);
    const removeAmenity = (index: number) => setAmenities(amenities.filter((_, i) => i !== index));
    const updateAmenity = (index: number, value: string) => {
        const newAmenities = [...amenities];
        newAmenities[index] = value;
        setAmenities(newAmenities);
    };

    const addPolicy = () => setPolicies([...policies, '']);
    const removePolicy = (index: number) => setPolicies(policies.filter((_, i) => i !== index));
    const updatePolicy = (index: number, value: string) => {
        const newPolicies = [...policies];
        newPolicies[index] = value;
        setPolicies(newPolicies);
    };

    return (
        <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 pb-12">
            
            {/* Header */}
            <header className="flex items-center gap-4">
                <Link
                    href={route('admin.properties.index')}
                    className="h-9 w-9 flex items-center justify-center rounded-full border border-border/50 bg-background hover:bg-muted text-muted-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Register Property</h1>
                    <p className="text-sm text-muted-foreground mt-0.5">Integrate a new building or complex into the system.</p>
                </div>
            </header>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                
                {/* Left Column: Primary Details */}
                <div className="xl:col-span-2 flex flex-col gap-6">
                    <Card className="shadow-none border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Structural Details</CardTitle>
                            <CardDescription>Enter identification and capacity information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Assigned Manager *</Label>
                                    <Select value={data.owner_id} onValueChange={(value) => setData('owner_id', value)}>
                                        <SelectTrigger className="bg-muted/30 border-none shadow-none text-xs font-semibold">
                                            <SelectValue placeholder="Select a landlord" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {availableLandlords.map((landlord: any) => (
                                                <SelectItem key={landlord.id} value={landlord.id.toString()} className="text-xs">
                                                    {landlord.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.owner_id && (
                                        <p className="text-[10px] text-destructive mt-1 font-bold">{errors.owner_id}</p>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Property Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., Sunset Apartments"
                                        required
                                        className="bg-muted/30 border-none shadow-none text-xs font-semibold focus-visible:ring-1"
                                    />
                                    {errors.name && (
                                        <p className="text-[10px] text-destructive mt-1 font-bold">{errors.name}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Architecture Type *</Label>
                                    <Select value={data.property_type} onValueChange={(value) => setData('property_type', value)}>
                                        <SelectTrigger className="bg-muted/30 border-none shadow-none text-xs font-semibold">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {propertyTypes.map((type) => (
                                                <SelectItem key={type.value} value={type.value} className="text-xs">
                                                    <div className="flex items-center gap-2">
                                                        <type.icon className="h-3 w-3" />
                                                        {type.label}
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="total_units" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Capacity (Units) *</Label>
                                    <Input
                                        id="total_units"
                                        type="number"
                                        min="1"
                                        value={data.total_units}
                                        onChange={(e) => setData('total_units', e.target.value)}
                                        placeholder="Total number of units"
                                        required
                                        className="bg-muted/30 border-none shadow-none text-xs font-semibold focus-visible:ring-1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <Label htmlFor="description" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Global Overview</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Brief summary of property features and amenities..."
                                    rows={4}
                                    className="bg-muted/30 border-none shadow-none text-xs font-medium focus-visible:ring-1 resize-none"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border/50">
                        <CardHeader>
                            <CardTitle className="text-lg">Location Assets</CardTitle>
                            <CardDescription>Geographic descriptors and mailing data.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-1.5">
                                <Label htmlFor="address" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Primary Address *</Label>
                                <Input
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="e.g., 123 Main Street"
                                    required
                                    className="bg-muted/30 border-none shadow-none text-xs font-semibold focus-visible:ring-1"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="city" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">City *</Label>
                                    <Input
                                        id="city"
                                        value={data.city}
                                        onChange={(e) => setData('city', e.target.value)}
                                        placeholder="e.g., New York"
                                        required
                                        className="bg-muted/30 border-none shadow-none text-xs font-semibold focus-visible:ring-1"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="state" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">State/Region *</Label>
                                    <Input
                                        id="state"
                                        value={data.state}
                                        onChange={(e) => setData('state', e.target.value)}
                                        placeholder="e.g., NY"
                                        required
                                        className="bg-muted/30 border-none shadow-none text-xs font-semibold focus-visible:ring-1"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="postal_code" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Zip Code *</Label>
                                    <Input
                                        id="postal_code"
                                        value={data.postal_code}
                                        onChange={(e) => setData('postal_code', e.target.value)}
                                        placeholder="10001"
                                        required
                                        className="bg-muted/30 border-none shadow-none text-xs font-semibold focus-visible:ring-1"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Settings & Lists */}
                <div className="flex flex-col gap-6">
                    <Card className="shadow-none border-border/50 bg-secondary/10">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Property Lifecycle</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Administrative Status</Label>
                                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                                    <SelectTrigger className="bg-background border-border/50 shadow-none text-xs font-bold">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {statuses.map((status) => (
                                            <SelectItem key={status.value} value={status.value} className="text-xs font-medium">
                                                {status.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border/50">
                        <CardHeader className="pb-2">
                             <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Amenities</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {amenities.map((amenity, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={amenity}
                                        onChange={(e) => updateAmenity(index, e.target.value)}
                                        placeholder="e.g., Parking"
                                        className="h-8 text-[11px] font-medium bg-muted/30 border-none focus-visible:ring-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => removeAmenity(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="ghost" size="sm" onClick={addAmenity} className="w-full h-8 text-[10px] font-bold uppercase tracking-tighter gap-1.5 hover:bg-primary/5 hover:text-primary">
                                <Plus className="h-3 w-3" /> Add Feature
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="shadow-none border-border/50">
                        <CardHeader className="pb-2">
                             <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Management Policies</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {policies.map((policy, index) => (
                                <div key={index} className="flex gap-2">
                                    <Input
                                        value={policy}
                                        onChange={(e) => updatePolicy(index, e.target.value)}
                                        placeholder="e.g., No Pets"
                                        className="h-8 text-[11px] font-medium bg-muted/30 border-none focus-visible:ring-1"
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                        onClick={() => removePolicy(index)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                            <Button type="button" variant="ghost" size="sm" onClick={addPolicy} className="w-full h-8 text-[10px] font-bold uppercase tracking-tighter gap-1.5 hover:bg-primary/5 hover:text-primary">
                                <Plus className="h-3 w-3" /> Add Policy
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-3 pt-4">
                        <Button type="submit" disabled={processing} className="w-full h-11 font-bold text-xs uppercase tracking-widest shadow-md">
                            {processing ? 'Processing...' : 'Integrate Property'}
                        </Button>
                        <Button variant="ghost" type="button" asChild className="w-full text-xs font-bold text-muted-foreground">
                            <Link href={route('admin.properties.index')}>Discard Registration</Link>
                        </Button>
                    </div>
                </div>

            </form>
        </main>
    );
}

AdminPropertyCreate.layout = (page: React.ReactNode) => <AdminLayout>{page}</AdminLayout>;
