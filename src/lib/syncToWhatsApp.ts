/**
 * SyncToWhatsApp utility function for Bazar360 CRM.
 * Programmatically builds a pre-formatted message string containing the CRM ID,
 * vehicle details, and current status, and triggers a window.open call to WhatsApp API.
 */
export function syncToWhatsApp(
  crmId: string,
  vehicleDetails: string,
  status: string,
  customerName?: string,
  phoneNumber: string = '923000000000'
): void {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
  const message = `Hello Bazar360 CRM Support,%0A%0A` +
    `*CRM Reference ID:* ${crmId}%0A` +
    `${customerName ? `*Customer:* ${customerName}%0A` : ''}` +
    `*Vehicle:* ${vehicleDetails || 'N/A'}%0A` +
    `*Current Status:* ${status}%0A%0A` +
    `Please provide an update on this inquiry.`;

  const url = `https://wa.me/${cleanPhone}?text=${message}`;
  window.open(url, '_blank');
}
