
import { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Save, Download } from 'lucide-react';
import { downloadPdf } from '@/utils/resumePdf';
import { toast } from '@/hooks/use-toast';

interface PdfPreviewDialogProps {
  isOpen: boolean;
  onClose: () => void;
  pdfBlob: Blob | null;
  resumeName: string;
}

export default function PdfPreviewDialog({ 
  isOpen, 
  onClose, 
  pdfBlob, 
  resumeName 
}: PdfPreviewDialogProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  
  // Create URL for the blob
  useEffect(() => {
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      
      // Cleanup function
      return () => {
        URL.revokeObjectURL(url);
      };
    }
  }, [pdfBlob]);

  const handleDownload = () => {
    if (pdfBlob) {
      downloadPdf(pdfBlob, `${resumeName || 'resume'}.pdf`);
      toast({
        title: "Resume Downloaded",
        description: "Your resume has been downloaded successfully.",
      });
      onClose();
    }
  };

  if (!pdfBlob) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Resume Preview</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto my-4 border rounded-md">
          {pdfUrl ? (
            <iframe 
              src={pdfUrl} 
              className="w-full h-[60vh]" 
              title="Resume PDF Preview"
            />
          ) : (
            <div className="flex items-center justify-center h-[60vh]">
              Loading preview...
            </div>
          )}
        </div>
        
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleDownload} className="gap-2">
            <Download className="h-4 w-4" /> Save as PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
