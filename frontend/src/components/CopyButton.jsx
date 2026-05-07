import { useState } from "react";
import { Copy, Check } from "lucide-react";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      className={`copy-btn${copied ? " copied" : ""}`}
      onClick={handleCopy}
      title="Copy address"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

export default CopyButton;
