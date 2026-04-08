import { TenantSidebar } from '@/components/layout/tenant-sidebar';
import TenantNotificationBell from '@/components/tenant-notification-bell';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Link, router } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { route } from 'ziggy-js';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast, Toaster } from 'sonner';
import { z } from 'zod';

// Types
interface Tenant {
  id: number;
  full_name: string;
  phone?: string;
  email?: string;
}

interface Tenancy {
  id: number;
  monthly_rent: number;
}

interface PaymentMethod {
  value: string;
  label: string;
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

interface ExistingPayment {
  id: number;
  amount: number;
  payment_type: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  utility_bill_id?: number | null;
}

interface Props {
  tenant: Tenant;
  tenancy?: Tenancy | null;
  existingPayment?: ExistingPayment | null;
  pendingAmount?: number;
  paymentMethods?: PaymentMethod[];
  pendingUtilityBills?: UtilityBill[];
}

// Form validation schema
const paymentSchema = z.object({
  amount: z.union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'number') return val;
      if (!val || val.trim() === '') return undefined;
      // Clean string: remove commas, spaces, currency symbols
      const cleaned = val.replace(/[^0-9.]/g, '');
      const num = Number(cleaned);
      return isNaN(num) ? undefined : num;
    })
    .pipe(
      z.number({ 
        required_error: "Amount is required",
        invalid_type_error: "Please enter a valid numeric amount"
      }).min(1, 'Amount must be at least 1')
    ),
  payment_type: z.enum(['rent', 'utility']),
  payment_method: z.enum(['mobile_money', 'bank_transfer']),
  reference_number: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
  utility_bill_id: z.coerce.number().nullable().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
  }).format(amount);

export default function MakePayment({
  tenant,
  tenancy,
  existingPayment,
  pendingAmount = 0,
  paymentMethods = [],
  pendingUtilityBills = [],
}: Props) {
  // Form state
  const [formData, setFormData] = useState<any>({
    amount: Number(existingPayment?.amount || 0) || (existingPayment?.payment_type === 'rent' || !existingPayment ? (Number(pendingAmount) || 0) : 0),
    payment_type: (existingPayment?.payment_type as 'rent' | 'utility') ?? 'rent',
    payment_method: existingPayment?.payment_method ?? '',
    reference_number: existingPayment?.reference_number ?? '',
    notes: existingPayment?.notes ?? '',
    utility_bill_id: existingPayment?.utility_bill_id ?? null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Check for overpayment
  const isOverpayment = useMemo(() => {
    const amount = Number(formData.amount?.toString().replace(/[^0-9.]/g, '')) || 0;
    if (formData.payment_type === 'rent') {
      return amount > (Number(pendingAmount) || 0);
    } else if (formData.payment_type === 'utility' && formData.utility_bill_id) {
      const bill = pendingUtilityBills.find(b => b.id === Number(formData.utility_bill_id));
      if (bill) {
        const outstanding = Number(bill.amount_due || 0) - Number(bill.amount_paid || 0);
        return amount > outstanding;
      }
    }
    return false;
  }, [formData.amount, formData.payment_type, formData.utility_bill_id, pendingAmount, pendingUtilityBills]);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  // Handle payment method selection
  const handleMethodSelect = (method: string) => {
    setFormData((prev: any) => ({ ...prev, payment_method: method }));
    if (errors.payment_method) {
      setErrors((prev: any) => ({ ...prev, payment_method: '' }));
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    try {
      paymentSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.issues.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
      return false;
    }
  };

  // Handle submit to show confirmation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      // Show error alert
      toast.error('Please fix the errors in the form');
      return;
    }
    
    setShowConfirmation(true);
  };

  // Handle edit from confirmation
  const handleEdit = () => {
    setShowConfirmation(false);
  };

  // Handle verify and submit
  const handleVerify = async () => {
    setIsSubmitting(true);
    
    try {
      router.post(route('tenant.payments.store'), formData, {
        onSuccess: () => {
          setShowConfirmation(false);
          setShowSuccess(true);
        },
        onError: (errors) => {
          setErrors(errors as Record<string, string>);
          setShowConfirmation(false);
          toast.error('Failed to process payment');
        },
        onFinish: () => {
          setIsSubmitting(false);
        },
      });
    } catch (error) {
      setShowConfirmation(false);
      setIsSubmitting(false);
      toast.error('An error occurred. Please try again.');
    }
  };

  // Show success state
  if (showSuccess) {
    return (
      <SidebarProvider defaultOpen={false}>
        <TenantSidebar />
        <SidebarInset className="px-6 pt-4 pb-8">
          <div className="flex items-center gap-3 mb-8">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Payment Submitted</h1>
            </div>
          </div>

          <Alert className="bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-700 dark:text-green-400">
              Payment Received
            </AlertTitle>
            <AlertDescription className="text-green-600 dark:text-green-500">
              Your payment of {formatCurrency(Number(formData.amount.toString().replace(/[^0-9.]/g, '')))} has been successfully submitted.
              You will be redirected to the payments page shortly.
            </AlertDescription>
          </Alert>

          <div className="mt-6 flex justify-center">
            <Link href={route('tenant.payments')}>
              <Button>Go to Payments</Button>
            </Link>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <TenantSidebar />
      <Toaster />
      <SidebarInset className="px-6 pt-4 pb-8">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <SidebarTrigger />
          <div className="flex-1">
            <Link
              href={route('tenant.payments')}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-1"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Payments
            </Link>
            <h1 className="text-2xl font-bold">Make Payment</h1>
          </div>
          <div className="flex items-center gap-2">
            <TenantNotificationBell initialUnreadCount={0} />
          </div>
        </div>

        {/* Error Alert */}
        {Object.keys(errors).length > 0 && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Validation Error</AlertTitle>
            <AlertDescription>
              Please fix the following errors:
              <ul className="mt-2 list-disc list-inside">
                {Object.values(errors).map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Payment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Details
                </CardTitle>
                <CardDescription>
                  Enter the payment amount and type
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">
                    Amount <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="text"
                    inputMode="decimal"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={handleChange}
                    className={errors.amount ? 'border-destructive' : ''}
                  />
                  {tenancy && (
                    <p className="text-xs text-muted-foreground">
                      Monthly rent: {formatCurrency(tenancy.monthly_rent)}
                      {pendingAmount > 0 && ` • Pending: ${formatCurrency(pendingAmount)}`}
                    </p>
                  )}
                  {errors.amount && (
                    <p className="text-xs text-destructive">{errors.amount}</p>
                  )}
                  
                  {isOverpayment && !errors.amount && (
                    <Alert className="mt-2 py-2 px-3 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/10 dark:border-yellow-800">
                      <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                      <AlertDescription className="text-xs text-yellow-700 dark:text-yellow-500">
                        The entered amount exceeds the outstanding balance. Correct if necessary, or proceed if paying in advance.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>

                {/* Payment Type */}
                <div className="space-y-2">
                  <Label htmlFor="payment_type">
                    Payment Type <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.payment_type}
                    onValueChange={(value: 'rent' | 'utility') =>
                      setFormData((prev: any) => ({ 
                        ...prev, 
                        payment_type: value,
                        utility_bill_id: value === 'rent' ? null : prev.utility_bill_id,
                        amount: value === 'rent' ? pendingAmount : prev.amount
                      }))
                    }
                  >
                    <SelectTrigger
                      className={errors.payment_type ? 'border-destructive' : ''}
                    >
                      <SelectValue placeholder="Select payment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rent">Rent</SelectItem>
                      <SelectItem value="utility">Utility</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.payment_type && (
                    <p className="text-xs text-destructive">{errors.payment_type}</p>
                  )}
                </div>

                {/* Utility Bill Selection (Conditional) */}
                {formData.payment_type === 'utility' && pendingUtilityBills && pendingUtilityBills.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="utility_bill_id">
                      Link to Utility Bill <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.utility_bill_id?.toString() || ''}
                      onValueChange={(value) => {
                        const bill = pendingUtilityBills.find(b => b.id.toString() === value);
                        if (bill) {
                          const outstanding = Number(bill.amount_due || 0) - Number(bill.amount_paid || 0);
                          setFormData((prev: any) => ({ 
                            ...prev, 
                            utility_bill_id: parseInt(value),
                            amount: outstanding > 0 ? outstanding : 0
                          }));
                        } else {
                          setFormData((prev: any) => ({ 
                            ...prev, 
                            utility_bill_id: parseInt(value)
                          }));
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a bill to pay" />
                      </SelectTrigger>
                      <SelectContent>
                        {pendingUtilityBills.map((bill) => (
                          <SelectItem key={bill.id} value={bill.id.toString()}>
                            {bill.tenancy_utility.utility_type.name} - {new Date(bill.billing_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} 
                            ({formatCurrency(bill.amount_due - bill.amount_paid)} due)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.utility_bill_id && (
                      <p className="text-xs text-destructive">{errors.utility_bill_id}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  Payment Method
                </CardTitle>
                <CardDescription>
                  Select how you will make the payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Mobile Money */}
                  <button
                    type="button"
                    onClick={() => handleMethodSelect('mobile_money')}
                    className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      formData.payment_method === 'mobile_money'
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-muted-foreground'
                    }`}
                  >
                    <Smartphone className="h-8 w-8" />
                    <span className="font-medium">Mobile Money</span>
                  </button>

                  {/* Bank Transfer */}
                  <button
                    type="button"
                    onClick={() => handleMethodSelect('bank_transfer')}
                    className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 p-4 transition-all ${
                      formData.payment_method === 'bank_transfer'
                        ? 'border-primary bg-primary/10'
                        : 'border-muted hover:border-muted-foreground'
                    }`}
                  >
                    <Building2 className="h-8 w-8" />
                    <span className="font-medium">Bank Transfer</span>
                  </button>
                </div>
                {errors.payment_method && (
                  <p className="text-xs text-destructive">{errors.payment_method}</p>
                )}
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Additional Information</CardTitle>
                <CardDescription>
                  Optional details about your payment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Reference Number */}
                <div className="space-y-2">
                  <Label htmlFor="reference_number">Reference Number</Label>
                  <Input
                    id="reference_number"
                    name="reference_number"
                    placeholder="e.g., MNO-2026-001"
                    value={formData.reference_number}
                    onChange={handleChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    The transaction reference from your mobile money or bank
                  </p>
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Add any additional notes..."
                    value={formData.notes}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Submit Button */}
          <div className="mt-6 flex justify-end gap-4">
            <Link href={route('tenant.payments')}>
              <Button variant="outline" type="button">
                Cancel
              </Button>
            </Link>
            <Button type="submit">
              Continue to Confirm
            </Button>
          </div>
        </form>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
              <DialogDescription>
                Please review your payment details before verifying
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold">{formatCurrency(formData.amount)}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Payment Type</span>
                <span className="capitalize">{formData.payment_type}</span>
              </div>
              {formData.payment_type === 'utility' && formData.utility_bill_id && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Linked Bill</span>
                  <span className="text-right">
                    {pendingUtilityBills?.find(b => b.id === formData.utility_bill_id)?.tenancy_utility.utility_type.name}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-muted-foreground">Method</span>
                <span className="capitalize">
                  {formData.payment_method === 'mobile_money' ? 'Mobile Money' : 'Bank Transfer'}
                </span>
              </div>
              {formData.reference_number && (
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-muted-foreground">Reference</span>
                  <span className="font-medium">{formData.reference_number}</span>
                </div>
              )}
            </div>

            <DialogFooter className="sm:justify-between gap-2">
              <Button
                variant="outline"
                onClick={handleEdit}
                className="w-full sm:w-auto"
              >
                Edit
              </Button>
              <Button
                onClick={handleVerify}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Processing...' : 'Verify & Submit'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}
