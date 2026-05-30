import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, FileText, Upload, AlertCircle, CheckCircle2, Clock, XCircle } from 'lucide-react';
import React, { useRef, useState } from 'react';

import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
  batches: {
    data: CsvImportBatch[];
    current_page: number;
    last_page: number;
    total: number;
    links: Array<{ url: string | null; label: string; active: boolean }>;
  };
}

const statusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (status) {
    case 'completed':
      return 'default';
    case 'failed':
      return 'destructive';
    case 'processing':
      return 'secondary';
    case 'pending':
      return 'outline';
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
  const form = useForm({ csv_file: null as File | null });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      form.setData('csv_file', file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.post(CsvImportController.preview().url(), { forceFormData: true });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
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
          <Link href="/landlord/tenants">
            <Button variant="outline" className="bg-card border-border/50 shadow-sm hidden sm:flex">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tenants
            </Button>
          </Link>
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
                href={CsvImportController.template().url()}
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
                className="border-2 border-dashed border-border/50 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                {selectedFile ? (
                  <div>
                    <p className="text-sm font-medium">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium">Click to select a CSV file</p>
                    <p className="text-xs text-muted-foreground">Maximum file size: 5 MB</p>
                  </div>
                )}
              </div>

              {form.errors.csv_file && (
                <p className="text-sm text-destructive mt-2">{form.errors.csv_file}</p>
              )}

              <Button
                type="submit"
                className="w-full mt-4"
                disabled={!selectedFile || form.processing}
              >
                {form.processing ? 'Processing...' : 'Preview Import'}
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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
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
                        <TableCell className="text-xs font-mono">{col}</TableCell>
                        <TableCell className="text-xs">
                          {required === 'Yes' ? (
                            <Badge variant="default" className="text-[10px]">Required</Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px]">Optional</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{desc}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="rounded-lg bg-muted/50 p-4 text-sm space-y-2">
                <p className="font-medium">Tips:</p>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
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
            <div className="py-12 text-center text-sm text-muted-foreground">
              No imports yet. Upload your first CSV to get started.
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
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.data.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{batch.original_filename}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(batch.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(batch.status)} className="flex items-center gap-1 w-fit">
                          {statusIcon(batch.status)}
                          {batch.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {batch.created_rows} / {batch.total_rows}
                      </TableCell>
                      <TableCell className="text-sm">
                        {batch.failed_rows > 0 ? (
                          <span className="text-destructive">{batch.failed_rows}</span>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link href={CsvImportController.show(batch.id).url()}>
                          <Button variant="outline" size="sm" className="text-xs">
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}

ImportIndex.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
