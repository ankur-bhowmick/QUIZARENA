import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, RefreshCw, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function QrScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [scannerError, setScannerError] = useState('');
  const [isInitializing, setIsInitializing] = useState(true);
  const html5QrcodeRef = useRef(null);
  const isScanningRef = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    setIsInitializing(true);
    setScannerError('');

    const elementId = 'qr-camera-stream';
    const html5Qrcode = new Html5Qrcode(elementId);
    html5QrcodeRef.current = html5Qrcode;

    const startScanner = async () => {
      try {
        await html5Qrcode.start(
          { facingMode: 'environment' }, // Preferred back camera on mobile
          {
            fps: 10,
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
          },
          (decodedText) => {
            // Extracted code logic
            let code = decodedText.trim();
            if (code.includes('code=')) {
              const match = code.match(/code=([A-Za-z0-9]+)/);
              if (match && match[1]) {
                code = match[1];
              }
            } else if (code.includes('/join/')) {
              const parts = code.split('/join/');
              if (parts[1]) code = parts[1].split('?')[0];
            }

            if (!isScanningRef.current) return;
            isScanningRef.current = false;
            
            html5Qrcode
              .stop()
              .catch(() => {})
              .finally(() => {
                onScanSuccess(code);
                onClose();
              });
          },
          () => {
            // Frame scan tick
          }
        );

        isScanningRef.current = true;
        setIsInitializing(false);
      } catch (err) {
        console.error('Camera QR scanner error:', err);
        setScannerError('Could not access camera. Please allow camera permissions or enter code manually.');
        setIsInitializing(false);
      }
    };

    const timer = setTimeout(() => {
      startScanner();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (html5QrcodeRef.current && isScanningRef.current) {
        isScanningRef.current = false;
        html5QrcodeRef.current.stop().catch(() => {}).finally(() => {
          html5QrcodeRef.current?.clear();
        });
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 select-none">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="glass-panel p-6 rounded-3xl max-w-sm w-full border border-indigo-500/40 text-center space-y-4 shadow-2xl relative"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            if (html5QrcodeRef.current && isScanningRef.current) {
              isScanningRef.current = false;
              html5QrcodeRef.current.stop().catch(() => {}).finally(() => {
                onClose();
              });
            } else {
              onClose();
            }
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>Live Camera Scanner</span>
          </div>
          <h3 className="font-display font-black text-xl text-white">Scan Game QR Code</h3>
          <p className="text-slate-400 text-xs">Point your device camera at the host's projector screen</p>
        </div>

        {/* Camera Container */}
        <div className="relative w-full aspect-square bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 flex items-center justify-center">
          <div id="qr-camera-stream" className="w-full h-full object-cover"></div>

          {isInitializing && (
            <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center space-y-2 text-indigo-400">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <span className="text-xs font-semibold">Accessing camera...</span>
            </div>
          )}

          {scannerError && (
            <div className="absolute inset-0 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-400" />
              <p className="text-rose-300 text-xs font-semibold">{scannerError}</p>
            </div>
          )}
        </div>

        <button
          onClick={() => {
            if (html5QrcodeRef.current && isScanningRef.current) {
              isScanningRef.current = false;
              html5QrcodeRef.current.stop().catch(() => {}).finally(() => {
                onClose();
              });
            } else {
              onClose();
            }
          }}
          className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
        >
          Close Scanner
        </button>
      </motion.div>
    </div>
  );
}
