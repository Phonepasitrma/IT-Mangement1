// frontend/src/components/checkInOut/QRScanner.tsx
import React, { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-bootstrap';

interface QRScannerProps {
  onScanResult: (result: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ onScanResult }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState('');
  const [scanning, setScanning] = useState(true);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Simulate a successful scan
        intervalId = setTimeout(() => {
          onScanResult('AssetID:AST001');
          setScanning(false);
        }, 3000);
      } catch (err) {
        setError('Unable to access camera. Please ensure camera permissions are granted.');
        console.error('Error accessing camera:', err);
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (intervalId) {
        clearTimeout(intervalId);
      }
    };
  }, [onScanResult]);

  return (
    <div className="qr-scanner">
      {error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <>
          <video ref={videoRef} autoPlay playsInline className="w-100" />
          {scanning && (
            <div className="text-center mt-2">
              <p>Scanning for QR codes...</p>
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default QRScanner;