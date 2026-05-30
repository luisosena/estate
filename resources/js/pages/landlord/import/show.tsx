import { Link } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, FileText, Building2, Home, Users, UserCheck, UserPlus } from 'lucide-react';
import React from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CsvImportController from '@/actions/App/Http/Controllers/Web/Landlord/CsvImportController';

interface CsvImportBatch {
  id: number;
  original_filename: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  total_rows: number;
  processed_rows: number;
  created_rows: number;
  failed_rows: number;
  row_errors: { row: number; field: string; message: string }[] | null;
  import_summary: { properties: number; units: number; tenants: number; tenancies: number; users: number } | null;
  completed_at: string | null;
  created_at: string;
}

interface Props {
  batch: CsvImportBatch;
}

const statusConfig = (batch: CsvImportBatch) => {
  if (batch.status === 'failed') {
    return {
      color: 'bg-destructive/10 border-destructive/50',
      icon: <XCircle className="w-5 h-5 text-destructive" />,
      title: 'Import Failed',
      description: 'No records were created.',
      badge: 'destructive' as const,
    };
  }

  if (batch.failed_rows > 0) {
    return {
      color: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-950/30 dark:border-yellow-800',
      icon: <AlertTriangle className="w-5 h-5 text-yellow-600" />,
      title: 'Import Completed with Errors',
      description: `${batch.created_rows} records created, ${batch.failed_rows} rows had errors.`,
      badge: 'secondary' as const,
    };
  }

  return {
    color: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
    icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    title: 'Import Successful',
    description: `All ${batch.created_rows} records created successfully.`,
    badge: 'default' as const,
  };
};

const summaryCards = [
  { key: 'properties', label: 'Properties Created', icon: Building2 },
  { key: 'units', label: 'Units Created', icon: Home },
  { key: 'tenants', label: 'Tenants Created', icon: Users },
  { key: 'tenancies', label: 'Tenancies Created', icon: UserCheck },
  { key: 'users', label: 'Portal Accounts Created', icon: UserPlus },
] as const;

export default function ShowPage({ batch }: Props) {
  const config = statusConfig(batch);

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
              <FileText className="w-3 h-3" />
              Import Report
            </Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Import Report
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Results for &quot;{batch.original_filename}&quot;
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link href={CsvImportController.index().url()}>
            <Button variant="outline" className="bg-card border-border/50 shadow-sm hidden sm:flex">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Import
            </Button>
          </Link>
        </div>
      </header>

      {/* Status Banner */}
      <div className={`rounded-lg border p-4 flex items-center gap-3 ${config.color}`}>
        {config.icon}
        <div>
          <p className="font-semibold">{config.title}</p>
          <p className="text-sm text-muted-foreground">{config.description}</p>
        </div>
      </div>

      {/* Summary Cards */}
      {batch.import_summary && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {summaryCards.map(({ key, label, icon: Icon }) => (
            <Card key={key}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{batch.import_summary[key]}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error Table */}
      {batch.row_errors && batch.row_errors.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="text-base font-semibold">Import Errors</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Row</TableHead>
                    <TableHead className="text-xs">Field</TableHead>
                    <TableHead className="text-xs">Message</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batch.row_errors.map((error, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="text-sm font-mono">{error.row}</TableCell>
                      <TableCell className="text-sm font-mono">{error.field}</TableCell>
                      <TableCell className="text-sm text-destructive">{error.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-end">
        <Link href={CsvImportController.index().url()}>
          <Button>
            Run Another Import
          </Button>
        </Link>
      </div>
    </main>
  );
}

ShowPage.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
