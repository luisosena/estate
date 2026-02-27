import { Link, router } from '@inertiajs/react';
import { route } from 'ziggy-js';
import { ArrowLeft, Mail, Phone, Home, AlertCircle, Edit } from 'lucide-react';
import { LandlordSidebar } from '@/components/layout/landlord-sidebar';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import TenantEditModal from '@/components/tenant-edit-modal';
import { useState } from 'react';

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

export default function TenantShow({ tenant, tenancy, unit, property, payments, tenancy_history, properties }: Props) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editType, setEditType] = useState<'personal' | 'emergency' | 'tenancy' | 'unit' | 'property' | 'payments' | 'history'>('personal');

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
        const styles: Record<string, string> = {
            'completed': 'bg-green-100 text-green-800',
            'paid': 'bg-green-100 text-green-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'failed': 'bg-red-100 text-red-800',
            'cancelled': 'bg-gray-100 text-gray-800',
        };
        const style = styles[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
        return (
            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${style}`}>
                {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown'}
            </span>
        );
    };

    const hasEmergencyContact = tenant.emergency_contact_name || tenant.emergency_contact_phone;

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
                            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Tenants
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900">Tenant Details</h1>
                        <p className="mt-1 text-sm text-gray-500">Tenant Code: {tenant.tenant_code}</p>
                    </div>
                </div>

                {/* Tenant Info Card */}
                <div className="bg-white shadow rounded-lg mb-6">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-medium text-gray-900">Personal Information</h2>
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
                    </div>
                    <div className="px-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    </div>
                </div>

                {/* Emergency Contact Card */}
                {hasEmergencyContact && (
                    <div className="bg-white shadow rounded-lg mb-6 border-l-4 border-blue-500">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900 flex items-center">
                                <AlertCircle className="h-5 w-5 mr-2 text-blue-500" />
                                Emergency Contact
                            </h2>
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
                        </div>
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Name</p>
                                    <p className="mt-1 text-sm text-gray-900">{tenant.emergency_contact_name || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Phone</p>
                                    <p className="mt-1 text-sm text-gray-900">{tenant.emergency_contact_phone || '—'}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Relation</p>
                                    <p className="mt-1 text-sm text-gray-900">{tenant.emergency_contact_relation || '—'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tenancy Info */}
                {tenancy && unit && property && (
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">Tenancy Information</h2>
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
                        </div>
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Status</p>
                                    <p className="mt-1">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                            tenancy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                        }`}>
                                            {tenancy.status?.charAt(0).toUpperCase() + tenancy.status?.slice(1)}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Move-in Date</p>
                                    <p className="mt-1 text-sm text-gray-900">{formatDate(tenancy.move_in_date)}</p>
                                </div>
                                {tenancy.monthly_rent && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Monthly Rent</p>
                                        <p className="mt-1 text-sm text-gray-900">{formatCurrency(tenancy.monthly_rent)}</p>
                                    </div>
                                )}
                                {tenancy.security_deposit && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-500">Security Deposit</p>
                                        <p className="mt-1 text-sm text-gray-900">{formatCurrency(tenancy.security_deposit)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Unit & Property Info */}
                {unit && property && (
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">Unit & Property Information</h2>
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
                        </div>
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>
                    </div>
                )}

                {/* Recent Payments */}
                {payments.length > 0 && (
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">Recent Payments</h2>
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
                        </div>
                        <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {payments.map((payment) => (
                                        <tr key={payment.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(payment.paid_at || payment.created_at)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {payment.payment_type || 'Rent'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
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
                    </div>
                )}

                {/* Empty Payments State */}
                {payments.length === 0 && (
                    <div className="bg-white shadow rounded-lg mb-6">
                        <div className="px-6 py-12 text-center">
                            <Home className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments</h3>
                            <p className="mt-1 text-sm text-gray-500">This tenant has no payment records yet.</p>
                        </div>
                    </div>
                )}

                {/* Tenancy History */}
                {tenancy_history.length > 0 && (
                    <div className="bg-white shadow rounded-lg">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-medium text-gray-900">Tenancy History</h2>
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
                        </div>
                        <div className="overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Unit
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Property
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Move In
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Move Out
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Rent
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {tenancy_history.map((history) => (
                                        <tr key={history.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {history.unit_name || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {history.property_name || '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(history.move_in_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatDate(history.move_out_date)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {history.monthly_rent ? formatCurrency(history.monthly_rent) : '—'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    history.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {history.status?.charAt(0).toUpperCase() + history.status?.slice(1)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>)}
            </SidebarInset>
            
            {/* Edit Modal */}
            <TenantEditModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                tenant={tenant}
                tenancy={tenancy}
                unit={unit}
                property={property}
                editType={editType}
                onSave={(updatedData) => {
                    // Handle different types of updates
                    if (editType === 'personal' || editType === 'emergency') {
                        // Update tenant information
                        router.put(route('landlord.tenants.update', { tenant: tenant.tenant_code }), updatedData, {
                            onSuccess: () => {
                                console.log('Tenant updated successfully');
                                setIsEditModalOpen(false);
                            },
                            onError: (errors) => {
                                console.error('Update failed:', errors);
                            }
                        });
                    } else {
                        // TODO: Handle other edit types (tenancy, unit, property)
                        console.log('Saving data:', { editType, data: updatedData });
                        setIsEditModalOpen(false);
                    }
                }}
            />
        </SidebarProvider>
    );
}
