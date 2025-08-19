import SignatureCanvas from "react-signature-canvas";
import React, {
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";

interface SignaturePadProps {
  value: string;
  onChange: (dataUrl: string) => void;
}

const SignaturePad = forwardRef<SignatureCanvas, SignaturePadProps>(
  ({ value, onChange }, ref) => {
    const signatureRef = useRef<SignatureCanvas>(null);
    useImperativeHandle(ref, () => signatureRef.current as SignatureCanvas);

    useEffect(() => {
      if (signatureRef.current) {
        const canvas = signatureRef.current.getCanvas();
        if (canvas) {
          const setCursor = () => {
            canvas.style.cursor = "crosshair";
          };
          setCursor();
          canvas.addEventListener("mouseenter", setCursor);
          canvas.addEventListener("mousemove", setCursor);
          return () => {
            canvas.removeEventListener("mouseenter", setCursor);
            canvas.removeEventListener("mousemove", setCursor);
          };
        }
      }
    }, []);

    return (
      <div>
        {/* Force crosshair cursor globally for the signature pad canvas */}
        <style>{`
        .signature-canvas > canvas {
          cursor: crosshair !important;
        }
      `}</style>
        <SignatureCanvas
          ref={signatureRef}
          penColor="black"
          canvasProps={{
            width: 500,
            height: 200,
            className: "signature-canvas border rounded",
            style: { display: "block", margin: "0 auto" },
          }}
          onEnd={() => {
            if (signatureRef.current) {
              const dataUrl = signatureRef.current.toDataURL();
              onChange(dataUrl);
              // Reset cursor after drawing
              const canvas = signatureRef.current.getCanvas();
              if (canvas) canvas.style.cursor = "crosshair";
            }
          }}
        />
        {/* No internal clear button, only parent clear button is shown */}
      </div>
    );
  }
);

export default SignaturePad;
