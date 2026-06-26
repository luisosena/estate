import { Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Edit, FileText, Home, Loader2, Trash2, Download, Upload } from 'lucide-react';
import React from 'react';
import { useState } from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import RecordPaymentModal from '@/components/record-payment-modal';
import TenantEditModal from '@/components/tenant-edit-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
  tenant_id: number;
  tenancy_id: number;
  amount: number;
  payment_type: 'rent' | 'utility' | string | null;
  payment_method: string;
  status: 'paid' | 'partial' | 'overdue' | string;
  paid_at?: string | null;
  receipt_path?: string | null;
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

interface Document {
  id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  category: string;
  uploaded_at: string;
}

interface OutstandingRentBill {
  id: number;
  billing_month: string;
  billing_month_label: string;
  amount_due: number;
  amount_paid: number;
  outstanding: number;
  status: string;
}

interface UtilityBill {
  id: number;
  amount_due: number;
  amount_paid: number;
  billing_month: string;
  status: string;
  tenancy_utility: {
    utility_type: {
      name: string;
    };
  };
}

interface Props {
  tenant: Tenant;
  tenancy?: Tenancy;
  unit?: Unit;
  property?: Property;
  payments: {
    data: Payment[];
  };
  tenancy_history: TenancyHistory[];
  documents?: Document[];
  availableUnits?: Unit[];
  outstandingRent: number;
  outstandingUtilities: number;
  pendingUtilityBills?: UtilityBill[];
  outstandingRentBills: OutstandingRentBill[];
  monthlyRent: number;
}

export default function TenantShow({
  tenant,
  tenancy,
  unit,
  property,
  payments,
  tenancy_history,
  documents = [],
  availableUnits,
  outstandingRent,
  outstandingUtilities,
  pendingUtilityBills = [],
  outstandingRentBills = [],
  monthlyRent = 0,
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
    | 'payment'
    | 'add-payment'
    | 'end-tenancy'
    | 'move-tenant'
  >('personal');
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [showRecordPaymentModal, setShowRecordPaymentModal] = useState(false);

  const { data: uploadData, setData: setUploadData, post: uploadPost, processing: uploadProcessing, reset: uploadReset } = useForm({
    document: null as File | null,
    category: 'tenancy_agreement',
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenancy || !uploadData.document) return;
    uploadPost(route('landlord.tenancies.documents.store', { tenancy: tenancy.id }), {
      onSuccess: () => {
        uploadReset();
        setShowUploadForm(false);
      },
    });
  };

  const handleDownloadDocument = (documentId: number) => {
    window.location.assign(route('landlord.documents.download', { document: documentId }));
  };

  const handleDeleteDocument = (documentId: number) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    router.delete(route('landlord.documents.destroy', { document: documentId }));
  };

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
    <>
      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
          
          <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                  <Home className="w-3 h-3" />
                  Tenant File
                </Badge>
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {tenant.full_name}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Tenant Code: {tenant.tenant_code}
              </p>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Link href={route('landlord.tenants.index')}>
                <Button variant="outline" className="bg-card border-border/50 shadow-sm hidden sm:flex">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Tenants
                </Button>
              </Link>
            </div>
          </header>

          <div className="flex flex-1 flex-col gap-6">
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
                <p className="text-sm font-medium text-muted-foreground">Full Name</p>
                <p className="mt-1 text-sm text-foreground">{tenant.full_name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Phone</p>
                <p className="mt-1 text-sm text-foreground">{tenant.phone}</p>
              </div>
              {tenant.email && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="mt-1 text-sm text-foreground">{tenant.email}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Name</p>
                  <p className="mt-1 text-sm text-foreground">
                    {tenant.emergency_contact_name || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Phone</p>
                  <p className="mt-1 text-sm text-foreground">
                    {tenant.emergency_contact_phone || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Relation</p>
                  <p className="mt-1 text-sm text-foreground">
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
              <div className="flex gap-2">
                {tenancy.status === 'active' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditType('move-tenant');
                        setIsEditModalOpen(true);
                      }}
                    >
                      Move Tenant
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setEditType('end-tenancy');
                        setIsEditModalOpen(true);
                      }}
                    >
                      End Tenancy
                    </Button>
                  </>
                )}
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
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Move-in Date</p>
                  <p className="mt-1 text-sm text-foreground">
                    {formatDate(tenancy.move_in_date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Move-out Date</p>
                  <p className="mt-1 text-sm text-foreground">
                    {formatDate(tenancy.move_out_date)}
                  </p>
                </div>
                {tenancy.monthly_rent && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Monthly Rent</p>
                    <p className="mt-1 text-sm text-foreground">
                      {formatCurrency(tenancy.monthly_rent)}
                    </p>
                  </div>
                )}
                {tenancy.security_deposit && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Security Deposit</p>
                    <p className="mt-1 text-sm text-foreground">
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
                  <p className="text-sm font-medium text-muted-foreground">Unit</p>
                  <p className="mt-1 text-sm text-foreground">{unit.unit_name}</p>
                  <p className="text-sm text-muted-foreground">{unit.unit_code}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Property</p>
                  <p className="mt-1 text-sm text-foreground">{property.name}</p>
                  <p className="text-sm text-muted-foreground">{property.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Payments — always visible */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-lg font-medium">Payments</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {outstandingRentBills.length > 0
                  ? `Outstanding: ${formatCurrency(outstandingRentBills.reduce((sum, b) => sum + (Number(b.outstanding) || 0), 0))}`
                  : 'All rent paid'}
              </p>
            </div>
            <Button onClick={() => setShowRecordPaymentModal(true)}>
              Record Payment
            </Button>
          </CardHeader>
          <CardContent>
            {(payments.data || []).length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(payments.data || []).map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {formatDate(payment.paid_at || payment.created_at)}
                      </TableCell>
                      <TableCell>{payment.payment_type || 'Rent'}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedPayment(payment);
                            setEditType('payment');
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">No payments recorded yet.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tenancy History */}
        {tenancy_history.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg font-medium">Tenancy History</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete rental history for this tenant
                </p>
              </div>
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
                    <TableHead className="text-muted-foreground">Period</TableHead>
                    <TableHead className="text-muted-foreground">Unit</TableHead>
                    <TableHead className="text-muted-foreground">Property</TableHead>
                    <TableHead className="text-muted-foreground">Duration</TableHead>
                    <TableHead className="text-muted-foreground">Monthly Rent</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenancy_history.map((history) => {
                    const moveIn = new Date(history.move_in_date || '');
                    const moveOut = history.move_out_date ? new Date(history.move_out_date) : new Date();
                    const duration = Math.floor((moveOut.getTime() - moveIn.getTime()) / (1000 * 60 * 60 * 24));
                    const durationText = duration > 0 
                      ? `${Math.floor(duration / 30)} months ${duration % 30} days`
                      : 'Less than 1 day';
                    
                    return (
                      <TableRow key={history.id} className={history.status === 'active' ? 'bg-success/5' : ''}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {formatDate(history.move_in_date)} - {formatDate(history.move_out_date) || 'Present'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {durationText}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {history.unit_name || '—'}
                          </div>
                        </TableCell>
                        <TableCell>{history.property_name || '—'}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {durationText}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">
                            {history.monthly_rent
                              ? formatCurrency(history.monthly_rent)
                              : '—'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={history.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {history.status === 'active' ? (
                              <>
                                <span className="w-2 h-2 bg-success rounded-full mr-1 inline-block"></span>
                                Active
                              </>
                            ) : (
                              <>
                                <span className="w-2 h-2 bg-muted-foreground rounded-full mr-1 inline-block"></span>
                                Ended
                              </>
                            )}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              
              {/* Tenancy Summary */}
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="text-sm font-medium text-muted-foreground mb-2">Tenancy Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Total Tenancies:</span>
                    <span className="ml-2 font-medium">{tenancy_history.length}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Active Tenancies:</span>
                    <span className="ml-2 font-medium text-success">
                      {tenancy_history.filter(t => t.status === 'active').length}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Completed Tenancies:</span>
                    <span className="ml-2 font-medium text-muted-foreground">
                      {tenancy_history.filter(t => t.status === 'ended').length}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Documents */}
        {tenancy && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg font-medium">Documents</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Tenancy agreement and related documents
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUploadForm(!showUploadForm)}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </CardHeader>
            <CardContent>
              {showUploadForm && (
                <form onSubmit={handleUploadDocument} className="mb-6 p-4 bg-muted/50 rounded-lg space-y-4">
                  <Field>
                    <FieldLabel htmlFor="document">Document File</FieldLabel>
                    <Input
                      id="document"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (file && file.size > 10 * 1024 * 1024) {
                          alert('File size must be less than 10MB');
                          e.target.value = '';
                          return;
                        }
                        setUploadData('document', file);
                      }}
                    />
                    <FieldDescription>PDF or Word document (max 10MB)</FieldDescription>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="category">Category</FieldLabel>
                    <Select value={uploadData.category} onValueChange={(value) => setUploadData('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tenancy_agreement">Tenancy Agreement</SelectItem>
                        <SelectItem value="inspection_photo">Inspection Photo</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={uploadProcessing || !uploadData.document}>
                      {uploadProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Upload Document
                    </Button>
                    <Button type="button" variant="outline" onClick={() => { setShowUploadForm(false); uploadReset(); }}>
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              {documents.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-muted-foreground">File Name</TableHead>
                      <TableHead className="text-muted-foreground">Category</TableHead>
                      <TableHead className="text-muted-foreground">Size</TableHead>
                      <TableHead className="text-muted-foreground">Uploaded</TableHead>
                      <TableHead className="text-muted-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc) => (
                      <TableRow key={doc.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{doc.file_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">
                            {doc.category.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatFileSize(doc.file_size)}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(doc.uploaded_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadDocument(doc.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteDocument(doc.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-2 text-sm font-medium text-foreground">No documents</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Upload a tenancy agreement or related documents.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
          </div>
      </main>

      {/* Record Payment Modal */}
      {tenancy && (
        <RecordPaymentModal
          isOpen={showRecordPaymentModal}
          onClose={() => setShowRecordPaymentModal(false)}
          tenant={{ full_name: tenant.full_name, tenant_code: tenant.tenant_code }}
          tenancy={{ id: tenancy.id, monthly_rent: tenancy.monthly_rent || 0 }}
          outstandingRentBills={outstandingRentBills}
          monthlyRent={monthlyRent}
        />
      )}

      {/* Edit Modal */}
      <TenantEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        tenant={tenant}
        tenancy={tenancy}
        unit={unit}
        property={property}
        availableUnits={availableUnits}
        selectedPayment={selectedPayment}
        outstandingRent={outstandingRent}
        outstandingUtilities={outstandingUtilities}
        pendingUtilityBills={pendingUtilityBills}
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
                  router.reload(); // Reload to show updated info
                },
                onError: (errors) => {
                  console.error('Unit change failed:', errors);
                },
              },
            );
          } else if (editType === 'payment') {
            // Handle payment edit
            router.put(
              route('landlord.payments.update', { payment: selectedPayment?.id }),
              updatedData,
              {
                onSuccess: () => {
                  console.log('Payment updated successfully');
                  setIsEditModalOpen(false);
                  router.reload(); // Reload to show updated info
                },
                onError: (errors) => {
                  console.error('Payment update failed:', errors);
                },
              },
            );
          } else if (editType === 'add-payment') {
            // Handle payment addition
            router.post(
              route('landlord.tenants.payments.store', { tenant: tenant.tenant_code }),
              updatedData,
              {
                onSuccess: () => {
                  console.log('Payment added successfully');
                  setIsEditModalOpen(false);
                  router.reload(); // Reload to show updated info
                },
                onError: (errors) => {
                  console.error('Payment addition failed:', errors);
                },
              },
            );
          } else if (editType === 'move-tenant') {
            // Handle tenant move (reuse existing unit change logic)
            router.put(
              route('landlord.tenancies.change-unit', { tenancy: tenancy?.id }),
              {
                new_unit_id: updatedData.unit_id,
              },
              {
                onSuccess: () => {
                  console.log('Tenant moved successfully');
                  setIsEditModalOpen(false);
                  router.reload(); // Reload to show updated info
                },
                onError: (errors) => {
                  console.error('Tenant move failed:', errors);
                },
              },
            );
          } else if (editType === 'end-tenancy') {
            // Handle tenancy ending
            router.put(
              route('landlord.tenancies.end', { tenancy: tenancy?.id }),
              updatedData,
              {
                onSuccess: () => {
                  console.log('Tenancy ended successfully');
                  setIsEditModalOpen(false);
                  router.reload(); // Reload to show updated info
                },
                onError: (errors) => {
                  console.error('Tenancy ending failed:', errors);
                },
              },
            );
          } else {
            // Handle other edit types (property, history)
            console.log('Saving data:', { editType, data: updatedData });
            setIsEditModalOpen(false);
          }
        }}
      />
    </>
  );
}

TenantShow.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
