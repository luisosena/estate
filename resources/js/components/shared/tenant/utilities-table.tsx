import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';

export interface Utility {
    id: number;
    type: string;
    amount: number;
    billing_period: string;
    status: string;
}

interface UtilitiesTableProps {
    utilities?: Utility[];
}

const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'TZS',
        minimumFractionDigits: 0,
    }).format(amount);

const statusVariant = (
    status: string,
): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status.toLowerCase()) {
        case 'paid':
            return 'default';
        case 'pending':
            return 'secondary';
        case 'overdue':
            return 'destructive';
        default:
            return 'outline';
    }
};

export function UtilitiesTable({ utilities = [] }: UtilitiesTableProps) {
    return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Period</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {utilities.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="text-muted-foreground py-8 text-center text-sm"
                            >
                                No utilities recorded
                            </TableCell>
                        </TableRow>
                    ) : (
                        utilities.map((u) => (
                            <TableRow key={u.id}>
                                <TableCell className="font-medium capitalize">
                                    {u.type}
                                </TableCell>
                                <TableCell>{formatCurrency(u.amount)}</TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {u.billing_period}
                                </TableCell>
                                <TableCell>
                                    <Badge variant={statusVariant(u.status)}>
                                        {u.status}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
    );
}
