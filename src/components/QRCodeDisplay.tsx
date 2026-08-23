import React, { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Download, QrCode, CheckCircle, Copy, ExternalLink } from "lucide-react";
import { useToast } from "./Toast";

interface QRCodeDisplayProps {
  payload: any;
  batchNumber: string;
  drugName?: string;
  size?: number;
  showDetails?: boolean;
  onScanSimulate?: (data: any) => void;
}

export default function QRCodeDisplay({
  payload,
  batchNumber,
  drugName,
  size = 180,
  showDetails = false,
  onScanSimulate,
}: QRCodeDisplayProps) {
  const { showToast } = useToast();
  const [dataUrl, setDataUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const payloadText = typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);

  useEffect(() => {
    let isMounted = true;
    const generateQR = async () => {
      try {
        const textToEncode = typeof payload === "string" ? payload : JSON.stringify(payload);
        const url = await QRCode.toDataURL(textToEncode, {
          errorCorrectionLevel: "M",
          margin: 2,
          scale: 8,
          color: {
            dark: "#0a1628",
            light: "#ffffff",
          },
        });
        if (isMounted) setDataUrl(url);
      } catch (err) {
        console.error("Failed to generate QR code:", err);
      }
    };
    generateQR();
    return () => {
      isMounted = false;
    };
  }, [payload, batchNumber]);

  const handleDownload = () => {
    if (!dataUrl) return;
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `PharmTrack_QR_${batchNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("success", "QR Code Downloaded", `Saved QR code for batch ${batchNumber} as PNG`);
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(payloadText);
    setCopied(true);
    showToast("info", "Payload Copied", "Traceability GS1 JSON payload copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulate = () => {
    if (onScanSimulate) {
      onScanSimulate(payload);
    }
    showToast("success", "QR Code Verified", `Scanned batch ${batchNumber} · GS1 Blockchain Ledger Authenticated`);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        onClick={handleSimulate}
        className="relative group cursor-pointer p-2.5 bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:border-teal-400 hover:shadow-md transition-all flex flex-col items-center justify-center"
        title="Click to simulate scanning this QR code"
      >
        {dataUrl ? (
          <img
            src={dataUrl}
            alt={`QR Code for ${batchNumber}`}
            style={{ width: size, height: size }}
            className="rounded-lg object-contain"
          />
        ) : (
          <div
            style={{ width: size, height: size }}
            className="bg-slate-100 rounded-lg flex items-center justify-center animate-pulse text-slate-400"
          >
            <QrCode size={36} />
          </div>
        )}
        <div className="absolute inset-0 bg-slate-950/60 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-semibold gap-1 backdrop-blur-[1px]">
          <CheckCircle size={20} className="text-teal-400" />
          <span>Click to Scan</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleDownload}
          disabled={!dataUrl}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors disabled:opacity-50"
        >
          <Download size={13} /> Download QR
        </button>
        <button
          onClick={handleCopyPayload}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium rounded-lg transition-colors"
        >
          <Copy size={13} /> {copied ? "Copied" : "Copy Payload"}
        </button>
      </div>

      {showDetails && (
        <div className="w-full mt-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-left font-mono text-[11px] text-slate-600 max-h-36 overflow-y-auto">
          <p className="font-sans font-bold text-slate-800 text-xs mb-1">GS1 Traceability Payload</p>
          <pre className="whitespace-pre-wrap break-all">{payloadText}</pre>
        </div>
      )}
    </div>
  );
}
