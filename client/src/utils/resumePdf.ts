
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export async function generateResumePdf(
  resumeElement: HTMLElement, 
  fileName: string = 'resume.pdf'
): Promise<Blob> {
  // Create a canvas from the resume element
  const canvas = await html2canvas(resumeElement, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    logging: false,
  });

  // Calculate dimensions for A4 size (210mm x 297mm)
  const imgWidth = 210;
  const pageHeight = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
  // Initialize PDF document
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  // Add the canvas as an image to the PDF
  pdf.addImage(
    canvas.toDataURL('image/png'), 
    'PNG', 
    0, 
    0, 
    imgWidth, 
    imgHeight
  );

  // Create and return blob
  return pdf.output('blob');
}

export function downloadPdf(blob: Blob, fileName: string = 'resume.pdf'): void {
  // Create a URL for the blob
  const url = URL.createObjectURL(blob);
  
  // Create a link element
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  
  // Append to the document, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Revoke the URL to free up memory
  URL.revokeObjectURL(url);
}
