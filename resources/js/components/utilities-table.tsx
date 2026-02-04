import {
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
interface DataTableSimpleProps {
    data: Array<{ id: number; header: string; type: string; status: string }>;
}
export function UtilitiesTable() {
    return (
        <div className="box-content w-fit rounded-xl border border-gray-500">
            <Table className="dark:bg-gray-00 w-80 overflow-hidden rounded-xl">
                <TableHeader>
                    <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Period</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableRow>
                        <TableCell>Type 1</TableCell>
                        <TableCell>Status 1</TableCell>
                        <TableCell>Period 1</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Type 2</TableCell>
                        <TableCell>Status 2</TableCell>
                        <TableCell>Period 2</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Type 3</TableCell>
                        <TableCell>Status 3</TableCell>
                        <TableCell>Period 3</TableCell>
                    </TableRow>
                </TableBody>
                <TableFooter></TableFooter>
            </Table>
        </div>
    );
}
