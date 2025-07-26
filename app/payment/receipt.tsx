import { View } from 'react-native';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { Asset } from 'expo-asset';

interface ReceiptData {
  orderNumber?: string;
  orderType: 'food' | 'laundry' | 'delivery';
  orderDate: string;
  orderItems?: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  deliveryFee?: number;
  requireDelivery?: 'delivery' | 'pickup';
  total: number;
  riderName?: string;
  riderPhone?: string;
  deliveryId?: string;
  origin?: string;
  destination?: string;
}

export const createReceiptHTML = (data: ReceiptData) => {
  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-NG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Function to truncate long text
  const truncateText = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            padding: 8px;
            background-color: #f7f7f7;
            height: 100vh;
            overflow-y: auto;
          }
          
          .receipt {
            width: 100%;
            max-width: 380px;
            margin: 0 auto;
            background-color: white;
            border-radius: 12px;
            padding: 16px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            min-height: 100%;
          }
          
          .header {
            text-align: center;
            margin-bottom: 16px;
            padding-bottom: 16px;
            border-bottom: 1px dashed #e0e0e0;
          }

          .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 12px;
            display: block;
          }
          
          .title {
            font-size: 20px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 8px;
          }
          
          .order-info {
            font-size: 14px;
            color: #666;
            margin-bottom: 4px;
          }
          
          .items-container {
            max-height: 60vh;
            overflow-y: auto;
            margin: 16px 0;
            padding-right: 8px;
          }

          .items-container::-webkit-scrollbar {
            width: 4px;
          }

          .items-container::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 4px;
          }

          .items-container::-webkit-scrollbar-thumb {
            background: #888;
            border-radius: 4px;
          }

          .items-container::-webkit-scrollbar-thumb:hover {
            background: #555;
          }
          
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 16px 0;
            font-size: 14px;
          }
          
          .items-table th {
            text-align: left;
            padding: 8px 4px;
            border-bottom: 2px solid #eee;
            color: #666;
          }
          
          .items-table td {
            padding: 8px 4px;
            border-bottom: 1px solid #eee;
          }
          
          .delivery-info {
            background-color: #f8f9fa;
            border-radius: 8px;
            padding: 12px;
            margin: 16px 0;
            font-size: 14px;
          }
          
          .delivery-info p {
            margin: 4px 0;
            color: #4a4a4a;
            word-wrap: break-word;
            overflow-wrap: break-word;
            max-width: 100%;
          }

          .address-info {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .address-label {
            font-weight: 600;
            color: #666;
            font-size: 13px;
          }

          .address-value {
            color: #4a4a4a;
            font-size: 13px;
            line-height: 1.4;
          }
          
          .total-section {
            margin-top: 16px;
            padding-top: 16px;
            border-top: 1px dashed #e0e0e0;
          }
          
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 14px;
          }
          
          .grand-total {
            font-size: 16px;
            font-weight: 600;
            margin-top: 8px;
            padding-top: 8px;
            border-top: 2px solid #eee;
          }
          
          .footer {
            margin-top: 24px;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <img src="file://android_asset/images/android-icon.png" class="logo" alt="ServiPal Logo" />
            <div class="title">ServiPal</div>
            <div class="order-info">Order #${data.orderNumber}</div>
            <div class="order-info">${formatDate(data.orderDate)}</div>
          </div>

          ${data.orderType === 'delivery' ? `
            <div class="delivery-info">
              <p><strong>Rider:</strong> ${data.riderName}</p>
              <p><strong>Phone:</strong> ${data.riderPhone}</p>
              <p><strong>Delivery ID:</strong> ${data.deliveryId}</p>
              <p><strong>Fee:</strong> ${formatCurrency(data.deliveryFee || 0)}</p>
            </div>
          ` : `
            ${data.orderItems ? `
              <div class="items-container">
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th style="text-align: center">Qty</th>
                      <th style="text-align: right">Price</th>
                      <th style="text-align: right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.orderItems.map(item => `
                      <tr>
                        <td>${item.name}</td>
                        <td style="text-align: center">${item.quantity}</td>
                        <td style="text-align: right">${formatCurrency(item.price)}</td>
                        <td style="text-align: right">${formatCurrency(item.price * item.quantity)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>

              <div class="total-section">
                <div class="total-row">
                  <span>Subtotal:</span>
                  <span>${formatCurrency(data.orderItems.reduce((acc, item) => acc + (item.price * item.quantity), 0))}</span>
                </div>
                ${data.requireDelivery === 'delivery' ? `
                  <div class="total-row">
                    <span>Delivery Fee:</span>
                    <span>${formatCurrency(data.deliveryFee || 0)}</span>
                  </div>
                ` : ''}
              </div>
            ` : ''}
          `}

          <div class="total-row grand-total">
            <span>Total:</span>
            <span>${formatCurrency(data.total)}</span>
          </div>

          ${data.requireDelivery === 'delivery' ? `
            <div class="delivery-info">
              <div class="address-info">
                <div class="address-label">From:</div>
                <div class="address-value">${truncateText(data.origin || '')}</div>
              </div>
              <div class="address-info" style="margin-top: 8px;">
                <div class="address-label">To:</div>
                <div class="address-value">${truncateText(data.destination || '')}</div>
              </div>
            </div>
          ` : ''}

          <div class="footer">
            <p>Thank you for choosing ServiPal!</p>
            <p>For support, contact: support@servipal.com</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

export const generateReceipt = async (data: ReceiptData) => {
  try {
    const html = createReceiptHTML(data);
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false
    });
    return uri;
  } catch (error) {
    console.error('Failed to generate receipt:', error);
    throw error;
  }
};

export default createReceiptHTML