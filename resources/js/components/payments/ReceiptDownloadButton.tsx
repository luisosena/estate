import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

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
      // Determine endpoint based on user role
      const isTenant = window.location.pathname.startsWith('/tenant');
      const endpoint = isTenant
        ? `/api/v1/tenant/payments/${paymentId}/receipt`
        : `/api/v1/landlord/payments/${paymentId}/receipt`;

      // Fetch PDF as blob using axios to ensure proper session/CSRF handling
      const response = await axios.get(endpoint, {
        responseType: 'blob',
        withCredentials: true,
        headers: {
          'Accept': 'application/pdf, application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      // Verify we got a PDF, not HTML error page
      const contentType = response.headers['content-type'] || response.headers['Content-Type'];
      if (contentType && !contentType.includes('application/pdf')) {
        const text = await response.data.text();
        console.error('Unexpected content type:', contentType, 'Response:', text.substring(0, 500));
        throw new Error('Server returned an error page instead of PDF. Please check authentication.');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `receipt-${paymentId}.pdf`;

      const blob = response.data;
      
      // Verify blob is actually a PDF (check magic bytes)
      const arrayBuffer = await blob.slice(0, 5).arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // %PDF
      
      if (!isPdf) {
        // Try to read as text for debugging
        const textBlob = await blob.text();
        console.error('Response is not a valid PDF. First 500 chars:', textBlob.substring(0, 500));
        throw new Error('Downloaded file is not a valid PDF. The server may have returned an error page.');
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Receipt downloaded successfully');
    } catch (error: any) {
      console.error('Receipt download failed:', error);
      
      let errorMessage = 'Failed to download receipt';
      if (error.response?.data instanceof Blob) {
        // Try to read the blob as text for error message
        try {
          const text = await error.response.data.text();
          const json = JSON.parse(text);
          errorMessage = json.message || json.error || errorMessage;
        } catch (e) {
          errorMessage = error.message;
        }
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
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
