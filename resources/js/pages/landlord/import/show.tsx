import { Link, usePage } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, AlertTriangle, XCircle, FileText, Building2, Home, Users, UserCheck, UserPlus, Calendar, AlertCircle } from 'lucide-react';
import React from 'react';

import CsvImportController from '@/actions/App/Http/Controllers/Web/Landlord/CsvImportController';
import AppLayout from '@/components/layout/AppLayout';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { type SharedData } from '@/types';

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
      color: 'bg-warning/10 border-warning/20',
      icon: <AlertTriangle className="w-5 h-5 text-warning" />,
      title: 'Import Completed with Errors',
      description: `${batch.created_rows} records created, ${batch.failed_rows} rows had errors.`,
      badge: 'secondary' as const,
    };
  }

  return {
    color: 'bg-success/10 border-success/20',
    icon: <CheckCircle2 className="w-5 h-5 text-success" />,
    title: 'Import Successful',
    description: `All ${batch.created_rows} records created successfully.`,
    badge: 'default' as const,
  };
};

const summaryCards = [
  { key: 'properties', label: 'Properties Created', subLabel: 'Added to portfolio', icon: Building2 },
  { key: 'units', label: 'Units Created', subLabel: 'Available units listed', icon: Home },
  { key: 'tenants', label: 'Tenants Created', subLabel: 'Registered profiles', icon: Users },
  { key: 'tenancies', label: 'Tenancies Created', subLabel: 'Active leases mapped', icon: UserCheck },
  { key: 'users', label: 'Portal Accounts Created', subLabel: 'Logins generated', icon: UserPlus },
] as const;

export default function ShowPage({ batch }: Props) {
  const config = statusConfig(batch);
  const { flash } = usePage<SharedData>().props;

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
      {flash?.success && (
        <Alert className="border-success/20 bg-success/10 text-success">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertTitle>Import Complete</AlertTitle>
          <AlertDescription>{flash.success}</AlertDescription>
        </Alert>
      )}

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
          <Button asChild variant="outline" className="bg-card border-border/50 shadow-sm hidden sm:flex">
            <Link href={CsvImportController.index().url}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Import
            </Link>
          </Button>
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
          {summaryCards.map(({ key, label, subLabel, icon: Icon }) => (
            <Card key={key} className="bg-card border-border/50 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-semibold text-muted-foreground">{label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight text-foreground">{batch.import_summary?.[key] ?? 0}</div>
                <p className="text-xs text-muted-foreground mt-1">{subLabel}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Error Table */}
      {batch.row_errors && batch.row_errors.length > 0 && (
        <Card>
          <CardHeader className="border-b bg-muted/10">
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
                      <TableCell className="text-sm font-mono text-muted-foreground">{error.row}</TableCell>
                      <TableCell className="text-sm font-mono font-medium">{error.field}</TableCell>
                      <TableCell className="text-sm text-destructive">{error.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="p-4 border-t bg-muted/20 text-xs text-muted-foreground flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <p>
                Fix these rows in your CSV file and run a new import. Successfully imported rows will not be duplicated (units with active tenancies are skipped).
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metadata Footer Card */}
      <Card className="bg-muted/10 border-border/50">
        <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 shrink-0" />
            <span>File Name: <strong>{batch.original_filename}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 shrink-0" />
            <span>Import Date: <strong>{new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(batch.created_at))}</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-primary" />
            <span>Processed Rows: <strong>{batch.processed_rows} / {batch.total_rows}</strong></span>
          </div>
        </CardContent>
      </Card>

      {/* Action Footer Call to Action */}
      <Card className="border-primary/20 bg-primary/5 dark:bg-primary/5 text-center p-8">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold">Continue Importing?</CardTitle>
          <CardDescription>
            If you have more portfolios or tenants to migrate, upload another CSV file using the template.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 flex justify-center">
          <Button asChild size="lg" className="font-semibold shadow-sm">
            <Link href={CsvImportController.index().url}>
              Run Another Import
            </Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

ShowPage.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
