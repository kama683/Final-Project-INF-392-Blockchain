import { X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import CopyButton from "./CopyButton";

function QRModal({ account, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Receive GC</h3>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <div className="qr-wrapper">
            <QRCodeSVG
              value={account}
              size={220}
              bgColor="#ffffff"
              fgColor="#0a0e1a"
            />
          </div>
          <div className="qr-address">
            <span className="mono">{account}</span>
            <CopyButton text={account} />
          </div>
          <p className="qr-note">Scan to send GC or ETH to this address</p>
        </div>
      </div>
    </div>
  );
}

export default QRModal;
