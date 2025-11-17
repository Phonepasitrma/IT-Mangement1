import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import QRCode from 'qrcode';
import { useReactToPrint } from 'react-to-print';
import api from '../../services/api';

interface QRCodeDisplayProps {
  assetId: string;
}

interface QRCodeResponse {
  qrCode: string;
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ assetId }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const qrRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    generateQRCode();
  }, [assetId]);

  const generateQRCode = async () => {
    try {
      // Try to get existing QR code from the server
      const response = await api.get(`/assets/${assetId}/qrcode`);
      const data = response.data as QRCodeResponse;

      if (data && data.qrCode) {
        // If QR code exists on server, use it
        if (data.qrCode.startsWith('data:')) {
          // Base64 data
          setQrCodeUrl(data.qrCode);
        } else {
          // File path
          setQrCodeUrl(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${data.qrCode}`);
        }
      } else {
        // Generate QR code on client side
        const url = await QRCode.toDataURL(`AssetID:${assetId}`);
        setQrCodeUrl(url);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Fallback to client-side generation
      try {
        const url = await QRCode.toDataURL(`AssetID:${assetId}`);
        setQrCodeUrl(url);
      } catch (fallbackError) {
        console.error('Error generating fallback QR code:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => qrRef.current
  } as any);

if (loading) {
  return <p>Generating QR code...</p>;
}

  return (
    <div ref={qrRef}>
      <div className="d-flex justify-content-center mb-3">
        {qrCodeUrl && (
          <img src={qrCodeUrl} alt="QR Code" style={{ maxWidth: '200px' }} />
        )}
      </div>
      <div className="d-flex justify-content-center">
        <Button variant="primary" onClick={handlePrint}>
          Print QR Code
        </Button>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
