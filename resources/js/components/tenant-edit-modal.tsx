import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  monthly_rent: number | null;
  security_deposit: number | null;
}

interface Unit {
  id: number;
  unit_name: string;
  unit_code: string;
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
          monthly_rent: tenancy?.monthly_rent || 0,
          security_deposit: tenancy?.security_deposit || 0,
        };
      case 'unit':
        return {
          unit_name: unit?.unit_name || '',
          unit_code: unit?.unit_code || '',
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
          status: 'pending',
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

  // Update form data when editType or data changes
  useEffect(() => {
    switch (editType) {
      case 'personal':
        setFormData({
          full_name: tenant.full_name,
          phone: tenant.phone,
          email: tenant.email,
          emergency_contact_name: tenant.emergency_contact_name,
          emergency_contact_phone: tenant.emergency_contact_phone,
          emergency_contact_relation: tenant.emergency_contact_relation,
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
          monthly_rent: tenancy?.monthly_rent || 0,
          security_deposit: tenancy?.security_deposit || 0,
        });
        break;
      case 'unit':
        setFormData({
          unit_name: unit?.unit_name || '',
          unit_code: unit?.unit_code || '',
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
          status: 'pending',
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
    onSave(formData);
    onClose();
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  const renderFormFields = () => {
    switch (editType) {
      case 'personal':
        return (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  value={formData.full_name || ''}
                  onChange={(e) => handleChange('full_name', e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone || ''}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="emergency_contact_name">
                Emergency Contact Name
              </Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name || ''}
                onChange={(e) =>
                  handleChange('emergency_contact_name', e.target.value)
                }
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="emergency_contact_phone">
                  Emergency Contact Phone
                </Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone || ''}
                  onChange={(e) =>
                    handleChange('emergency_contact_phone', e.target.value)
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_relation">Relationship</Label>
                <Input
                  id="emergency_contact_relation"
                  value={formData.emergency_contact_relation || ''}
                  onChange={(e) =>
                    handleChange('emergency_contact_relation', e.target.value)
                  }
                  className="mt-1"
                />
              </div>
            </div>
          </>
        );
      case 'emergency':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="emergency_contact_name">
                Emergency Contact Name
              </Label>
              <Input
                id="emergency_contact_name"
                value={formData.emergency_contact_name || ''}
                onChange={(e) =>
                  handleChange('emergency_contact_name', e.target.value)
                }
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="emergency_contact_phone">
                  Emergency Contact Phone
                </Label>
                <Input
                  id="emergency_contact_phone"
                  value={formData.emergency_contact_phone || ''}
                  onChange={(e) =>
                    handleChange('emergency_contact_phone', e.target.value)
                  }
                />
              </div>
              <div>
                <Label htmlFor="emergency_contact_relation">Relationship</Label>
                <Input
                  id="emergency_contact_relation"
                  value={formData.emergency_contact_relation || ''}
                  onChange={(e) =>
                    handleChange('emergency_contact_relation', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        );
      case 'tenancy':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || ''}
                  onValueChange={(value) => handleChange('status', value)}
                >
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
              <div>
                <Label htmlFor="move_in_date">Move-in Date</Label>
                <Input
                  id="move_in_date"
                  type="date"
                  value={formData.move_in_date || ''}
                  onChange={(e) => handleChange('move_in_date', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <Label htmlFor="monthly_rent">Monthly Rent</Label>
                <Input
                  id="monthly_rent"
                  type="number"
                  value={formData.monthly_rent?.toString() || ''}
                  onChange={(e) => handleChange('monthly_rent', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="security_deposit">Security Deposit</Label>
                <Input
                  id="security_deposit"
                  type="number"
                  value={formData.security_deposit?.toString() || ''}
                  onChange={(e) =>
                    handleChange('security_deposit', e.target.value)
                  }
                />
              </div>
            </div>
          </div>
        );
      case 'unit':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="unit_name">Unit Name</Label>
              <Input
                id="unit_name"
                value={formData.unit_name || ''}
                onChange={(e) => handleChange('unit_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="unit_code">Unit Code</Label>
              <Input
                id="unit_code"
                value={formData.unit_code || ''}
                onChange={(e) => handleChange('unit_code', e.target.value)}
              />
            </div>
          </div>
        );
      case 'property':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Property Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleChange('name', e.target.value)}
              />
            </div>
            <div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount?.toString() || ''}
                  onChange={(e) => handleChange('amount', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status || ''} onValueChange={(value) => handleChange('status', value)}>
                <SelectTrigger>
                  {formData.status || 'Select status'}
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 'history':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
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
              <div>
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
        return 'Edit Unit Information';
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getModalTitle()}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderFormFields()}
          <DialogFooter>
            <Button type="submit">Save Changes</Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
