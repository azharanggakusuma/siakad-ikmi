import { useState, useCallback } from "react";
import { toBlob } from "html-to-image";
import jsPDF from "jspdf";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";

interface PrintOptions {
  elementRef: React.RefObject<any>;
  fileName: string;
  pdfFormat?: string | number[]; // e.g., 'a4', [85.6, 53.98]
  pdfOrientation?: "p" | "portrait" | "l" | "landscape";
  pixelRatio?: number; // Default 4 for HD
  imageType?: "image/jpeg" | "image/png"; // Allow choosing format
  imageQuality?: number;
  onBeforePrint?: () => void | Promise<void>;
  onAfterPrint?: () => void;
}

export function usePdfPrint() {
  const [isPrinting, setIsPrinting] = useState(false);

  const printPdf = useCallback(async ({
    elementRef,
    fileName,
    pdfFormat = "a4",
    pdfOrientation = "portrait",
    pixelRatio = 5,
    imageType = "image/jpeg", // Default to JPEG for standard docs
    imageQuality = 0.98,
    onBeforePrint,
    onAfterPrint,
  }: PrintOptions) => {
    if (!elementRef.current) {
      console.warn("Print Ref is null");
      return;
    }

    setIsPrinting(true);
    const toastId = toast.loading("Memproses Dokumen...", {
      description: "Mohon tunggu sebentar, sedang menyiapkan dokumen.",
    });

    try {
      if (onBeforePrint) await onBeforePrint();

      // 1. Convert HTML to Blob
      const blob = await toBlob(elementRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: pixelRatio,
      });

      if (!blob) throw new Error("Gagal memproses gambar.");

      // 2. Compress/Convert image
      // Use configured type and quality
      const ext = imageType === "image/png" ? "png" : "jpg";
      const file = new File([blob], `print_asset.${ext}`, { type: imageType });

      let compressedDataUrl: string;

      if (imageType === "image/png") {
        // SKIP COMPRESSION FOR PNG to ensure 100% lossless quality
        compressedDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      } else {
        // Compress JPEG to save space
        const compressedBlob = await imageCompression(file, {
          maxSizeMB: 10, // Increased to 10MB to support 8x Res JPEGs without downscaling
          maxWidthOrHeight: 15000,
          useWebWorker: true,
          fileType: "image/jpeg",
          initialQuality: imageQuality
        });
        compressedDataUrl = await imageCompression.getDataUrlFromFile(compressedBlob);
      }

      // 4. Generate PDF
      const pdf = new jsPDF({
        orientation: pdfOrientation,
        unit: "mm",
        format: pdfFormat,
      });

      // Calculate logic for fit-to-page if standard A4, or exact fit if custom size
      let width, height;

      if (Array.isArray(pdfFormat)) {
        // Custom fixed size (like ID Card) - Use exact dimensions
        width = pdfFormat[0];
        height = pdfFormat[1];
      } else {
        // Standard format (like A4) - Calc aspect ratio to fit width
        const imgProps = pdf.getImageProperties(compressedDataUrl);
        width = pdf.internal.pageSize.getWidth();
        height = (imgProps.height * width) / imgProps.width;
      }

      const formatAlias = imageType === "image/png" ? "PNG" : "JPEG";
      pdf.addImage(compressedDataUrl, formatAlias, 0, 0, width, height);
      pdf.save(fileName);

      toast.success("Berhasil mengunduh Dokumen!", { id: toastId });
    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast.error("Gagal membuat Dokumen.", {
        description: "Terjadi kesalahan saat memproses data.",
        id: toastId,
      });
    } finally {
      setIsPrinting(false);
      if (onAfterPrint) onAfterPrint();
    }
  }, []);

  return {
    isPrinting,
    printPdf,
  };
}
