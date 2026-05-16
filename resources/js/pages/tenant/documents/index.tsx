import { Link } from '@inertiajs/react';
import { FileText, Download, Calendar, HardDrive, Tag, ArrowLeft, Home } from 'lucide-react';
import React from 'react';
import { route } from 'ziggy-js';

import AppLayout from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

const getCategoryBadge = (category: string) => {
  const variants: Record<string, string> = {
    tenancy_agreement: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    receipt: 'bg-green-500/10 text-green-600 border-green-500/20',
    inspection_photo: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    id_document: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    other: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  };

  const labels: Record<string, string> = {
    tenancy_agreement: 'Agreement',
    receipt: 'Receipt',
    inspection_photo: 'Inspection',
    id_document: 'ID Document',
    other: 'Other',
  };

  return (
    <Badge variant="secondary" className={`${variants[category] || variants.other}`}>
      {labels[category] || category}
    </Badge>
  );
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'tenancy_agreement':
      return <FileText className="h-5 w-5 text-blue-500" />;
    case 'receipt':
      return <FileText className="h-5 w-5 text-green-500" />;
    case 'inspection_photo':
      return <FileText className="h-5 w-5 text-purple-500" />;
    case 'id_document':
      return <FileText className="h-5 w-5 text-amber-500" />;
    default:
      return <FileText className="h-5 w-5 text-gray-500" />;
  }
};

export default function TenantDocuments({ tenancy, documents }: Props) {
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link
            href={route('tenant.dashboard')}
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">My Documents</h1>
          <p className="text-sm text-gray-500 mt-1">
            View and download your tenancy documents
          </p>
        </div>

        {tenancy && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Current Tenancy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Home className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tenancy.unit.property.name}</p>
                    <p className="text-xs text-gray-500">{tenancy.unit.unit_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tenancy.unit.unit_code}</p>
                    <p className="text-xs text-gray-500">Unit Code</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {tenancy.move_in_date ? formatDate(tenancy.move_in_date) : '—'}
                    </p>
                    <p className="text-xs text-gray-500">Move-in Date</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className={
                      tenancy.status === 'active'
                        ? 'bg-green-500/10 text-green-600 border-green-500/20'
                        : 'bg-gray-500/10 text-gray-600 border-gray-500/20'
                    }
                  >
                    {tenancy.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Documents ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {documents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(doc.category)}
                          <span className="font-medium">{doc.file_name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getCategoryBadge(doc.category)}</TableCell>
                      <TableCell className="text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <HardDrive className="h-3 w-3" />
                          {formatFileSize(doc.file_size)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-500">
                        {formatDate(doc.uploaded_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a
                            href={route('tenant.documents.download', { document: doc.id })}
                            className="inline-flex items-center"
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Download
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Your tenancy documents will appear here once uploaded by your landlord.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

TenantDocuments.layout = (page: React.ReactNode) => <AppLayout>{page}</AppLayout>;
