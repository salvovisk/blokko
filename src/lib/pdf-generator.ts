import { jsPDF } from 'jspdf';
import type {
  Block,
  HeaderBlockData,
  PricesBlockData,
  TextBlockData,
  TermsBlockData,
  FaqBlockData,
  TableBlockData,
  TimelineBlockData,
  ContactBlockData,
  DiscountBlockData,
  PaymentBlockData,
  SignatureBlockData
} from '@/types/blocks';

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

      case 'FAQ': {
        const data = block.data as FaqBlockData;
        checkPageBreak(20);

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(data.title || 'FAQ', margin, yPosition);
        yPosition += 7;

        // FAQ items
        (data.faqs || []).forEach((faq, index) => {
          checkPageBreak(15);

          // Question
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          const questionPrefix = data.showNumbering ? `Q${index + 1}: ` : '';
          const questionHeight = addText(questionPrefix + faq.question, margin, yPosition, contentWidth, 10);
          yPosition += questionHeight + 2;

          // Answer
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          const answerHeight = addText(faq.answer, margin + 5, yPosition, contentWidth - 5, 9);
          yPosition += answerHeight + 5;
        });

        yPosition += 5;
        break;
      }

      case 'TABLE': {
        const data = block.data as TableBlockData;
        if (data.headers.length === 0) break;

        checkPageBreak(20);

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(data.title || 'Table', margin, yPosition);
        yPosition += 7;

        const colWidth = contentWidth / data.headers.length;
        const tableTop = yPosition;

        // Header row
        doc.setFillColor(0, 0, 0);
        doc.rect(margin, yPosition, contentWidth, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);

        data.headers.forEach((header, i) => {
          const x = margin + i * colWidth + 2;
          doc.text(header, x, yPosition + 5, { align: data.alignment[i] || 'left', maxWidth: colWidth - 4 });
        });
        yPosition += 7;

        // Data rows
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        data.rows.forEach((row, rowIndex) => {
          if (rowIndex % 2 === 0) {
            doc.setFillColor(245, 245, 245);
            doc.rect(margin, yPosition, contentWidth, 6, 'F');
          }

          row.forEach((cell, i) => {
            const x = margin + i * colWidth + 2;
            doc.text(cell, x, yPosition + 4, { align: data.alignment[i] || 'left', maxWidth: colWidth - 4 });
          });
          yPosition += 6;
        });

        // Table border
        if (data.showBorders) {
          doc.setLineWidth(0.3);
          doc.rect(margin, tableTop, contentWidth, yPosition - tableTop);
        }

        yPosition += 5;
        break;
      }

      case 'TIMELINE': {
        const data = block.data as TimelineBlockData;
        checkPageBreak(20);

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(data.title || 'Timeline', margin, yPosition);
        yPosition += 7;

        // Start date
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Start: ${data.startDate}`, margin, yPosition);
        yPosition += 6;

        // Milestones
        (data.milestones || []).forEach((milestone) => {
          checkPageBreak(15);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(`• ${milestone.phase}`, margin + 2, yPosition);
          yPosition += 5;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(`Duration: ${milestone.duration}`, margin + 5, yPosition);
          if (milestone.dueDate) {
            doc.text(`Due: ${milestone.dueDate}`, margin + 50, yPosition);
          }
          yPosition += 5;

          if (milestone.deliverables) {
            const delivHeight = addText(`Deliverables: ${milestone.deliverables}`, margin + 5, yPosition, contentWidth - 5, 9);
            yPosition += delivHeight + 3;
          }
        });

        // Notes
        if (data.notes) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          const notesHeight = addText(`Note: ${data.notes}`, margin, yPosition, contentWidth, 8);
          yPosition += notesHeight + 5;
        }

        yPosition += 5;
        break;
      }

      case 'CONTACT': {
        const data = block.data as ContactBlockData;
        checkPageBreak(20);

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(data.title || 'Contacts', margin, yPosition);
        yPosition += 7;

        // Contacts
        (data.contacts || []).forEach((contact) => {
          checkPageBreak(12);

          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text(contact.name, margin, yPosition);
          yPosition += 5;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(contact.role, margin, yPosition);
          yPosition += 4;

          doc.text(`Email: ${contact.email}`, margin, yPosition);
          if (contact.phone) {
            doc.text(`Phone: ${contact.phone}`, margin + 60, yPosition);
          }
          yPosition += 4;

          if (contact.bio) {
            const bioHeight = addText(contact.bio, margin, yPosition, contentWidth, 8);
            yPosition += bioHeight + 2;
          }

          yPosition += 4;
        });

        yPosition += 5;
        break;
      }

      case 'DISCOUNT': {
        const data = block.data as DiscountBlockData;
        checkPageBreak(25);

        // Draw bordered box for discount
        const boxTop = yPosition;
        doc.setLineWidth(1);
        doc.setDrawColor(0, 0, 0);

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        yPosition += 8;
        doc.text(data.title || 'Special Offer', margin + 5, yPosition);
        yPosition += 7;

        // Discount value
        doc.setFontSize(20);
        const discountText = data.offerType === 'percentage' ? `${data.discountValue}% OFF` : `$${data.discountValue} OFF`;
        doc.text(discountText, margin + 5, yPosition);
        yPosition += 10;

        // Description
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const descHeight = addText(data.description, margin + 5, yPosition, contentWidth - 10, 10);
        yPosition += descHeight + 5;

        // Valid until
        if (data.validUntil) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(9);
          doc.text(`Valid Until: ${data.validUntil}`, margin + 5, yPosition);
          yPosition += 5;
        }

        // Conditions
        if (data.conditions && data.conditions.length > 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(8);
          data.conditions.forEach((condition) => {
            doc.text(`• ${condition}`, margin + 5, yPosition);
            yPosition += 4;
          });
        }

        yPosition += 5;
        doc.rect(margin, boxTop, contentWidth, yPosition - boxTop);
        yPosition += 5;
        break;
      }

      case 'PAYMENT': {
        const data = block.data as PaymentBlockData;
        checkPageBreak(20);

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(data.title || 'Payment Terms', margin, yPosition);
        yPosition += 7;

        // Payment schedule
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Payment Schedule:', margin, yPosition);
        yPosition += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        (data.schedule || []).forEach((payment) => {
          doc.text(`• ${payment.milestone}`, margin + 2, yPosition);
          doc.text(`${payment.percentage}%`, margin + 100, yPosition);
          yPosition += 5;
        });

        yPosition += 3;

        // Banking info
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.text('Banking Information:', margin, yPosition);
        yPosition += 6;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Account Name: ${data.bankingInfo.accountName}`, margin + 2, yPosition);
        yPosition += 4;
        doc.text(`Account Number: ${data.bankingInfo.accountNumber}`, margin + 2, yPosition);
        yPosition += 4;
        doc.text(`Routing Number: ${data.bankingInfo.routingNumber}`, margin + 2, yPosition);
        yPosition += 4;
        if (data.bankingInfo.swiftCode) {
          doc.text(`SWIFT Code: ${data.bankingInfo.swiftCode}`, margin + 2, yPosition);
          yPosition += 4;
        }

        yPosition += 3;

        // Accepted methods
        if (data.acceptedMethods && data.acceptedMethods.length > 0) {
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(10);
          doc.text('Accepted Payment Methods:', margin, yPosition);
          yPosition += 6;

          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.text(data.acceptedMethods.join(', '), margin + 2, yPosition);
          yPosition += 5;
        }

        // Notes
        if (data.notes) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          const notesHeight = addText(`Note: ${data.notes}`, margin, yPosition, contentWidth, 8);
          yPosition += notesHeight + 5;
        }

        yPosition += 5;
        break;
      }

      case 'SIGNATURE': {
        const data = block.data as SignatureBlockData;
        checkPageBreak(40);

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(12);
        doc.text(data.title || 'Signature', margin, yPosition);
        yPosition += 7;

        // Approval text
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        const approvalHeight = addText(data.approvalText, margin, yPosition, contentWidth, 9);
        yPosition += approvalHeight + 10;

        // Signature lines
        const sigWidth = data.showCompanySignature ? (contentWidth - 10) / 2 : contentWidth - 20;
        const leftX = margin;
        const rightX = margin + sigWidth + 10;

        // Client signature
        doc.setLineWidth(0.5);
        doc.line(leftX, yPosition, leftX + sigWidth, yPosition);
        yPosition += 5;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.text(data.signatureLabel, leftX, yPosition);

        // Company signature (if enabled)
        if (data.showCompanySignature) {
          doc.setLineWidth(0.5);
          doc.line(rightX, yPosition - 5, rightX + sigWidth, yPosition - 5);
          doc.text('Company Signature', rightX, yPosition);
        }

        yPosition += 10;

        // Date lines
        doc.setLineWidth(0.5);
        doc.line(leftX, yPosition, leftX + 40, yPosition);
        yPosition += 5;
        doc.text(data.dateLabel, leftX, yPosition);

        if (data.showCompanySignature) {
          doc.setLineWidth(0.5);
          doc.line(rightX, yPosition - 5, rightX + 40, yPosition - 5);
          doc.text('Date', rightX, yPosition);
        }

        yPosition += 10;
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
