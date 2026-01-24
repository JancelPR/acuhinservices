import { ReceiptData } from '../types';
import { CURRENCY } from '../constants';

export const downloadAsCSV = (transaction: ReceiptData, setOpenDownloadMenu: (id: string | null) => void) => {
    const csvContent = [
      ['Transaction ID', 'Date', 'Item Name', 'Quantity', 'Unit Price', 'Total Price'],
      ...transaction.items.map(item => [
        transaction.id,
        transaction.date,
        item.name,
        item.quantity.toString(),
        item.price.toString(),
        (item.price * item.quantity).toString()
      ]),
      ['', '', '', '', 'Total:', transaction.total.toString()],
      ...(transaction.payment ? [['', '', '', '', 'Payment:', transaction.payment.toFixed(2)]] : []),
      ...(transaction.change !== undefined ? [['', '', '', '', 'Change:', transaction.change.toFixed(2)]] : [])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transaction-${transaction.id}.csv`;
    link.click();
    setOpenDownloadMenu(null);
  };

  export const downloadAsPDF = (transaction: ReceiptData, setOpenDownloadMenu: (id: string | null) => void) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Transaction ${transaction.id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .total { font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Transaction Receipt</h1>
          <p style="text-align: center; font-size: 12px; margin-bottom: 5px;">Prk. 2 Brgy. Palaka, Valladolid, Negros Occidental</p>
          <p><strong>Transaction ID:</strong> ${transaction.id}</p>
          <p><strong>Date:</strong> ${transaction.date}</p>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${transaction.items.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${CURRENCY}${item.price}</td>
                  <td>${CURRENCY}${item.price * item.quantity}</td>
                </tr>
              `).join('')}
            </tbody>
            <tfoot>
              <tr class="total">
                <td colspan="3">Total</td>
                <td>${CURRENCY}${transaction.total}</td>
              </tr>
              ${transaction.payment ? `
                <tr>
                  <td colspan="3">Payment</td>
                  <td>${CURRENCY}${transaction.payment.toFixed(2)}</td>
                </tr>
              ` : ''}
              ${transaction.change !== undefined ? `
                <tr>
                  <td colspan="3">Change</td>
                  <td>${CURRENCY}${transaction.change.toFixed(2)}</td>
                </tr>
              ` : ''}
            </tfoot>
          </table>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
    setOpenDownloadMenu(null);
  };

  export const downloadAsDOC = (transaction: ReceiptData, setOpenDownloadMenu: (id: string | null) => void) => {
    const docContent = `
Transaction Receipt

Transaction ID: ${transaction.id}
Date: ${transaction.date}

Items:
${transaction.items.map(item => 
  `- ${item.name} x ${item.quantity} @ ${CURRENCY}${item.price} = ${CURRENCY}${item.price * item.quantity}`
).join('\n')}

Total: ${CURRENCY}${transaction.total}
${transaction.payment ? `Payment: ${CURRENCY}${transaction.payment.toFixed(2)}\n` : ''}${transaction.change !== undefined ? `Change: ${CURRENCY}${transaction.change.toFixed(2)}\n` : ''}
    `.trim();

    const blob = new Blob([docContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transaction-${transaction.id}.doc`;
    link.click();
    setOpenDownloadMenu(null);
  };
