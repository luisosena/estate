import { Link, router, usePage } from '@inertiajs/react';
import {
  ArrowLeft,
  CreditCard,
  Smartphone,
  Building2,
  AlertCircle,
  CheckCircle2,
  Receipt,
  Info,
  ChevronRight,
  Wallet,
  ShieldCheck,
  CalendarDays,
  FileText,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast, Toaster } from 'sonner';
import { route } from 'ziggy-js';
import { z } from 'zod';

import AppLayout from '@/components/layout/AppLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  SelectValue,
} from '@/components/ui/select';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { formatCurrency, getFormattedDate } from '@/lib/formatters';
import { type SharedData } from '@/types';

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
  tenant: { data: Tenant };
  tenancy?: { data: Tenancy } | null;
  existingPayment?: { data: ExistingPayment } | null;
  pendingAmount?: number;
  paymentMethods?: PaymentMethod[];
  pendingUtilityBills?: { data: UtilityBill[] };
}

interface PaymentFormData {
  [key: string]: any;
  amount: number | string;
  payment_type: 'rent' | 'utility';
  payment_method: string;
  reference_number: string;
  notes: string;
  utility_bill_id: number | null;
}

// Form validation schema
const paymentSchema = z.object({
  amount: z.union([z.string(), z.number()])
    .transform((val) => {
      if (typeof val === 'number') return val;
      if (!val || val.trim() === '') return undefined;
      const cleaned = val.toString().replace(/[^0-9.]/g, '');
      const num = Number(cleaned);
      return isNaN(num) ? undefined : num;
    })
    .pipe(
      z.number({ 
        message: "Please enter a valid numeric amount"
      }).min(1, 'Amount must be at least 1')
    ),
  payment_type: z.enum(['rent', 'utility']),
  payment_method: z.enum(['mobile_money', 'bank_transfer']),
  reference_number: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
  utility_bill_id: z.coerce.number().nullable().optional(),
});


export default function MakePayment({
  tenant,
  tenancy: tenancyWrapper,
  existingPayment: existingPaymentWrapper,
  pendingAmount = 0,
  paymentMethods = [],
  pendingUtilityBills: pendingUtilityBillsWrapper = { data: [] },
}: Props) {
  const { auth } = usePage<SharedData>().props;
  
  const tenantData = tenant.data;
  const tenancy = tenancyWrapper?.data;
  const existingPayment = existingPaymentWrapper?.data;
  const utilityBills = pendingUtilityBillsWrapper.data;
  
  // Form state
  const [formData, setFormData] = useState<PaymentFormData>({
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
      const bill = utilityBills.find(b => b.id === Number(formData.utility_bill_id));
      if (bill) {
        const outstanding = Number(bill.amount_due || 0) - Number(bill.amount_paid || 0);
        return amount > outstanding;
      }
    }
    return false;
  }, [formData.amount, formData.payment_type, formData.utility_bill_id, pendingAmount, utilityBills]);

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle payment method selection
  const handleMethodSelect = (method: string) => {
    setFormData((prev: any) => ({ ...prev, payment_method: method }));
    if (errors.payment_method) {
      setErrors((prev: any) => {
        const newErrors = { ...prev };
        delete newErrors.payment_method;
        return newErrors;
      });
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
        const firstError = Object.values(errors)[0];
        toast.error(firstError || 'Validation failed. Check your inputs.');
        return;
    }
    setShowConfirmation(true);
  };

  // Handle verify and submit
  const handleVerify = async () => {
    setIsSubmitting(true);
    try {
      router.post(route('tenant.payments.store'), formData as any, {
        onSuccess: () => {
          setShowConfirmation(false);
          setShowSuccess(true);
          toast.success('Payment successfully logged');
        },
        onError: (errors) => {
          setErrors(errors as Record<string, string>);
          setShowConfirmation(false);
          toast.error('Submission failed. Please check details.');
        },
        onFinish: () => {
          setIsSubmitting(false);
        },
      });
    } catch (error) {
      setShowConfirmation(false);
      setIsSubmitting(false);
      toast.error('An unexpected error occurred.');
    }
  };

  // Success State (Receipt View)
  if (showSuccess) {
    return (
      <main className="min-h-[80vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full shadow-2xl border-border/50 overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="bg-primary h-2 w-full" />
            <CardHeader className="text-center pb-2">
                <div className="mx-auto w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <CardTitle className="text-2xl font-bold">Payment Logged</CardTitle>
                <CardDescription>Thank you for your timely settlement.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
                <div className="bg-muted/30 rounded-2xl p-6 text-center">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">Total Amount Paid</p>
                    <h2 className="text-4xl font-extrabold text-foreground">{formatCurrency(Number(formData.amount))}</h2>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-sm py-2 border-b border-dashed">
                        <span className="text-muted-foreground">Payment Type</span>
                        <span className="font-bold capitalize">{formData.payment_type}</span>
                    </div>
                    {formData.reference_number && (
                        <div className="flex justify-between text-sm py-2 border-b border-dashed">
                            <span className="text-muted-foreground">Reference</span>
                            <span className="font-mono">{formData.reference_number}</span>
                        </div>
                    )}
                    <div className="flex justify-between text-sm py-2 border-b border-dashed">
                        <span className="text-muted-foreground">Date Logged</span>
                        <span>{getFormattedDate()}</span>
                    </div>
                </div>

                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-3 items-center">
                    <ShieldCheck className="w-5 h-5 text-primary shrink-0" />
                    <p className="text-xs text-muted-foreground">
                        Your payment is currently under verification by building management. It will reflect in your ledger shortly.
                    </p>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3 pt-6 pb-8">
                <Button asChild className="w-full">
                    <Link href={route('tenant.payments')}>Return to Ledger</Link>
                </Button>
                <Button variant="ghost" className="w-full" asChild>
                    <Link href={route('tenant.dashboard')}>Back to Dashboard</Link>
                </Button>
            </CardFooter>
        </Card>
      </main>
    );
  }

  return (
    <main className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-20">
        <Toaster position="top-center" expand={true} richColors />
        
        {/* Header */}
        <header className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild className="-ml-2 h-8 text-muted-foreground hover:text-foreground">
                    <Link href={route('tenant.payments')}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Ledger
                    </Link>
                </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <SidebarTrigger className="-ml-2 md:hidden" />
                        <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                            <Wallet className="w-3 h-3" />
                            Secure Payment Portal
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                        Settle Balances
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Select a payment type and method to update your records.
                    </p>
                </div>
            </div>
        </header>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Primary Form Section */}
            <div className="lg:col-span-7 flex flex-col gap-8">
                
                {/* 1. Payment Context */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-4 ring-primary/5">1</div>
                        <h2 className="text-lg font-semibold tracking-tight">Payment Allocation</h2>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData((p: PaymentFormData) => ({ ...p, payment_type: 'rent', amount: pendingAmount || p.amount }))}
                            className={cn(
                                "relative flex flex-col items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left",
                                formData.payment_type === 'rent' 
                                    ? "border-primary bg-primary/[0.03] ring-4 ring-primary/5" 
                                    : "border-border/50 bg-card hover:border-border hover:bg-muted/30"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center border",
                                formData.payment_type === 'rent' ? "bg-primary border-primary text-white" : "bg-muted border-border text-muted-foreground"
                            )}>
                                <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">Rent Payment</h3>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Allocate funds to your monthly property lease.</p>
                            </div>
                            {formData.payment_type === 'rent' && <div className="absolute top-4 right-4"><CheckCircle2 className="w-4 h-4 text-primary" /></div>}
                        </button>

                        <button
                            type="button"
                            onClick={() => setFormData((p: PaymentFormData) => ({ ...p, payment_type: 'utility' }))}
                            className={cn(
                                "relative flex flex-col items-start gap-4 p-5 rounded-2xl border-2 transition-all text-left",
                                formData.payment_type === 'utility' 
                                    ? "border-primary bg-primary/[0.03] ring-4 ring-primary/5" 
                                    : "border-border/50 bg-card hover:border-border hover:bg-muted/30"
                            )}
                        >
                            <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center border",
                                formData.payment_type === 'utility' ? "bg-primary border-primary text-white" : "bg-muted border-border text-muted-foreground"
                            )}>
                                <Receipt className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-foreground">Utility Bills</h3>
                                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">Settle electricity, water, or other provisioned services.</p>
                            </div>
                            {formData.payment_type === 'utility' && <div className="absolute top-4 right-4"><CheckCircle2 className="w-4 h-4 text-primary" /></div>}
                        </button>
                    </div>

                    {formData.payment_type === 'utility' && utilityBills && utilityBills.length > 0 && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-300">
                            <Label htmlFor="utility_bill_id" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Connect to Bill</Label>
                            <Select
                                value={formData.utility_bill_id?.toString() || ''}
                                onValueChange={(value) => {
                                    const bill = utilityBills.find(b => b.id.toString() === value);
                                    if (bill) {
                                        const outstanding = Number(bill.amount_due || 0) - Number(bill.amount_paid || 0);
                                        setFormData((prev: any) => ({ 
                                            ...prev, 
                                            utility_bill_id: parseInt(value),
                                            amount: outstanding > 0 ? outstanding : 0
                                        }));
                                    }
                                }}
                            >
                                <SelectTrigger className="h-12 rounded-xl bg-card border-border/50">
                                    <SelectValue placeholder="Select a pending service bill" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {utilityBills.map((bill) => (
                                        <SelectItem key={bill.id} value={bill.id.toString()}>
                                            <span className="font-medium">{bill.tenancy_utility.utility_type.name}</span>
                                            <span className="mx-2 text-muted-foreground">/</span>
                                            <span className="text-muted-foreground text-xs">{new Date(bill.billing_month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                                            <span className="ml-2 font-bold text-primary">{formatCurrency(bill.amount_due - bill.amount_paid)}</span>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.utility_bill_id && <p className="text-xs text-destructive ml-1">{errors.utility_bill_id}</p>}
                        </div>
                    )}
                </div>

                <hr className="border-border/50" />

                {/* 2. Amount Entry */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-4 ring-primary/5">2</div>
                        <h2 className="text-lg font-semibold tracking-tight">Transaction Value</h2>
                    </div>

                    <div className="bg-primary/[0.02] border rounded-3xl p-8 flex flex-col items-center gap-4">
                        <Label htmlFor="amount" className="text-xs font-semibold uppercase tracking-widest text-primary/70">Payment Amount (TZS)</Label>
                        <div className="relative w-full max-w-sm">
                            <Input
                                id="amount"
                                name="amount"
                                type="text"
                                inputMode="decimal"
                                value={formData.amount}
                                onChange={handleChange}
                                placeholder="0.00"
                                className="h-16 text-3xl font-bold text-center bg-transparent border-none focus-visible:ring-0 shadow-none p-0"
                            />
                            <div className="h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-2">
                            {formData.payment_type === 'rent' && pendingAmount > 0 && (
                                <Button variant="outline" size="sm" type="button" onClick={() => setFormData((p: PaymentFormData) => ({ ...p, amount: pendingAmount }))} className="h-7 text-[10px] rounded-full bg-white font-bold border-primary/20 hover:bg-primary/5">
                                    SET OUTSTANDING ({formatCurrency(pendingAmount)})
                                </Button>
                            )}
                            {tenancy && (
                                <Button variant="outline" size="sm" type="button" onClick={() => setFormData((p: PaymentFormData) => ({ ...p, amount: tenancy.monthly_rent }))} className="h-7 text-[10px] rounded-full bg-white font-bold border-primary/20 hover:bg-primary/5">
                                    SET MONTHLY RENT ({formatCurrency(tenancy.monthly_rent)})
                                </Button>
                            )}
                        </div>

                        {isOverpayment && (
                            <div className="mt-2 text-[11px] text-amber-600 bg-amber-500/5 px-4 py-2 rounded-full border border-amber-200/50 flex items-center gap-1.5 font-medium animate-in zoom-in-95">
                                <Info className="w-3 h-3" />
                                This exceeds your current balance. Extra will credit your advance account.
                            </div>
                        )}
                        {errors.amount && <p className="text-xs text-destructive font-bold">{errors.amount}</p>}
                    </div>
                </div>

                <hr className="border-border/50" />

                {/* 3. Payment Verification Details */}
                <div className="flex flex-col gap-6 font-semibold">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs ring-4 ring-primary/5">3</div>
                        <h2 className="text-lg font-semibold tracking-tight">Verification Proof</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="payment_method" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Channel</Label>
                            <Select
                                value={formData.payment_method}
                                onValueChange={handleMethodSelect}
                            >
                                <SelectTrigger className="h-12 rounded-xl bg-card border-border/50">
                                    <SelectValue placeholder="How did you pay?" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    <SelectItem value="mobile_money" className="py-3">
                                        <div className="flex items-center gap-2">
                                            <Smartphone className="w-4 h-4 text-primary" />
                                            <span>Mobile Money (MPesa, Tigopesa, etc.)</span>
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="bank_transfer" className="py-3">
                                        <div className="flex items-center gap-2">
                                            <Building2 className="w-4 h-4 text-primary" />
                                            <span>Bank Transfer / Deposit</span>
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            {errors.payment_method && <p className="text-xs text-destructive ml-1">{errors.payment_method}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reference_number" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Reference #</Label>
                            <div className="relative">
                                <Input
                                    id="reference_number"
                                    name="reference_number"
                                    value={formData.reference_number}
                                    onChange={handleChange}
                                    placeholder="Enter TXID / Ref Number"
                                    className="h-12 rounded-xl px-10 bg-card border-border/50"
                                />
                                <ShieldCheck className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                            </div>
                            <p className="text-[10px] text-muted-foreground ml-1 italic">As shown on your payment confirmation SMS/Slip.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes" className="text-xs font-semibold uppercase tracking-widest text-muted-foreground ml-1">Optional Memo</Label>
                        <Textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            placeholder="Example: 'Payment for partial rent and parking fee'..."
                            className="bg-card border-border/50 rounded-xl min-h-[100px] resize-none"
                        />
                    </div>
                </div>

            </div>

            {/* Sidebar Sticky Panel */}
            <div className="lg:col-span-5">
                <div className="sticky top-24 flex flex-col gap-6">
                    <Card className="shadow-2xl border-border/50 overflow-hidden rounded-3xl pointer-events-auto">
                        <CardHeader className="bg-primary text-white pb-8">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-white/80" />
                                Invoice Preview
                            </CardTitle>
                            <CardDescription className="text-white/70">Review your payment details before submitting</CardDescription>
                        </CardHeader>
                        <CardContent className="-mt-4 bg-card pt-6 rounded-t-3xl flex flex-col gap-6">
                            
                            <div className="flex flex-col items-center gap-1 py-4 border-b border-dashed">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Payable to Management</span>
                                <h3 className="text-4xl font-black text-foreground">{formatCurrency(Number(formData.amount) || 0)}</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center px-2">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Building2 className="w-4 h-4" />
                                        Category
                                    </div>
                                    <Badge variant="secondary" className="capitalize font-bold px-3 py-1 scale-110 origin-right rounded-full">{formData.payment_type}</Badge>
                                </div>

                                <div className="flex justify-between items-center px-2">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <Smartphone className="w-4 h-4" />
                                        Channel
                                    </div>
                                    <span className="font-bold text-foreground">
                                        {formData.payment_method === 'mobile_money' ? 'Mobile Money' : formData.payment_method === 'bank_transfer' ? 'Bank Wire' : '—'}
                                    </span>
                                </div>

                                <div className="flex justify-between items-center px-2">
                                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                        <FileText className="w-4 h-4" />
                                        Reference
                                    </div>
                                    <code className="bg-muted px-2 py-0.5 rounded text-[11px] font-mono text-foreground font-bold">{formData.reference_number || 'REQUIRED'}</code>
                                </div>
                            </div>

                            <div className="bg-muted/30 p-4 rounded-2xl flex gap-3 items-start border border-dashed border-border">
                                <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                                <div className="flex flex-col gap-0.5">
                                    <p className="text-[10px] font-bold text-foreground uppercase tracking-wider">Secure Logging</p>
                                    <p className="text-[10px] text-muted-foreground leading-relaxed">This record will be cross-referenced with bank/operator logs for verification.</p>
                                </div>
                            </div>

                        </CardContent>
                        <CardFooter className="flex flex-col gap-2 pt-2 pb-8 px-6">
                            <Button type="submit" className="w-full h-14 text-lg font-bold rounded-2xl shadow-xl shadow-primary/25 group">
                                Confirm Payment Record
                                <ChevronRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />
                            </Button>
                            <p className="text-[10px] text-center text-muted-foreground px-4">
                                By submitting, you affirm that the payment has been made via the selected channel and the reference provided is accurate.
                            </p>
                        </CardFooter>
                    </Card>

                    {/* Help Card */}
                    <div className="p-6 bg-muted/40 rounded-3xl border flex gap-4 items-start shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-10 h-10 rounded-2xl bg-white dark:bg-card border border-border flex items-center justify-center shrink-0 shadow-sm">
                            <Info className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-bold text-foreground">Payment Verification</p>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Our finance department validates all submitted logs within 2-4 business hours. If your balance doesn't update, please reach out via support.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </form>

        {/* Confirmation Modal */}
        <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
            <DialogContent className="sm:max-w-[400px] rounded-3xl p-8 gap-6 border-none overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
                <DialogHeader>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-2">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <DialogTitle className="text-2xl font-black">Verify Log Entry</DialogTitle>
                    <DialogDescription className="text-muted-foreground leading-relaxed">
                        Are you sure the reference <span className="font-mono font-bold text-foreground bg-muted px-1.5 rounded">{formData.reference_number}</span> is correct for this <span className="text-foreground font-bold">{formatCurrency(Number(formData.amount))}</span> payment?
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 pt-2">
                    <Button
                        onClick={handleVerify}
                        disabled={isSubmitting}
                        className="h-12 text-md font-bold rounded-xl shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? 'Processing Entry...' : 'Yes, Submit Log'}
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setShowConfirmation(false)}
                        className="h-12 font-bold rounded-xl"
                    >
                        Double Check
                    </Button>
                </div>
            </DialogContent>
        </Dialog>

    </main>
  );
}


MakePayment.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
