import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, AlertCircle, CheckCircle2, RefreshCw, Zap } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedText: string) => void;
  title?: string;
  instruction?: string;
  simulateSampleData?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
  title = 'SCAN FACILITY QR CODE',
  instruction = 'Point camera at the front desk turnstile screen or member pass badge',
  simulateSampleData = 'PROFIT_GYM_SANCTUARY_CHECKIN:NYC - NoHo Flagship (Sanctuary 01):GATE_DIRECT'
}) => {
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [scanCompleted, setScanCompleted] = useState(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const readerElementId = 'profit-gym-qr-reader';

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setCameraError(null);
    setIsInitializing(true);
    setScanCompleted(false);

    // Give DOM time to render the reader div
    const timer = setTimeout(async () => {
      try {
        const qrScanner = new Html5Qrcode(readerElementId);
        scannerRef.current = qrScanner;

        const config = {
          fps: 10,
          qrbox: { width: 240, height: 240 },
          aspectRatio: 1.0,
        };

        await qrScanner.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            if (!isMounted) return;
            setScanCompleted(true);
            // Vibrate if supported
            if (navigator.vibrate) navigator.vibrate(100);
            
            // Stop scanning once detected
            qrScanner
              .stop()
              .then(() => {
                qrScanner.clear();
                onScanSuccess(decodedText);
              })
              .catch(() => {
                onScanSuccess(decodedText);
              });
          },
          (errorMessage) => {
            // Frame parse error - expected while scanning, ignore
          }
        );

        if (isMounted) {
          setIsInitializing(false);
        }
      } catch (err: any) {
        if (!isMounted) return;
        setIsInitializing(false);
        const errMsg = err?.message || String(err);
        if (errMsg.includes('NotAllowedError') || errMsg.includes('Permission')) {
          setCameraError('Camera access denied. Please grant browser camera permissions or use direct test scan below.');
        } else if (errMsg.includes('NotFoundError') || errMsg.includes('device')) {
          setCameraError('No active webcam found on this device. You can use the Quick Test Simulator below.');
        } else {
          setCameraError(`Camera initialization issue: ${errMsg}. You can use Quick Test Simulator.`);
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (scannerRef.current) {
        try {
          if (scannerRef.current.isScanning) {
            scannerRef.current.stop().then(() => scannerRef.current?.clear()).catch(() => {});
          } else {
            scannerRef.current.clear();
          }
        } catch (e) {
          // ignore cleanup errors
        }
      }
    };
  }, [isOpen]);

  const handleSimulate = () => {
    setScanCompleted(true);
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(() => {});
    }
    onScanSuccess(simulateSampleData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gym-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-gym-surface border border-gym-border rounded-sm shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gym-border bg-gym-surface-hover">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-gym-lime" />
            <h3 className="font-heading font-black text-sm uppercase tracking-wider text-gym-primary">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gym-muted hover:text-gym-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scanner Viewport */}
        <div className="p-4 space-y-4">
          <p className="text-xs text-gym-secondary text-center">
            {instruction}
          </p>

          <div className="relative w-full aspect-square bg-gym-black rounded border border-gym-border overflow-hidden flex items-center justify-center">
            {/* HTML5 QR Container */}
            <div id={readerElementId} className="w-full h-full" />

            {/* Loading Indicator */}
            {isInitializing && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gym-black/90 z-10 gap-3">
                <RefreshCw className="w-8 h-8 text-gym-lime animate-spin" />
                <span className="text-xs font-heading font-bold uppercase tracking-wider text-gym-muted">
                  Initializing Optical Camera Feed...
                </span>
              </div>
            )}

            {/* Error or No Camera Message */}
            {cameraError && (
              <div className="absolute inset-0 p-6 flex flex-col items-center justify-center bg-gym-black/95 z-10 text-center gap-3">
                <AlertCircle className="w-8 h-8 text-amber-400" />
                <span className="text-xs text-gym-primary leading-relaxed">
                  {cameraError}
                </span>
                <button
                  onClick={handleSimulate}
                  className="mt-2 px-4 py-2 bg-gym-lime text-gym-black font-heading font-bold text-xs uppercase tracking-wider rounded-sm hover:bg-gym-lime-hover transition-colors flex items-center gap-2 shadow-lime-glow"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Execute Optical Check-In</span>
                </button>
              </div>
            )}

            {/* Success Overlay */}
            {scanCompleted && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-gym-black/90 z-20 gap-2">
                <CheckCircle2 className="w-10 h-10 text-gym-lime animate-bounce" />
                <span className="text-xs font-heading font-black uppercase tracking-wider text-gym-lime">
                  QR Token Authenticated!
                </span>
              </div>
            )}
          </div>

          {/* Quick Simulator / Manual Bypass Button */}
          {!cameraError && !scanCompleted && (
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSimulate}
                className="w-full py-2.5 px-4 bg-gym-surface hover:bg-gym-surface-hover border border-gym-border text-xs font-heading font-bold uppercase tracking-wider text-gym-primary rounded-sm transition-colors flex items-center justify-center gap-2"
              >
                <Zap className="w-3.5 h-3.5 text-gym-lime" />
                <span>Simulate Front-Desk QR Passcode Match</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
