import { LandlordSidebar } from '@/components/layout/landlord-sidebar';
import TenantEditModal from '@/components/tenant-edit-modal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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
              className="mb-4 inline-flex items-center text-gray-600 hover:text-gray-200"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Tenants
            </Link>
            <h1 className="text-3xl font-bold text-gray-200">Tenant Details</h1>
            <p className="mt-1 text-sm text-gray-400">
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
                <p className="text-sm font-medium text-gray-400">Full Name</p>
                <p className="mt-1 text-sm text-gray-200">{tenant.full_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-400">Phone</p>
                <p className="mt-1 text-sm text-gray-200">{tenant.phone}</p>
              </div>
              {tenant.email && (
                <div>
                  <p className="text-sm font-medium text-gray-400">Email</p>
                  <p className="mt-1 text-sm text-gray-200">{tenant.email}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact Card */}
        {hasEmergencyContact && (
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div className="flex items-center">
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
                  <p className="text-sm font-medium text-gray-400">Name</p>
                  <p className="mt-1 text-sm text-gray-200">
                    {tenant.emergency_contact_name || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Phone</p>
                  <p className="mt-1 text-sm text-gray-200">
                    {tenant.emergency_contact_phone || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Relation</p>
                  <p className="mt-1 text-sm text-gray-200">
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
                  <p className="text-sm font-medium text-gray-400">Move-in Date</p>
                  <p className="mt-1 text-sm text-gray-200">
                    {formatDate(tenancy.move_in_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Move-out Date</p>
                  <p className="mt-1 text-sm text-gray-200">
                    {formatDate(tenancy.move_out_date)}
                  </p>
                </div>
                {tenancy.monthly_rent && (
                  <div>
                    <p className="text-sm font-medium text-gray-400">Monthly Rent</p>
                    <p className="mt-1 text-sm text-gray-200">
                      {formatCurrency(tenancy.monthly_rent)}
                    </p>
                  </div>
                )}
                {tenancy.security_deposit && (
                  <div>
                    <p className="text-sm font-medium text-gray-400">Security Deposit</p>
                    <p className="mt-1 text-sm text-gray-200">
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
                  <p className="text-sm font-medium text-gray-400">Unit</p>
                  <p className="mt-1 text-sm text-gray-200">{unit.unit_name}</p>
                  <p className="text-sm text-gray-400">{unit.unit_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Property</p>
                  <p className="mt-1 text-sm text-gray-200">{property.name}</p>
                  <p className="text-sm text-gray-400">{property.address}</p>
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
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-400">Date</TableHead>
                    <TableHead className="text-gray-400">Type</TableHead>
                    <TableHead className="text-gray-400">Amount</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {formatDate(payment.paid_at || payment.created_at)}
                      </TableCell>
                      <TableCell>{payment.payment_type || 'Rent'}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Empty Payments State */}
        {payments.length === 0 && (
          <Card className="mb-6">
            <CardContent className="px-6 py-12 text-center">
              <Home className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-200">
                No payments
              </h3>
              <p className="mt-1 text-sm text-gray-400">
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
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-400">Unit</TableHead>
                    <TableHead className="text-gray-400">Property</TableHead>
                    <TableHead className="text-gray-400">Move In</TableHead>
                    <TableHead className="text-gray-400">Move Out</TableHead>
                    <TableHead className="text-gray-400">Rent</TableHead>
                    <TableHead className="text-gray-400">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenancy_history.map((history) => (
                    <TableRow key={history.id}>
                      <TableCell className="font-medium">
                        {history.unit_name || '—'}
                      </TableCell>
                      <TableCell>{history.property_name || '—'}</TableCell>
                      <TableCell>{formatDate(history.move_in_date)}</TableCell>
                      <TableCell>{formatDate(history.move_out_date)}</TableCell>
                      <TableCell>
                        {history.monthly_rent
                          ? formatCurrency(history.monthly_rent)
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={history.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {history.status?.charAt(0).toUpperCase() +
                            history.status?.slice(1)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
