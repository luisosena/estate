import { Link } from '@inertiajs/react';
import { FileText, Download, Calendar, HardDrive, Tag, ArrowLeft, Home, ArrowRight } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { formatDate } from '@/lib/formatters';

interface Document {
  id: number;
  file_name: string;
  file_type: string;
  file_size: number;
  category: string;
  uploaded_at: string;
}

interface Tenancy {
  id: number;
  status: string;
  move_in_date: string | null;
  unit: {
    id: number;
    unit_name: string;
    unit_code: string;
    property: {
      id: number;
      name: string;
      address: string;
    };
  };
}

interface Props {
  tenancy: Tenancy | null;
  documents: Document[];
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getCategoryBadge = (category: string) => {
  const variants: Record<string, string> = {
    tenancy_agreement: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    receipt: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    inspection_photo: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
    id_document: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    other: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
  };

  const labels: Record<string, string> = {
    tenancy_agreement: 'Agreement',
    receipt: 'Receipt',
    inspection_photo: 'Inspection',
    id_document: 'ID Document',
    other: 'Other',
  };

  return (
    <Badge variant="secondary" className={cn(variants[category] || variants.other)}>
      {labels[category] || category}
    </Badge>
  );
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'tenancy_agreement':
      return <FileText className="h-5 w-5 text-blue-500" />;
    case 'receipt':
      return <FileText className="h-5 w-5 text-emerald-500" />;
    case 'inspection_photo':
      return <FileText className="h-5 w-5 text-purple-500" />;
    case 'id_document':
      return <FileText className="h-5 w-5 text-amber-500" />;
    default:
      return <FileText className="h-5 w-5 text-muted-foreground" />;
  }
};

export default function TenantDocuments({ tenancy, documents }: Props) {
  return (
    <AppLayout>
      <main className="max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 pb-12">
        {/* Header Section */}
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <SidebarTrigger className="-ml-2 md:hidden" />
              <Badge variant="outline" className="text-xs bg-card font-medium text-muted-foreground border-border/50 flex gap-1.5 items-center">
                <FileText className="w-3 h-3" />
                Documents
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              My Documents
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and download your tenancy documents
            </p>
          </div>

          {tenancy && (
            <Button asChild variant="outline" className="bg-card border-border/50 shadow-sm hover:bg-accent">
              <Link href={route('tenant.dashboard')}>
                <ArrowLeft className="w-4 h-4 mr-2 text-muted-foreground" />
                Back to Dashboard
              </Link>
            </Button>
          )}
        </header>

        {/* Tenancy Info */}
        {tenancy && (
          <>
            <Separator />
            <section>
              <h2 className="text-lg font-semibold tracking-tight mb-4">Current Tenancy</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-card shadow-sm border-border/50">
                  <CardContent className="px-5 py-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Home className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tenancy.unit.property.name}</p>
                      <p className="text-xs text-muted-foreground">{tenancy.unit.unit_name}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card shadow-sm border-border/50">
                  <CardContent className="px-5 py-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Tag className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tenancy.unit.unit_code}</p>
                      <p className="text-xs text-muted-foreground">Unit Code</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card shadow-sm border-border/50">
                  <CardContent className="px-5 py-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Calendar className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {tenancy.move_in_date ? formatDate(tenancy.move_in_date) : '—'}
                      </p>
                      <p className="text-xs text-muted-foreground">Move-in Date</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card shadow-sm border-border/50">
                  <CardContent className="px-5 py-4 flex items-center gap-3">
                    <div className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      tenancy.status === 'active' ? 'bg-emerald-500/10' : 'bg-gray-500/10'
                    )}>
                      <div className={cn(
                        "h-2.5 w-2.5 rounded-full",
                        tenancy.status === 'active' ? 'bg-emerald-500' : 'bg-gray-500'
                      )} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground capitalize">{tenancy.status}</p>
                      <p className="text-xs text-muted-foreground">Status</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </section>
          </>
        )}

        {/* Documents List */}
        <Separator />
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold tracking-tight">
              Documents <span className="text-muted-foreground font-normal">({documents.length})</span>
            </h2>
          </div>

          {documents.length > 0 ? (
            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
              {documents.map((doc, index) => (
                <div
                  key={doc.id}
                  className={cn(
                    "flex items-center gap-4 p-4 transition-colors hover:bg-muted/50",
                    index !== documents.length - 1 && "border-b border-border/50"
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    {getCategoryIcon(doc.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{doc.file_name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {getCategoryBadge(doc.category)}
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <HardDrive className="h-3 w-3" />
                        {formatFileSize(doc.file_size)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {formatDate(doc.uploaded_at)}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      asChild
                      className="bg-card border-border/50 shadow-sm hover:bg-accent"
                    >
                      <a href={route('tenant.documents.download', { document: doc.id })}>
                        <Download className="h-4 w-4 mr-1.5 text-muted-foreground" />
                        Download
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-card rounded-xl border border-border/50 shadow-sm">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-3 text-sm font-medium text-foreground">No documents</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Your tenancy documents will appear here once uploaded by your landlord.
              </p>
            </div>
          )}
        </section>
      </main>
    </AppLayout>
  );
}
