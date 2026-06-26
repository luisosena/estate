import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, AlertTriangle, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';

import CsvImportController from '@/actions/App/Http/Controllers/Web/Landlord/CsvImportController';
import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
    form.post(CsvImportController.store().url);
  };

  // Row numbers in errors are 1-based; rows array is 0-indexed.
  const errorRowNumbers = new Set(preview.errors.map((e) => e.row));
  const rowsWithIndex: (Record<string, string | number> & { originalIndex: number })[] = preview.rows.map((row, idx) => ({
    ...row,
    originalIndex: idx + 1,
  }));
  const validRows = rowsWithIndex.filter((row) => !errorRowNumbers.has(row.originalIndex));

  const displayRows = showAll ? validRows : validRows.slice(0, 20);

  // Group errors by row
  const groupedErrors = preview.errors.reduce<Record<number, RowError[]>>((acc, error) => {
    if (!acc[error.row]) {
      acc[error.row] = [];
    }
    acc[error.row].push(error);
    return acc;
  }, {});

  const errorRows = Object.keys(groupedErrors)
    .map(Number)
    .sort((a, b) => a - b);

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
          <Button asChild variant="outline" className="bg-card border-border/50 shadow-sm hidden sm:flex">
            <Link href={CsvImportController.index().url}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Import
            </Link>
          </Button>
        </div>
      </header>

      {/* Summary Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border bg-card text-card-foreground text-xs font-semibold shadow-sm">
          <span className="text-muted-foreground">Total Rows:</span>
          <span>{preview.total_rows}</span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-success/20 bg-success/10 text-success text-xs font-semibold shadow-sm">
          <CheckCircle2 className="w-3.5 h-3.5 text-success" />
          <span>{validRows.length} Valid</span>
        </div>
        {preview.error_count > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-destructive/20 bg-destructive/10 text-destructive text-xs font-semibold shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
            <span>{preview.error_count} Errors</span>
          </div>
        )}
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
                  {errorRows.map((rowNum) => {
                    const rowErrors = groupedErrors[rowNum];
                    return rowErrors.map((error, idx) => (
                      <TableRow key={`${rowNum}-${idx}`} className={idx === 0 ? "border-t border-border/50" : "border-none"}>
                        {idx === 0 && (
                          <TableCell className="text-sm font-mono font-medium align-top bg-muted/20" rowSpan={rowErrors.length}>
                            {rowNum}
                          </TableCell>
                        )}
                        <TableCell className="text-sm font-mono align-top py-2.5">{error.field}</TableCell>
                        <TableCell className="text-sm text-destructive align-top py-2.5">{error.message}</TableCell>
                      </TableRow>
                    ));
                  })}
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
            Valid Rows ({validRows.length})
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
                {displayRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground text-sm">
                      No valid rows to import.
                    </TableCell>
                  </TableRow>
                ) : (
                  displayRows.map((row) => (
                    <TableRow key={row.originalIndex}>
                      <TableCell className="text-sm font-mono text-muted-foreground">{row.originalIndex}</TableCell>
                      <TableCell className="text-sm font-medium">{row.property_name}</TableCell>
                      <TableCell className="text-sm font-mono">{row.unit_code}</TableCell>
                      <TableCell className="text-sm">{row.tenant_full_name}</TableCell>
                      <TableCell className="text-sm font-mono">{row.tenant_phone}</TableCell>
                      <TableCell className="text-sm">{row.move_in_date}</TableCell>
                      <TableCell className="text-sm font-medium">{row.monthly_rent}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {validRows.length > 20 && (
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
                    Show all {validRows.length} rows
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <Button asChild variant="outline">
          <Link href={CsvImportController.index().url}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Re-upload
          </Link>
        </Button>

        <Button
          onClick={confirm}
          disabled={validRows.length === 0 || form.processing}
        >
          {form.processing
            ? 'Importing...'
            : preview.error_count > 0
            ? `Import ${validRows.length} of ${preview.total_rows} rows (skip ${preview.error_count} errors)`
            : `Import all ${preview.total_rows} rows`}
        </Button>
      </div>
    </main>
  );
}

PreviewPage.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
