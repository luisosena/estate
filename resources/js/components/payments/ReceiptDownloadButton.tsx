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
      // Determine endpoint based on user role
      const isTenant = window.location.pathname.startsWith('/tenant');
      const endpoint = isTenant
        ? `/api/v1/tenant/payments/${paymentId}/receipt`
        : `/api/v1/landlord/payments/${paymentId}/receipt`;

      // Fetch PDF as blob
      const response = await fetch(endpoint, {
        credentials: 'include',
        headers: {
          'Accept': 'application/pdf, application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      // Check if response is actually a PDF or an error page
      const contentType = response.headers.get('Content-Type');
      
      if (!response.ok) {
        // Try to parse error as JSON, fallback to text
        let errorMessage = 'Failed to download receipt';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || `Error ${response.status}: Failed to download receipt`;
        } catch {
          // Not JSON, try text
          try {
            const errorText = await response.text();
            errorMessage = errorText.substring(0, 200) || `Error ${response.status}: Failed to download receipt`;
          } catch {
            errorMessage = `Error ${response.status}: Failed to download receipt`;
          }
        }
        throw new Error(errorMessage);
      }

      // Verify we got a PDF, not HTML error page
      if (contentType && !contentType.includes('application/pdf')) {
        // Likely got an error page instead of PDF
        const text = await response.text();
        console.error('Unexpected content type:', contentType, 'Response:', text.substring(0, 500));
        throw new Error('Server returned an error page instead of PDF. Please check authentication.');
      }

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get('Content-Disposition');
      const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
      const filename = filenameMatch?.[1] || `receipt-${paymentId}.pdf`;

      // Convert response to blob
      const blob = await response.blob();
      
      // Verify blob is actually a PDF (check magic bytes)
      const arrayBuffer = await blob.slice(0, 5).arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46; // %PDF
      
      if (!isPdf) {
        // Try to read as text for debugging
        const textBlob = await response.text();
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
