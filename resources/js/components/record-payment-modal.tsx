import { router } from '@inertiajs/react';
import { AlertCircle, Check, ChevronLeft, ChevronRight, Loader2, Plus, X } from 'lucide-react';
import React, { useState, useMemo } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export interface OutstandingRentBill {
    id: number;
    billing_month: string;
    billing_month_label: string;
    amount_due: number;
    amount_paid: number;
    outstanding: number;
    status: string;
}

interface RecordPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    tenant: { full_name: string; tenant_code: string };
    tenancy: { id: number; monthly_rent: number };
    outstandingRentBills: OutstandingRentBill[];
    monthlyRent: number;
}

type Step = 'select' | 'details' | 'confirm';

interface AllocationEntry {
    id: number;
    label: string;
    outstanding: number;
    allocated: number;
    isOverpayment: boolean;
    overpaymentAmount: number;
    isCreated: boolean;
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0,
    }).format(amount);
}

function computeAllocation(
    bills: { id: number; label: string; outstanding: number; isCreated: boolean }[],
    totalAmount: number,
): AllocationEntry[] {
    let remaining = totalAmount;
    return bills.map((bill, index) => {
        const outstanding = Number(bill.outstanding) || 0;
        const allocated = Math.min(remaining, outstanding);
        remaining -= allocated;
        const isLast = index === bills.length - 1;
        const finalAllocated = isLast ? allocated + remaining : allocated;
        return {
            ...bill,
            allocated: finalAllocated,
            isOverpayment: finalAllocated > outstanding,
            overpaymentAmount: Math.max(0, finalAllocated - outstanding),
        };
    });
}

export default function RecordPaymentModal({
    isOpen,
    onClose,
    tenant,
    tenancy,
    outstandingRentBills,
    monthlyRent,
}: RecordPaymentModalProps) {
    const [step, setStep] = useState<Step>('select');
    const [selectedBillIds, setSelectedBillIds] = useState<number[]>([]);
    const [additionalMonths, setAdditionalMonths] = useState<string[]>([]);
    const [newMonth, setNewMonth] = useState('');
    const [amount, setAmount] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<'mobile_money' | 'bank_transfer'>('mobile_money');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const resetState = () => {
        setStep('select');
        setSelectedBillIds([]);
        setAdditionalMonths([]);
        setNewMonth('');
        setAmount('');
        setPaymentMethod('mobile_money');
        setReferenceNumber('');
        setNotes('');
        setIsSubmitting(false);
        setErrors({});
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const selectedBills = useMemo(() => {
        const bills: { id: number; label: string; outstanding: number; isCreated: boolean; sortKey: string }[] = [];

        // Existing bills
        for (const bill of outstandingRentBills) {
            if (selectedBillIds.includes(bill.id)) {
                bills.push({
                    id: bill.id,
                    label: bill.billing_month_label,
                    outstanding: Number(bill.outstanding) || 0,
                    isCreated: false,
                    sortKey: bill.billing_month,
                });
            }
        }

        // Additional months (will be created)
        for (let i = 0; i < additionalMonths.length; i++) {
            const month = additionalMonths[i];
            const date = new Date(month + '-01');
            const label = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            bills.push({
                id: -(i + 1),
                label: `${label} (will be created)`,
                outstanding: Number(monthlyRent) || 0,
                isCreated: true,
                sortKey: month,
            });
        }

        // Sort by date
        bills.sort((a, b) => (a.sortKey < b.sortKey ? -1 : 1));

        return bills;
    }, [selectedBillIds, additionalMonths, outstandingRentBills, monthlyRent]);

    const totalOutstanding = useMemo(
        () => selectedBills.reduce((sum, b) => sum + (Number(b.outstanding) || 0), 0),
        [selectedBills],
    );

    const allocations = useMemo(() => {
        const parsedAmount = parseFloat(amount) || 0;
        if (parsedAmount <= 0 || selectedBills.length === 0) return [];
        return computeAllocation(selectedBills, parsedAmount);
    }, [selectedBills, amount]);

    const hasOverpayment = allocations.some((a) => a.isOverpayment);

    const handleAddMonth = () => {
        if (!newMonth) return;
        // Check if already in additional months
        if (additionalMonths.includes(newMonth)) return;
        // Check if an existing bill already covers this month
        const existingBill = outstandingRentBills.find((b) => b.billing_month === newMonth);
        if (existingBill) {
            // Auto-select the existing bill instead
            if (!selectedBillIds.includes(existingBill.id)) {
                setSelectedBillIds([...selectedBillIds, existingBill.id]);
            }
            setNewMonth('');
            return;
        }
        setAdditionalMonths([...additionalMonths, newMonth]);
        setNewMonth('');
    };

    const handleRemoveMonth = (month: string) => {
        setAdditionalMonths(additionalMonths.filter((m) => m !== month));
    };

    const handleToggleBill = (billId: number) => {
        setSelectedBillIds((prev) =>
            prev.includes(billId) ? prev.filter((id) => id !== billId) : [...prev, billId],
        );
    };

    const canProceedFromSelect = selectedBillIds.length > 0 || additionalMonths.length > 0;

    const handleProceedToDetails = () => {
        // Auto-suggest amount
        if (!amount) {
            setAmount(totalOutstanding.toString());
        }
        setStep('details');
    };

    const handleProceedToConfirm = () => {
        const newErrors: Record<string, string> = {};
        const parsedAmount = parseFloat(amount);
        if (!parsedAmount || parsedAmount < 1) {
            newErrors.amount = 'Please enter a valid amount.';
        }
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setErrors({});
        setStep('confirm');
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setErrors({});

        router.post(
            `/landlord/tenants/${tenant.tenant_code}/record-payment`,
            {
                amount: parseFloat(amount),
                payment_method: paymentMethod,
                rent_bill_ids: selectedBillIds,
                billing_months: additionalMonths,
                reference_number: referenceNumber || null,
                notes: notes || null,
            },
            {
                onSuccess: () => {
                    handleClose();
                },
                onError: (errs) => {
                    setErrors(errs as Record<string, string>);
                    setIsSubmitting(false);
                },
                onFinish: () => setIsSubmitting(false),
            },
        );
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
            pending: 'secondary',
            partial: 'outline',
            overdue: 'destructive',
            paid: 'default',
        };
        return (
            <Badge variant={variants[status] || 'secondary'} className="text-xs">
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {step === 'select' && 'Select Bills'}
                        {step === 'details' && 'Payment Details'}
                        {step === 'confirm' && 'Confirm Payment'}
                    </DialogTitle>
                    <DialogDescription>
                        Recording payment for {tenant.full_name}
                    </DialogDescription>
                </DialogHeader>

                {/* Step 1: Select Bills */}
                {step === 'select' && (
                    <div className="space-y-4">
                        {outstandingRentBills.length > 0 && (
                            <div className="space-y-2">
                                <Label className="text-sm font-medium">Outstanding Rent Bills</Label>
                                <div className="space-y-1 border rounded-md">
                                    {outstandingRentBills.map((bill) => (
                                        <div
                                            key={bill.id}
                                            className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                                            onClick={() => handleToggleBill(bill.id)}
                                        >
                                            <Checkbox
                                                checked={selectedBillIds.includes(bill.id)}
                                                onCheckedChange={() => handleToggleBill(bill.id)}
                                            />
                                            <div className="flex-1 flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium text-sm">
                                                        {bill.billing_month_label}
                                                    </span>
                                                    {getStatusBadge(bill.status)}
                                                </div>
                                                <div className="text-sm text-right">
                                                    <div>{formatCurrency(bill.outstanding)}</div>
                                                    {bill.amount_paid > 0 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {formatCurrency(bill.amount_paid)} paid of {formatCurrency(bill.amount_due)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {outstandingRentBills.length === 0 && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    No outstanding rent bills found. Add a billing month below to create one.
                                </AlertDescription>
                            </Alert>
                        )}

                        <Separator />

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Add Billing Month</Label>
                            <div className="flex gap-2">
                                <Input
                                    type="month"
                                    value={newMonth}
                                    onChange={(e) => setNewMonth(e.target.value)}
                                    className="flex-1"
                                />
                                <Button
                                    variant="outline"
                                    onClick={handleAddMonth}
                                    disabled={!newMonth}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Add
                                </Button>
                            </div>
                            {additionalMonths.length > 0 && (
                                <div className="space-y-1 mt-2">
                                    {additionalMonths.map((month) => {
                                        const date = new Date(month + '-01');
                                        const label = date.toLocaleDateString('en-US', {
                                            month: 'short',
                                            year: 'numeric',
                                        });
                                        return (
                                            <div
                                                key={month}
                                                className="flex items-center justify-between p-2 bg-muted/50 rounded"
                                            >
                                                <span className="text-sm">
                                                    {label}{' '}
                                                    <span className="text-muted-foreground">
                                                        (will be created)
                                                    </span>
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleRemoveMonth(month)}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Payment Details */}
                {step === 'details' && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount (TZS)</Label>
                            <Input
                                id="amount"
                                type="number"
                                min="1"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                            />
                            {errors.amount && (
                                <p className="text-sm text-destructive">{errors.amount}</p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Total outstanding: {formatCurrency(totalOutstanding)}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Payment Method</Label>
                            <ToggleGroup
                                type="single"
                                value={paymentMethod}
                                onValueChange={(val) => {
                                    if (val) setPaymentMethod(val as 'mobile_money' | 'bank_transfer');
                                }}
                                variant="outline"
                                className="justify-start"
                            >
                                <ToggleGroupItem value="mobile_money">
                                    Mobile Money
                                </ToggleGroupItem>
                                <ToggleGroupItem value="bank_transfer">
                                    Bank Transfer
                                </ToggleGroupItem>
                            </ToggleGroup>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reference">Reference Number (optional)</Label>
                            <Input
                                id="reference"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                                placeholder="Transaction reference"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (optional)</Label>
                            <Textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Any additional notes..."
                                rows={3}
                            />
                        </div>

                        {errors.rent_bill_ids && (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>{errors.rent_bill_ids}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 'confirm' && (
                    <div className="space-y-4">
                        <div className="rounded-md border p-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Tenant</span>
                                <span className="font-medium">{tenant.full_name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-medium">{formatCurrency(parseFloat(amount) || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Method</span>
                                <span className="font-medium">
                                    {paymentMethod === 'mobile_money' ? 'Mobile Money' : 'Bank Transfer'}
                                </span>
                            </div>
                            {referenceNumber && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Reference</span>
                                    <span>{referenceNumber}</span>
                                </div>
                            )}
                        </div>

                        <Separator />

                        <div className="space-y-2">
                            <Label className="text-sm font-medium">Allocation Breakdown</Label>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Bill</TableHead>
                                        <TableHead className="text-right">Allocated</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allocations.map((alloc) => (
                                        <TableRow key={alloc.id}>
                                            <TableCell className="font-medium text-sm">
                                                {alloc.label}
                                            </TableCell>
                                            <TableCell className="text-right text-sm">
                                                {formatCurrency(alloc.allocated)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {alloc.isOverpayment ? (
                                                    <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-600">
                                                        Overpaid by {formatCurrency(alloc.overpaymentAmount)}
                                                    </Badge>
                                                ) : alloc.allocated >= alloc.outstanding ? (
                                                    <Badge variant="default" className="text-xs">
                                                        <Check className="h-3 w-3 mr-1" />
                                                        Fully paid
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="text-xs">
                                                        Partial ({formatCurrency(alloc.outstanding - alloc.allocated)} remaining)
                                                    </Badge>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {hasOverpayment && (
                            <Alert>
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Overpayment detected: the last bill will receive more than its outstanding amount.
                                    This is allowed and will be recorded.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}

                <DialogFooter className="gap-2 sm:gap-0">
                    {step === 'select' && (
                        <>
                            <Button variant="outline" onClick={handleClose}>
                                Cancel
                            </Button>
                            <Button onClick={handleProceedToDetails} disabled={!canProceedFromSelect}>
                                Continue
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </>
                    )}
                    {step === 'details' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('select')}>
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Back
                            </Button>
                            <Button onClick={handleProceedToConfirm}>
                                Review
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Button>
                        </>
                    )}
                    {step === 'confirm' && (
                        <>
                            <Button variant="outline" onClick={() => setStep('details')}>
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                Edit Entry
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                                Confirm & Record
                            </Button>
                        </>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
