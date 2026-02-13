import { jsPDF } from 'jspdf';
import type { Block, HeaderBlockData, PricesBlockData, TextBlockData, TermsBlockData } from '@/types/blocks';

export interface PDFOptions {
  title: string;
  blocks: Block[];
}

export function generatePDF(options: PDFOptions): Blob {
  const { title, blocks } = options;

  // Create PDF in A4 format
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let yPosition = margin;

  // Helper function to check if we need a new page
  const checkPageBreak = (requiredSpace: number) => {
    if (yPosition + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPosition = margin;
      return true;
    }
    return false;
  };

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * (fontSize * 0.35277778); // Convert font size to mm height
  };

  // Render each block
  blocks.forEach((block, blockIndex) => {
    // Add some space between blocks (except first block)
    if (blockIndex > 0) {
      yPosition += 10;
    }

    switch (block.type) {
      case 'HEADER': {
        const data = block.data as HeaderBlockData;
        checkPageBreak(60);

        // Company Name - Bold, Large
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(18);
        doc.text(data.companyName || 'Company Name', margin, yPosition);
        yPosition += 8;

        // Company details
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        if (data.companyAddress) {
          doc.text(data.companyAddress, margin, yPosition);
          yPosition += 4;
        }
        if (data.companyPhone) {
          doc.text(`Tel: ${data.companyPhone}`, margin, yPosition);
          yPosition += 4;
        }
        if (data.companyEmail) {
          doc.text(`Email: ${data.companyEmail}`, margin, yPosition);
          yPosition += 4;
        }

        yPosition += 8;

        // Horizontal line
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;

        // Quote details and client info side by side
        const leftCol = margin;
        const rightCol = pageWidth / 2 + 10;

        // Left column - Quote details
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('QUOTE', leftCol, yPosition);
        yPosition += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Number: ${data.quoteNumber}`, leftCol, yPosition);
        doc.text(`Date: ${data.date}`, leftCol, yPosition + 4);
        if (data.validUntil) {
          doc.text(`Valid Until: ${data.validUntil}`, leftCol, yPosition + 8);
        }

        // Right column - Client info
        const clientY = yPosition - 6;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('CLIENT', rightCol, clientY);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(data.clientName || 'Client Name', rightCol, clientY + 6);
        if (data.clientAddress) {
          doc.text(data.clientAddress, rightCol, clientY + 10);
        }
        if (data.clientEmail) {
          doc.text(data.clientEmail, rightCol, clientY + 14);
        }

        yPosition += (data.validUntil ? 12 : 8) + 8;
        break;
      }

      case 'PRICES': {
        const data = block.data as PricesBlockData;
        const items = data.items || [];

        if (items.length === 0) break;

        checkPageBreak(40 + items.length * 8);

        // Table header
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('ITEMS', margin, yPosition);
        yPosition += 6;

        // Table border
        const tableTop = yPosition;
        doc.setLineWidth(0.3);

        // Header row
        doc.setFillColor(0, 0, 0);
        doc.rect(margin, yPosition, contentWidth, 7, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);

        const descCol = margin + 2;
        const qtyCol = pageWidth - margin - 60;
        const priceCol = pageWidth - margin - 40;
        const totalCol = pageWidth - margin - 20;

        doc.text('Description', descCol, yPosition + 5);
        doc.text('Qty', qtyCol, yPosition + 5);
        doc.text('Price', priceCol, yPosition + 5);
        doc.text('Total', totalCol, yPosition + 5);
        yPosition += 7;

        // Table items
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');

        items.forEach((item, index) => {
          // Alternate row colors
          if (index % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, yPosition, contentWidth, 6, 'F');
          }

          doc.text(item.description || '', descCol, yPosition + 4);
          doc.text(String(item.quantity || 0), qtyCol, yPosition + 4);
          doc.text(`${data.currency} ${(item.price || 0).toFixed(2)}`, priceCol, yPosition + 4);
          doc.text(`${data.currency} ${(item.total || 0).toFixed(2)}`, totalCol, yPosition + 4);
          yPosition += 6;
        });

        // Table border
        doc.setLineWidth(0.3);
        doc.rect(margin, tableTop, contentWidth, yPosition - tableTop);

        yPosition += 4;

        // Totals section
        const totalsX = pageWidth - margin - 60;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        doc.text('Subtotal:', totalsX, yPosition);
        doc.text(`${data.currency} ${(data.subtotal || 0).toFixed(2)}`, totalsX + 30, yPosition);
        yPosition += 5;

        if (data.showTax) {
          doc.text(`Tax (${data.taxRate}%):`, totalsX, yPosition);
          doc.text(`${data.currency} ${(data.tax || 0).toFixed(2)}`, totalsX + 30, yPosition);
          yPosition += 5;
        }

        // Total - Bold
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text('TOTAL:', totalsX, yPosition);
        doc.text(`${data.currency} ${(data.total || 0).toFixed(2)}`, totalsX + 30, yPosition);
        yPosition += 10;
        break;
      }

      case 'TEXT': {
        const data = block.data as TextBlockData;
        checkPageBreak(20);

        // Title if present
        if (data.title) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text(data.title, margin, yPosition);
          yPosition += 7;
        }

        // Content
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const textHeight = addText(data.content || '', margin, yPosition, contentWidth, 10);
        yPosition += textHeight + 5;
        break;
      }

      case 'TERMS': {
        const data = block.data as TermsBlockData;
        checkPageBreak(20 + (data.terms?.length || 0) * 6);

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(data.title || 'Terms & Conditions', margin, yPosition);
        yPosition += 7;

        // Terms list
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);

        (data.terms || []).forEach((term) => {
          const bulletX = margin + 2;
          const textX = margin + 7;

          doc.text('•', bulletX, yPosition);
          const textHeight = addText(term, textX, yPosition, contentWidth - 7, 9);
          yPosition += Math.max(textHeight, 5);
        });

        yPosition += 5;
        break;
      }
    }
  });

  // Footer on last page
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  const footerText = `Generated on ${new Date().toLocaleDateString()} - ${title}`;
  const footerWidth = doc.getTextWidth(footerText);
  doc.text(footerText, (pageWidth - footerWidth) / 2, pageHeight - 10);

  // Convert to blob
  return doc.output('blob');
}

export function downloadPDF(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getPDFDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
