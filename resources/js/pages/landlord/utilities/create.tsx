import { Link, router } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';
import { useState } from 'react';
import { toast, Toaster } from 'sonner';
import { route } from 'ziggy-js';

import { LandlordSidebar } from '@/components/layout/landlord-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface UtilityType {
  id: number;
  name: string;
  unit: string | null;
  is_metered: boolean;
}

interface Tenant {
  id: number;
  full_name: string;
}

interface Unit {
  id: number;
  unit_name: string;
}

interface Property {
  id: number;
  name: string;
}

interface ExistingUtility {
  id: number;
  amount: number;
  utility_type: {
    id: number;
    name: string;
  };
}

interface Props {
  tenancy: {
    id: number;
    status: string;
    unit: Unit;
    property: Property;
    tenant: Tenant;
  };
  utilityTypes: UtilityType[];
  existingUtilities: ExistingUtility[];
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(amount);

export default function CreateLandlordUtility({
  tenancy,
  utilityTypes,
  existingUtilities,
}: Props) {
  const [formData, setFormData] = useState({
    utility_type_id: '',
    amount: '',
    billing_cycle: 'monthly',
    provider: '',
    account_number: '',
    meter_number: '',
    status: 'active',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    router.post(
      route('landlord.utilities.store', { tenancy: tenancy.id }),
      formData,
      {
        onSuccess: () => {
          toast.success('Utility assigned successfully');
        },
        onError: (err) => {
          setErrors(err);
          toast.error('Failed to assign utility');
        },
        onFinish: () => {
          setIsSubmitting(false);
        },
      },
    );
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <LandlordSidebar properties={[]} />
      <Toaster />
      <SidebarInset className="px-6 pt-4 pb-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <SidebarTrigger />
          <div className="flex-1">
            <Link
              href={route('landlord.utilities.index')}
              className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-200"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Utilities
            </Link>
            <h1 className="text-2xl font-bold text-gray-200">
              Add Utility
            </h1>
            <p className="text-sm text-gray-400">
              Assign utility to {tenancy.tenant.full_name} - {tenancy.unit.unit_name}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Utility Details */}
            <Card>
              <CardHeader>
                <CardTitle>Utility Details</CardTitle>
                <CardDescription>
                  Select the type of utility and set the billing amount
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Utility Type */}
                <div className="space-y-2">
                  <Label htmlFor="utility_type_id">
                    Utility Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.utility_type_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, utility_type_id: value }))
                    }
                  >
                    <SelectTrigger
                      id="utility_type_id"
                      className={errors.utility_type_id ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder="Select utility type" />
                    </SelectTrigger>
                    <SelectContent>
                      {utilityTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id.toString()}>
                          {type.name}
                          {type.unit && ` (${type.unit})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.utility_type_id && (
                    <p className="text-xs text-destructive">{errors.utility_type_id}</p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className={errors.amount ? 'border-destructive' : ''}
                  />
                  {errors.amount && (
                    <p className="text-xs text-destructive">{errors.amount}</p>
                  )}
                </div>

                {/* Billing Cycle */}
                <div className="space-y-2">
                  <Label htmlFor="billing_cycle">
                    Billing Cycle <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.billing_cycle}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, billing_cycle: value }))
                    }
                  >
                    <SelectTrigger
                      id="billing_cycle"
                      className={errors.billing_cycle ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder="Select billing cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.billing_cycle && (
                    <p className="text-xs text-destructive">{errors.billing_cycle}</p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label htmlFor="status">
                    Status <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger
                      id="status"
                      className={errors.status ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="disconnected">Disconnected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Provider Details */}
            <Card>
              <CardHeader>
                <CardTitle>Provider Details</CardTitle>
                <CardDescription>
                  Optional details about the utility provider
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Provider */}
                <div className="space-y-2">
                  <Label htmlFor="provider">Provider Name</Label>
                  <Input
                    id="provider"
                    name="provider"
                    placeholder="e.g., TANESCO, DAWASA"
                    value={formData.provider}
                    onChange={handleChange}
                  />
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <Label htmlFor="account_number">Account Number</Label>
                  <Input
                    id="account_number"
                    name="account_number"
                    placeholder="Enter account number"
                    value={formData.account_number}
                    onChange={handleChange}
                  />
                </div>

                {/* Meter Number */}
                <div className="space-y-2">
                  <Label htmlFor="meter_number">Meter Number</Label>
                  <Input
                    id="meter_number"
                    name="meter_number"
                    placeholder="Enter meter number"
                    value={formData.meter_number}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end gap-4">
            <Link href={route('landlord.utilities.index')}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting}>
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Utility'}
            </Button>
          </div>
        </form>
      </SidebarInset>
    </SidebarProvider>
  );
}
