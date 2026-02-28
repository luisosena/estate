import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Tenant {
  id: number;
  tenant_code: string;
  full_name: string;
  phone: string;
  email: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
}

interface Tenancy {
  id: number;
  status: string;
  move_in_date: string | null;
  move_out_date: string | null;
  monthly_rent: number | null;
  security_deposit: number | null;
}

interface Unit {
  id: number;
  unit_name: string;
  unit_code: string;
  property?: {
    id: number;
    name: string;
    address: string;
  };
}

interface Property {
  id: number;
  name: string;
  address: string;
}

interface TenantEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant: Tenant;
  tenancy?: Tenancy;
  unit?: Unit;
  property?: Property;
  availableUnits?: Unit[];
  onSave: (data: any) => void;
  editType?: 'personal' | 'emergency' | 'tenancy' | 'unit' | 'property' | 'payments' | 'history';
}

export default function TenantEditModal({
  isOpen,
  onClose,
  tenant,
  tenancy,
  unit,
  property,
  availableUnits = [],
  onSave,
  editType = 'personal',
}: TenantEditModalProps) {
  const [formData, setFormData] = useState<any>(() => {
    // Initialize form data based on edit type
    switch (editType) {
      case 'personal':
        return {
          full_name: tenant.full_name,
          phone: tenant.phone,
          email: tenant.email,
        };
      case 'emergency':
        return {
          emergency_contact_name: tenant.emergency_contact_name,
          emergency_contact_phone: tenant.emergency_contact_phone,
          emergency_contact_relation: tenant.emergency_contact_relation,
        };
      case 'tenancy':
        return {
          status: tenancy?.status || '',
          move_in_date: tenancy?.move_in_date || '',
          move_out_date: tenancy?.move_out_date || '',
          monthly_rent: tenancy?.monthly_rent || 0,
          security_deposit: tenancy?.security_deposit || 0,
        };
      case 'unit':
        return {
          unit_id: unit?.id || '',
        };
      case 'property':
        return {
          name: property?.name || '',
          address: property?.address || '',
        };
      case 'payments':
        return {
          payment_type: '',
          amount: 0,
        };
      case 'history':
        return {
          status: 'active',
          move_out_date: '',
        };
      default:
        return {};
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Update form data when editType or data changes
  useEffect(() => {
    switch (editType) {
      case 'personal':
        setFormData({
          full_name: tenant.full_name,
          phone: tenant.phone,
          email: tenant.email,
        });
        break;
      case 'emergency':
        setFormData({
          emergency_contact_name: tenant.emergency_contact_name,
          emergency_contact_phone: tenant.emergency_contact_phone,
          emergency_contact_relation: tenant.emergency_contact_relation,
        });
        break;
      case 'tenancy':
        setFormData({
          status: tenancy?.status || '',
          move_in_date: tenancy?.move_in_date || '',
          move_out_date: tenancy?.move_out_date || '',
          monthly_rent: tenancy?.monthly_rent || 0,
          security_deposit: tenancy?.security_deposit || 0,
        });
        break;
      case 'unit':
        setFormData({
          unit_id: unit?.id || '',
        });
        break;
      case 'property':
        setFormData({
          name: property?.name || '',
          address: property?.address || '',
        });
        break;
      case 'payments':
        setFormData({
          payment_type: '',
          amount: 0,
        });
        break;
      case 'history':
        setFormData({
          status: 'active',
          move_out_date: '',
        });
        break;
    }
  }, [editType, tenant, tenancy, unit, property]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onSave(formData);
    setIsLoading(false);
    onClose();
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const renderFormFields = () => {
    switch (editType) {
      case 'personal':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name || ''}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
          </div>
        );
      case 'emergency':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Name</Label>
                <Input
                  id="emergency_contact_name"
                  value={formData.emergency_contact_name || ''}
                  onChange={(e) => handleChange('emergency_contact_name', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Phone</Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone || ''}
                  onChange={(e) => handleChange('emergency_contact_phone', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_relation">Relation</Label>
                <Input
                  id="emergency_contact_relation"
                  value={formData.emergency_contact_relation || ''}
                  onChange={(e) => handleChange('emergency_contact_relation', e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      case 'tenancy':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status || ''} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    {formData.status || 'Select status'}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="move_in_date">Move-in Date</Label>
                <Input
                  id="move_in_date"
                  type="date"
                  value={formData.move_in_date || ''}
                  onChange={(e) => handleChange('move_in_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="move_out_date">Move-out Date</Label>
                <Input
                  id="move_out_date"
                  type="date"
                  value={formData.move_out_date || ''}
                  onChange={(e) => handleChange('move_out_date', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly_rent">Monthly Rent</Label>
                <Input
                  id="monthly_rent"
                  type="number"
                  value={formData.monthly_rent?.toString() || ''}
                  onChange={(e) => handleChange('monthly_rent', parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="security_deposit">Security Deposit</Label>
                <Input
                  id="security_deposit"
                  type="number"
                  value={formData.security_deposit?.toString() || ''}
                  onChange={(e) => handleChange('security_deposit', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        );
      case 'unit':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unit_id">Select New Unit</Label>
              <Select value={formData.unit_id?.toString() || ''} onValueChange={(value) => handleChange('unit_id', value)}>
                <SelectTrigger>
                  {formData.unit_id ? 
                    availableUnits.find(u => u.id.toString() === formData.unit_id)?.unit_name || 'Select unit'
                    : 'Select unit'
                  }
                </SelectTrigger>
                <SelectContent>
                  {availableUnits.map((availableUnit) => (
                    <SelectItem key={availableUnit.id} value={availableUnit.id.toString()}>
                      {availableUnit.unit_name} ({availableUnit.unit_code}) - {availableUnit.property?.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {unit && (
              <Alert>
                <AlertCircleIcon className="h-4 w-4" />
                <AlertDescription>
                  <div className="mt-2">
                    <p className="font-medium">Current Unit:</p>
                    <p className="text-sm">{unit.unit_name} ({unit.unit_code})</p>
                    <p className="text-sm">{property?.name}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        );
      case 'property':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Property Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Textarea
                id="address"
                value={formData.address || ''}
                onChange={(e) => handleChange('address', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        );
      case 'payments':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="payment_type">Payment Type</Label>
                <Select value={formData.payment_type || ''} onValueChange={(value) => handleChange('payment_type', value)}>
                  <SelectTrigger>
                    {formData.payment_type || 'Select payment type'}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rent">Rent</SelectItem>
                    <SelectItem value="deposit">Security Deposit</SelectItem>
                    <SelectItem value="utility">Utility</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount?.toString() || ''}
                  onChange={(e) => handleChange('amount', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status || ''} onValueChange={(value) => handleChange('status', value)}>
                  <SelectTrigger>
                    {formData.status || 'Select status'}
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="ended">Ended</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="move_out_date">Move Out Date</Label>
                <Input
                  id="move_out_date"
                  type="date"
                  value={formData.move_out_date || ''}
                  onChange={(e) => handleChange('move_out_date', e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const getModalTitle = () => {
    switch (editType) {
      case 'personal':
        return 'Edit Personal Information';
      case 'emergency':
        return 'Edit Emergency Contact';
      case 'tenancy':
        return 'Edit Tenancy Information';
      case 'unit':
        return 'Change Unit';
      case 'property':
        return 'Edit Property Information';
      case 'payments':
        return 'Edit Payment Information';
      case 'history':
        return 'Edit Tenancy History';
      default:
        return 'Edit Information';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {renderFormFields()}
          <Separator />
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
