import { LandlordSidebar } from '@/components/layout/landlord-sidebar';
import TenantEditModal from '@/components/tenant-edit-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Link, router } from '@inertiajs/react';
import { AlertCircle, ArrowLeft, Edit, Home } from 'lucide-react';
import { useEffect, useState } from 'react';
import { route } from 'ziggy-js';

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
}

interface Property {
  id: number;
  name: string;
  address: string;
}

interface Payment {
  id: number;
  amount: number;
  status: string;
  payment_type: string | null;
  paid_at?: string;
  created_at: string;
}

interface TenancyHistory {
  id: number;
  status: string;
  move_in_date: string | null;
  move_out_date: string | null;
  monthly_rent: number | null;
  unit_name: string | null;
  property_name: string | null;
}

interface Props {
  tenant: Tenant;
  tenancy?: Tenancy;
  unit?: Unit;
  property?: Property;
  payments: Payment[];
  tenancy_history: TenancyHistory[];
  properties: any[];
}

export default function TenantShow({
  tenant,
  tenancy,
  unit,
  property,
  payments,
  tenancy_history,
  properties,
}: Props) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editType, setEditType] = useState<
    | 'personal'
    | 'emergency'
    | 'tenancy'
    | 'unit'
    | 'property'
    | 'payments'
    | 'history'
  >('personal');
  const [availableUnits, setAvailableUnits] = useState<any[]>([]);

  const fetchAvailableUnits = async () => {
    try {
      const response = await fetch('/api/landlord/available-units');
      const data = await response.json();
      setAvailableUnits(data);
    } catch (error) {
      console.error('Failed to fetch available units:', error);
    }
  };

  useEffect(() => {
    if (isEditModalOpen && editType === 'unit') {
      fetchAvailableUnits();
    }
  }, [isEditModalOpen, editType]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
    }).format(amount);

  const getPaymentStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      completed: 'default',
      paid: 'default',
      pending: 'secondary',
      failed: 'destructive',
      cancelled: 'outline',
    };
    const variant = variants[status?.toLowerCase()] || 'secondary';
    return (
      <Badge variant={variant} className="text-xs">
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
      </Badge>
    );
  };

  const hasEmergencyContact =
    tenant.emergency_contact_name || tenant.emergency_contact_phone;

  return (
    <SidebarProvider defaultOpen={false}>
      <LandlordSidebar properties={properties} />
      <SidebarInset className="px-6 pt-4 pb-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <SidebarTrigger />
          <div className="flex-1">
            <Link
              href={route('landlord.tenants.index')}
              className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tenants
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Tenant Details</h1>
            <p className="mt-1 text-sm text-gray-500">
              Tenant Code: {tenant.tenant_code}
            </p>
          </div>
        </div>

        {/* Tenant Info Card */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-lg font-medium">Personal Information</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditType('personal');
                setIsEditModalOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="mt-1 text-sm text-gray-900">{tenant.full_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="mt-1 text-sm text-gray-900">{tenant.phone}</p>
              </div>
              {tenant.email && (
                <div>
                  <p className="text-sm font-medium text-gray-500">Email</p>
                  <p className="mt-1 text-sm text-gray-900">{tenant.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact Card */}
        {hasEmergencyContact && (
          <Card className="mb-6 border-l-4 border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center">
                <AlertCircle className="mr-2 h-5 w-5 text-blue-500" />
                <CardTitle className="text-lg font-medium">Emergency Contact</CardTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditType('emergency');
                  setIsEditModalOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm font-medium text-gray-500">Name</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {tenant.emergency_contact_name || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {tenant.emergency_contact_phone || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Relation</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {tenant.emergency_contact_relation || '—'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tenancy Info */}
        {tenancy && unit && property && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-medium">Tenancy Information</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditType('tenancy');
                  setIsEditModalOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <p className="mt-1">
                    <Badge 
                      variant={tenancy.status === 'active' ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {tenancy.status?.charAt(0).toUpperCase() + tenancy.status?.slice(1)}
                    </Badge>
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Move-in Date</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(tenancy.move_in_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Move-out Date</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {formatDate(tenancy.move_out_date)}
                  </p>
                </div>
                {tenancy.monthly_rent && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Monthly Rent</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatCurrency(tenancy.monthly_rent)}
                    </p>
                  </div>
                )}
                {tenancy.security_deposit && (
                  <div>
                    <p className="text-sm font-medium text-gray-500">Security Deposit</p>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatCurrency(tenancy.security_deposit)}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Unit & Property Info */}
        {unit && property && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-medium">Unit & Property Information</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditType('unit');
                  setIsEditModalOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-gray-500">Unit</p>
                  <p className="mt-1 text-sm text-gray-900">{unit.unit_name}</p>
                  <p className="text-sm text-gray-500">{unit.unit_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Property</p>
                  <p className="mt-1 text-sm text-gray-900">{property.name}</p>
                  <p className="text-sm text-gray-500">{property.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Payments */}
        {payments.length > 0 && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-medium">Recent Payments</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditType('payments');
                  setIsEditModalOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {formatDate(payment.paid_at || payment.created_at)}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          {payment.payment_type || 'Rent'}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getPaymentStatusBadge(payment.status)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty Payments State */}
        {payments.length === 0 && (
          <Card className="mb-6">
            <CardContent className="px-6 py-12 text-center">
              <Home className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                No payments
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                This tenant has no payment records yet.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tenancy History */}
        {tenancy_history.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle className="text-lg font-medium">Tenancy History</CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditType('history');
                  setIsEditModalOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Unit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Move In
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Move Out
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Rent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {tenancy_history.map((history) => (
                      <tr key={history.id}>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {history.unit_name || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-500">
                          {history.property_name || '—'}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {formatDate(history.move_in_date)}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {formatDate(history.move_out_date)}
                        </td>
                        <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                          {history.monthly_rent
                            ? formatCurrency(history.monthly_rent)
                            : '—'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge 
                            variant={history.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {history.status?.charAt(0).toUpperCase() +
                              history.status?.slice(1)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </SidebarInset>

      {/* Edit Modal */}
      <TenantEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        tenant={tenant}
        tenancy={tenancy}
        unit={unit}
        property={property}
        availableUnits={availableUnits}
        editType={editType}
        onSave={(updatedData) => {
          // Handle different types of updates
          if (editType === 'personal' || editType === 'emergency') {
            // For emergency contact updates, include required tenant fields
            const dataToSend =
              editType === 'emergency'
                ? {
                    full_name: tenant.full_name,
                    phone: tenant.phone,
                    email: tenant.email,
                    ...updatedData,
                  }
                : updatedData;

            // Update tenant information
            router.put(
              route('landlord.tenants.update', { tenant: tenant.tenant_code }),
              dataToSend,
              {
                onSuccess: () => {
                  console.log('Tenant updated successfully');
                  setIsEditModalOpen(false);
                },
                onError: (errors) => {
                  console.error('Update failed:', errors);
                },
              },
            );
          } else if (editType === 'tenancy') {
            // Update tenancy information via tenant update
            const dataToSend = {
              full_name: tenant.full_name,
              phone: tenant.phone,
              email: tenant.email,
              ...updatedData,
            };

            router.put(
              route('landlord.tenants.update', { tenant: tenant.tenant_code }),
              dataToSend,
              {
                onSuccess: () => {
                  console.log('Tenancy updated successfully');
                  setIsEditModalOpen(false);
                },
                onError: (errors) => {
                  console.error('Tenancy update failed:', errors);
                },
              },
            );
          } else if (editType === 'unit') {
            // Handle unit change
            router.put(
              route('landlord.tenancies.change-unit', { tenancy: tenancy?.id }),
              {
                new_unit_id: updatedData.unit_id,
              },
              {
                onSuccess: () => {
                  console.log('Unit changed successfully');
                  setIsEditModalOpen(false);
                  window.location.reload(); // Reload to show updated unit info
                },
                onError: (errors) => {
                  console.error('Unit change failed:', errors);
                },
              },
            );
          } else {
            // TODO: Handle other edit types (property, payments, history)
            console.log('Saving data:', { editType, data: updatedData });
            setIsEditModalOpen(false);
          }
        }}
      />
    </SidebarProvider>
  );
}
