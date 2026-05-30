import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import CsvImportController from '@/actions/App/Http/Controllers/Web/Landlord/CsvImportController';

interface RowError {
  row: number;
  field: string;
  message: string;
}

interface CsvPreview {
  rows: Record<string, string>[];
  errors: RowError[];
  total_rows: number;
  valid_count: number;
  error_count: number;
  preview_token: string;
  original_filename: string;
}

interface Props {
  preview: CsvPreview;
}

export default function PreviewPage({ preview }: Props) {
  const [showAll, setShowAll] = useState(false);
  const form = useForm({
    preview_token: preview.preview_token,
    original_filename: preview.original_filename,
  });

  const confirm = () => {
    form.post(CsvImportController.store().url());
  };

  const displayRows = showAll ? preview.rows : preview.rows.slice(0, 20);

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
              <AlertTriangle className="w-3 h-3" />
              Review Import
            </Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Review Import
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review the parsed data before confirming the import.
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

      {/* Summary Bar */}
      <div className="flex items-center gap-4 text-sm">
        <span className="font-medium">{preview.total_rows} rows</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-green-600">{preview.valid_count} valid</span>
        <span className="text-muted-foreground">·</span>
        <span className="text-destructive">{preview.error_count} with errors</span>
      </div>

      {/* Error Panel */}
      {preview.error_count > 0 && (
        <Card className="border-destructive/50">
          <CardHeader className="bg-destructive/5">
            <CardTitle className="text-sm font-semibold text-destructive flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              {preview.error_count} rows have errors and will be skipped during import.
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Row</TableHead>
                    <TableHead className="text-xs">Field</TableHead>
                    <TableHead className="text-xs">Error</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.errors.map((error, idx) => (
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

      {/* Valid Rows Panel */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base font-semibold">
            Valid Rows ({preview.valid_count})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Row</TableHead>
                  <TableHead className="text-xs">Property</TableHead>
                  <TableHead className="text-xs">Unit</TableHead>
                  <TableHead className="text-xs">Tenant</TableHead>
                  <TableHead className="text-xs">Phone</TableHead>
                  <TableHead className="text-xs">Move-in</TableHead>
                  <TableHead className="text-xs">Rent</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayRows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="text-sm font-mono">{idx + 1}</TableCell>
                    <TableCell className="text-sm">{row.property_name}</TableCell>
                    <TableCell className="text-sm font-mono">{row.unit_code}</TableCell>
                    <TableCell className="text-sm">{row.tenant_full_name}</TableCell>
                    <TableCell className="text-sm font-mono">{row.tenant_phone}</TableCell>
                    <TableCell className="text-sm">{row.move_in_date}</TableCell>
                    <TableCell className="text-sm">{row.monthly_rent}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {preview.rows.length > 20 && (
            <div className="p-4 border-t text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-1" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-1" />
                    Show all {preview.rows.length} rows
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <Link href={CsvImportController.index().url()}>
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Re-upload
          </Button>
        </Link>

        <Button
          onClick={confirm}
          disabled={preview.valid_count === 0 || form.processing}
        >
          {form.processing
            ? 'Importing...'
            : `Import ${preview.valid_count} valid rows`}
        </Button>
      </div>
    </main>
  );
}

PreviewPage.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
