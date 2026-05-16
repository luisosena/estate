import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ReceiptDownloadButtonProps {
  paymentId: number;
  paymentStatus: 'paid' | 'partial' | 'pending' | 'overdue' | 'cancelled';
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function ReceiptDownloadButton({
  paymentId,
  paymentStatus,
  variant = 'outline',
  size = 'sm',
  className,
}: ReceiptDownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Only show for paid or partial payments
  const canDownload = ['paid', 'partial'].includes(paymentStatus);

  const handleDownload = async () => {
    if (!canDownload) {
      toast.error('Receipt only available for completed payments');
      return;
    }

    setIsLoading(true);

    try {
      // Use web routes (session-authenticated) instead of api routes,
      // which avoids Sanctum stateful domain matching issues in production.
      const isTenant = window.location.pathname.startsWith('/tenant');
      const endpoint = isTenant
        ? `/tenant/payments/${paymentId}/receipt`
        : `/landlord/payments/${paymentId}/receipt`;

      const response = await fetch(endpoint, {
        credentials: 'same-origin',
        headers: {
          Accept: 'application/pdf, application/json',
        },
      });

      if (!response.ok) {
        let errorMessage = 'Failed to download receipt';
        try {
          const data = await response.json();
          errorMessage = data.message || data.error || errorMessage;
        } catch {
          errorMessage = `Error ${response.status}: Failed to download receipt`;
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType && !contentType.includes('application/pdf')) {
        const text = await response.text();
        console.error('Unexpected content type:', contentType, text.substring(0, 500));
        throw new Error('Server returned unexpected content instead of PDF.');
      }

      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `receipt-${paymentId}.pdf`;

      const blob = await response.blob();

      // Trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Receipt downloaded successfully');
    } catch (error) {
      console.error('Receipt download failed:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to download receipt');
    } finally {
      setIsLoading(false);
    }
  };

  if (!canDownload) {
    return (
      <Button variant="ghost" size={size} disabled className={className}>
        <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
        <span className="text-muted-foreground">No Receipt</span>
      </Button>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleDownload}
      disabled={isLoading}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <FileText className="h-4 w-4 mr-2" />
      )}
      {isLoading ? 'Downloading...' : 'Receipt'}
    </Button>
  );
}
