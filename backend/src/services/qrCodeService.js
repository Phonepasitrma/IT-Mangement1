const QRCode = require('qrcode');
const path = require('path');
const fs = require('fs');

const QRCodeService = {
  generateQRCode: async (data, filePath = null) => {
    try {
      let qrCodeData;
      
      if (filePath) {
        // Save QR code as file
        const fullPath = path.join(__dirname, '../../qrcodes', filePath);
        const dir = path.dirname(fullPath);
        
        // Create directory if it doesn't exist
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        await QRCode.toFile(fullPath, data);
        qrCodeData = `/qrcodes/${filePath}`;
      } else {
        // Generate QR code as base64
        qrCodeData = await QRCode.toDataURL(data);
      }
      
      return qrCodeData;
    } catch (error) {
      console.error('Error generating QR code:', error);
      throw error;
    }
  },
  
  generateAssetQRCode: async (assetId) => {
    try {
      const data = `AssetID:${assetId}`;
      const filePath = `asset_${assetId}.png`;
      return await QRCodeService.generateQRCode(data, filePath);
    } catch (error) {
      console.error('Error generating asset QR code:', error);
      throw error;
    }
  }
};

module.exports = QRCodeService;
