import QRCode from 'qrcode';

/**
 * Generate QR code data URL from batch payload
 */
export async function generateQRCodeDataUrl(payload) {
  try {
    const text = typeof payload === 'string' ? payload : JSON.stringify(payload);
    const dataUrl = await QRCode.toDataURL(text, {
      errorCorrectionLevel: 'M',
      margin: 2,
      scale: 6,
      color: {
        dark: '#0a1628',
        light: '#ffffff',
      },
    });
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    return null;
  }
}

/**
 * Generate a standard batch verification payload
 */
export function buildBatchQRPayload(batch) {
  return {
    pharmTrackVer: '2.4',
    type: 'DRUG_BATCH_TRACE',
    batchNumber: batch.batchNumber,
    drugId: batch.drugId,
    drugName: batch.drugName,
    mfgDate: batch.manufacturingDate || batch.mfgDate,
    expiryDate: batch.expiryDate,
    supplier: batch.supplierName,
    verified: true,
  };
}
