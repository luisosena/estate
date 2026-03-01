import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Link, router, useForm } from '@inertiajs/react';
import { Building, Home, Plus, Settings, Users, ArrowLeft, X } from 'lucide-react';
import { route } from 'ziggy-js';
import { useState, useEffect } from 'react';

interface Landlord {
  id: number;
  name: string;
  tenant?: {
    id: number;
    full_name: string;
  };
}

interface Property {
  id: number;
  landlord_id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  property_type: string;
  total_units: number;
  status: string;
  description: string;
  amenities: string[];
  policies: string[];
}

interface AdminPropertyEditProps {
  property: Property;
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

export default function AdminPropertyEdit({ property, landlords }: AdminPropertyEditProps) {
  const { data, setData, put, processing, errors } = useForm({
    landlord_id: property.landlord_id.toString(),
    name: property.name,
    address: property.address,
    city: property.city,
    state: property.state,
    postal_code: property.postal_code,
    country: property.country,
    property_type: property.property_type,
    total_units: property.total_units.toString(),
    status: property.status,
    description: property.description || '',
    amenities: property.amenities.length > 0 ? property.amenities : [''],
    policies: property.policies.length > 0 ? property.policies : [''],
  });

  const [amenities, setAmenities] = useState(
    property.amenities.length > 0 ? property.amenities : ['']
  );
  const [policies, setPolicies] = useState(
    property.policies.length > 0 ? property.policies : ['']
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Filter out empty amenities and policies
    const filteredAmenities = amenities.filter(a => a.trim() !== '');
    const filteredPolicies = policies.filter(p => p.trim() !== '');
    
    const formData = {
      ...data,
      amenities: filteredAmenities,
      policies: filteredPolicies,
    };
    
    router.put(route('admin.properties.update', property.id), formData);
  };

  const addAmenity = () => {
    setAmenities([...amenities, '']);
  };

  const removeAmenity = (index: number) => {
    const newAmenities = amenities.filter((_, i) => i !== index);
    setAmenities(newAmenities);
  };

  const updateAmenity = (index: number, value: string) => {
    const newAmenities = [...amenities];
    newAmenities[index] = value;
    setAmenities(newAmenities);
  };

  const addPolicy = () => {
    setPolicies([...policies, '']);
  };

  const removePolicy = (index: number) => {
    const newPolicies = policies.filter((_, i) => i !== index);
    setPolicies(newPolicies);
  };

  const updatePolicy = (index: number, value: string) => {
    const newPolicies = [...policies];
    newPolicies[index] = value;
    setPolicies(newPolicies);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href={route('admin.properties.index')}
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Edit Property</h1>
            </div>
            <Link href={route('admin.properties.show', property.id)}>
              <Button variant="outline">
                View Property
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Update the basic details about the property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="landlord_id">Landlord *</Label>
                  <Select value={data.landlord_id} onValueChange={(value) => setData('landlord_id', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a landlord" />
                    </SelectTrigger>
                    <SelectContent>
                      {landlords.map((landlord) => (
                        <SelectItem key={landlord.id} value={landlord.id.toString()}>
                          {landlord.tenant?.full_name || landlord.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.landlord_id && (
                    <p className="text-sm text-red-600 mt-1">{errors.landlord_id}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="name">Property Name *</Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    placeholder="e.g., Sunset Apartments"
                    required
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="property_type">Property Type *</Label>
                  <Select value={data.property_type} onValueChange={(value) => setData('property_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select property type" />
                    </SelectTrigger>
                    <SelectContent>
                      {propertyTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.property_type && (
                    <p className="text-sm text-red-600 mt-1">{errors.property_type}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="total_units">Total Units *</Label>
                  <Input
                    id="total_units"
                    type="number"
                    min="1"
                    value={data.total_units}
                    onChange={(e) => setData('total_units', e.target.value)}
                    placeholder="e.g., 12"
                    required
                  />
                  {errors.total_units && (
                    <p className="text-sm text-red-600 mt-1">{errors.total_units}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={data.description}
                  onChange={(e) => setData('description', e.target.value)}
                  placeholder="Describe the property..."
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle>Address Information</CardTitle>
              <CardDescription>Update the property's location details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address *</Label>
                <Input
                  id="address"
                  value={data.address}
                  onChange={(e) => setData('address', e.target.value)}
                  placeholder="e.g., 123 Main Street"
                  required
                />
                {errors.address && (
                  <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input
                    id="city"
                    value={data.city}
                    onChange={(e) => setData('city', e.target.value)}
                    placeholder="e.g., New York"
                    required
                  />
                  {errors.city && (
                    <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="state">State *</Label>
                  <Input
                    id="state"
                    value={data.state}
                    onChange={(e) => setData('state', e.target.value)}
                    placeholder="e.g., NY"
                    required
                  />
                  {errors.state && (
                    <p className="text-sm text-red-600 mt-1">{errors.state}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="postal_code">Postal Code *</Label>
                  <Input
                    id="postal_code"
                    value={data.postal_code}
                    onChange={(e) => setData('postal_code', e.target.value)}
                    placeholder="e.g., 10001"
                    required
                  />
                  {errors.postal_code && (
                    <p className="text-sm text-red-600 mt-1">{errors.postal_code}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  value={data.country}
                  onChange={(e) => setData('country', e.target.value)}
                  placeholder="e.g., United States"
                  required
                />
                {errors.country && (
                  <p className="text-sm text-red-600 mt-1">{errors.country}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Property Status</CardTitle>
              <CardDescription>Update the current status of the property</CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="status">Status *</Label>
                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-red-600 mt-1">{errors.status}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Amenities */}
          <Card>
            <CardHeader>
              <CardTitle>Amenities</CardTitle>
              <CardDescription>Update the amenities available at this property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {amenities.map((amenity, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={amenity}
                    onChange={(e) => updateAmenity(index, e.target.value)}
                    placeholder="e.g., Swimming Pool, Parking, Gym"
                  />
                  {amenities.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeAmenity(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addAmenity}>
                <Plus className="mr-2 h-4 w-4" />
                Add Amenity
              </Button>
            </CardContent>
          </Card>

          {/* Policies */}
          <Card>
            <CardHeader>
              <CardTitle>Policies</CardTitle>
              <CardDescription>Update property policies and rules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {policies.map((policy, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={policy}
                    onChange={(e) => updatePolicy(index, e.target.value)}
                    placeholder="e.g., No pets allowed, Quiet hours 10 PM - 6 AM"
                  />
                  {policies.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePolicy(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addPolicy}>
                <Plus className="mr-2 h-4 w-4" />
                Add Policy
              </Button>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-4">
            <Link href={route('admin.properties.show', property.id)}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={processing}>
              {processing ? 'Updating...' : 'Update Property'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
