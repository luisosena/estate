import { Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, FileText, Upload, AlertCircle, CheckCircle2, Clock, XCircle, Loader2 } from 'lucide-react';
import React, { useRef, useState } from 'react';

import CsvImportController from '@/actions/App/Http/Controllers/Web/Landlord/CsvImportController';
import AppLayout from '@/components/layout/AppLayout';
import Pagination from '@/components/shared/Pagination';
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
  batches: {
    data: CsvImportBatch[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
}

const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'failed':
      return 'destructive';
    case 'processing':
      return 'secondary';
    case 'pending':
      return 'outline';
    case 'cancelled':
    default:
      return 'outline';
  }
};

const statusIcon = (status: string) => {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="w-3 h-3" />;
    case 'failed':
      return <XCircle className="w-3 h-3" />;
    case 'processing':
      return <Clock className="w-3 h-3" />;
    default:
      return <AlertCircle className="w-3 h-3" />;
  }
};

export default function ImportIndex({ batches }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const form = useForm({ csv_file: null as File | null });
  const { flash } = usePage<SharedData>().props;

  const validateAndSetFile = (file: File) => {
    setValidationError(null);
    form.clearErrors();

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setValidationError('Please select a valid CSV file (.csv format only).');
      setSelectedFile(null);
      form.setData('csv_file', null);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setValidationError('File size exceeds the 5 MB limit.');
      setSelectedFile(null);
      form.setData('csv_file', null);
      return;
    }

    setSelectedFile(file);
    form.setData('csv_file', file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    form.post(CsvImportController.preview().url, { forceFormData: true });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDateTime = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(new Date(dateStr));
  };

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
      {flash?.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Import Error</AlertTitle>
          <AlertDescription>{flash.error}</AlertDescription>
        </Alert>
      )}

      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
              <Upload className="w-3 h-3" />
              Bulk Import
            </Badge>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Bulk Import
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Import tenants, units, and properties from a CSV file.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild variant="outline" className="bg-card border-border/50 shadow-sm hidden sm:flex">
            <Link href="/landlord/tenants">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tenants
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upload CSV File</CardTitle>
            <CardDescription>
              Select a CSV file to import.{' '}
              <a
                href={CsvImportController.template().url}
                download
                className="text-primary underline underline-offset-4"
              >
                Download template
              </a>{' '}
              for the correct format.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                  isDragging
                    ? 'border-primary bg-primary/5 scale-[0.99] shadow-sm'
                    : validationError
                    ? 'border-destructive bg-destructive/5'
                    : 'border-border/50 hover:border-primary/50 hover:bg-muted/10'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload className={`w-10 h-10 mx-auto mb-3 transition-colors ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                {selectedFile ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold flex items-center justify-center gap-1.5">
                      <FileText className="w-4 h-4 text-primary" />
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-medium">{formatFileSize(selectedFile.size)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold">Click or drag CSV file here to upload</p>
                    <p className="text-xs text-muted-foreground mt-1">Maximum file size: 5 MB</p>
                  </div>
                )}
              </div>

              {validationError && (
                <p className="text-sm text-destructive mt-2 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {validationError}
                </p>
              )}

              {form.errors.csv_file && (
                <p className="text-sm text-destructive mt-2 font-medium flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {form.errors.csv_file}
                </p>
              )}

              <Button
                type="submit"
                className="w-full mt-4 font-semibold"
                disabled={!selectedFile || form.processing}
              >
                {form.processing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing file...
                  </>
                ) : (
                  'Preview Import'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Instructions Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">CSV Format Guide</CardTitle>
            <CardDescription>
              Your CSV file must follow this column structure (17 columns).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto border rounded-md">
                <Table>
                  <TableHeader className="sticky top-0 bg-card z-10">
                    <TableRow>
                      <TableHead className="text-xs">Column</TableHead>
                      <TableHead className="text-xs">Required</TableHead>
                      <TableHead className="text-xs">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ['property_name', 'Yes', 'Existing property name or new'],
                      ['property_address', 'Yes', 'Address (new properties only)'],
                      ['property_city', 'Yes', 'City (new properties only)'],
                      ['property_state', 'No', 'State/County'],
                      ['property_type', 'No', 'apartment, house, commercial, mixed'],
                      ['unit_code', 'Yes', 'Unique within property'],
                      ['unit_name', 'Yes', 'Unit display name'],
                      ['tenant_full_name', 'Yes', 'Full name'],
                      ['tenant_email', 'No', 'For portal account creation'],
                      ['tenant_phone', 'Yes', 'Phone number'],
                      ['emergency_contact_name', 'Yes', 'Contact name'],
                      ['emergency_contact_phone', 'Yes', 'Contact phone'],
                      ['emergency_contact_relation', 'Yes', 'Relationship'],
                      ['move_in_date', 'Yes', 'YYYY-MM-DD format'],
                      ['monthly_rent', 'Yes', 'Rent amount'],
                      ['security_deposit', 'No', 'Deposit amount (default: 0)'],
                      ['rent_due_day', 'No', 'Day 1-28 (default: 1)'],
                    ].map(([col, required, desc]) => (
                      <TableRow key={col}>
                        <TableCell className="text-xs font-mono font-medium">{col}</TableCell>
                        <TableCell className="text-xs">
                          {required === 'Yes' ? (
                            <Badge variant="default" className="text-[10px] px-1.5 py-0">Required</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground border-dashed">Optional</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground leading-normal">{desc}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="rounded-lg bg-muted/40 border p-4 text-sm space-y-2">
                <p className="font-semibold text-foreground flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Tips for Success
                </p>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1.5 leading-relaxed">
                  <li>Phone numbers: include country code, e.g. +254712345678</li>
                  <li>Property names are matched case-insensitively</li>
                  <li>Existing properties are reused; new ones are created</li>
                  <li>Units with active tenancies will be flagged as errors</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch History */}
      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base font-semibold">Import History</CardTitle>
          <CardDescription>Your recent CSV imports.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {batches.data.length === 0 ? (
            <div className="py-16 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
              <FileText className="w-8 h-8 text-muted-foreground/50" />
              <span>No imports yet. Upload your first CSV to get started.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created / Total</TableHead>
                    <TableHead>Failed</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.data.map((batch) => (
                    <TableRow key={batch.id} className="hover:bg-muted/20">
                      <TableCell className="max-w-[200px] truncate">
                        <div className="flex items-center gap-2 font-medium">
                          <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate" title={batch.original_filename}>{batch.original_filename}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDateTime(batch.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getStatusVariant(batch.status)} className={`gap-1 ${batch.status === 'processing' ? 'animate-pulse' : ''}`}>
                          {statusIcon(batch.status)}
                          <span className="capitalize">{batch.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-semibold">
                        {batch.created_rows} / {batch.total_rows}
                      </TableCell>
                      <TableCell className="text-sm">
                        {batch.failed_rows > 0 ? (
                          <span className="text-destructive font-semibold bg-destructive/10 border border-destructive/20 px-2 py-0.5 rounded-md">{batch.failed_rows}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild variant="outline" size="sm" className="text-xs h-8 bg-card border-border/50 hover:bg-accent">
                          <Link href={CsvImportController.show(batch.id).url}>
                            View
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {batches.links && batches.links.length > 3 && (
                <div className="p-4 border-t flex justify-end">
                  <Pagination links={batches.links} />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

ImportIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
