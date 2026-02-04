
import { Invoice } from '../types';

export const downloadInvoicePDF = (invoice: Invoice) => {
  // Create a printable window
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice #${invoice.id}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; margin-bottom: 40px; }
          .logo { font-size: 24px; font-weight: bold; color: #f97316; }
          .invoice-title { font-size: 32px; font-weight: bold; color: #333; }
          .details { margin-bottom: 40px; }
          .table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .table th { text-align: left; border-bottom: 2px solid #eee; padding: 10px 0; color: #888; font-size: 12px; text-transform: uppercase; }
          .table td { padding: 15px 0; border-bottom: 1px solid #eee; }
          .total-section { text-align: right; }
          .total-row { font-size: 14px; margin-bottom: 5px; color: #666; }
          .final-total { font-size: 24px; font-weight: bold; margin-top: 10px; color: #f97316; }
          .footer { margin-top: 60px; text-align: center; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">ZOLVER</div>
          <div class="invoice-title">INVOICE</div>
        </div>

        <div class="details">
          <p><strong>Date:</strong> ${new Date(invoice.date).toLocaleDateString()}</p>
          <p><strong>Invoice #:</strong> ${invoice.id}</p>
          <p><strong>Billed To:</strong> ${invoice.client.name}</p>
          <p><strong>Service Provider:</strong> ${invoice.issuer.legalName}</p>
        </div>

        <table class="table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map(item => `
              <tr>
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>€ ${item.unitPrice.toFixed(2)}</td>
                <td>€ ${item.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">Subtotal: € ${invoice.subtotalHT.toFixed(2)}</div>
          <div class="total-row">VAT (17%): € ${invoice.totalVAT.toFixed(2)}</div>
          <div class="final-total">Total: € ${invoice.totalTTC.toFixed(2)}</div>
        </div>

        <div class="footer">
          <p>Thank you for using Zolver!</p>
          <p>Payment Method: ${invoice.paymentMethod || 'N/A'}</p>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.focus();

  // Wait for content to load then print
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
};

export const createInvoiceObject = (pro: any, clientName: string, job: any, price: number): Invoice => {
  return {
    id: `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
    date: new Date().toISOString(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    issuer: pro.companyDetails || {
      legalName: pro.name,
      legalType: 'independant',
      vatNumber: 'N/A',
      address: 'Luxembourg',
      licenseNumber: 'N/A', // Added missing required props
      licenseExpiry: 'N/A',
      iban: 'N/A'
    },
    client: {
      name: clientName,
      address: job.location?.locality || (typeof job.location === 'string' ? job.location : "Luxembourg"),
    },
    items: [{
      description: job.title,
      quantity: 1,
      unitPrice: price,
      vatRate: 17,
      total: price
    }],
    subtotalHT: price / 1.17,
    totalVAT: price * (1 - 1 / 1.17),
    totalTTC: price,
    status: 'PENDING',
    language: 'EN'
  };
};
