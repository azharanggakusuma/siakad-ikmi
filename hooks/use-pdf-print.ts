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

  const generatePdfBlob = useCallback(async ({
    elementRef,
    pdfFormat = "a4",
    pdfOrientation = "portrait",
    pixelRatio = 5,
    imageType = "image/jpeg",
    imageQuality = 0.98,
    onBeforePrint,
    onAfterPrint,
  }: PrintOptions): Promise<Blob | null> => {
    if (!elementRef.current) {
      console.warn("Print Ref is null");
      return null;
    }

    try {
      if (onBeforePrint) await onBeforePrint();

      // 1. Convert HTML to Blob
      const blob = await toBlob(elementRef.current, {
        backgroundColor: "#ffffff",
        pixelRatio: pixelRatio,
      });

      if (!blob) throw new Error("Gagal memproses gambar.");

      // 2. Compress/Convert image
      const ext = imageType === "image/png" ? "png" : "jpg";
      const file = new File([blob], `print_asset.${ext}`, { type: imageType });

      let compressedDataUrl: string;

      if (imageType === "image/png") {
        compressedDataUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      } else {
        const compressedBlob = await imageCompression(file, {
          maxSizeMB: 10,
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

      let width, height;

      if (Array.isArray(pdfFormat)) {
        width = pdfFormat[0];
        height = pdfFormat[1];
      } else {
        const imgProps = pdf.getImageProperties(compressedDataUrl);
        width = pdf.internal.pageSize.getWidth();
        height = (imgProps.height * width) / imgProps.width;
      }

      const formatAlias = imageType === "image/png" ? "PNG" : "JPEG";
      pdf.addImage(compressedDataUrl, formatAlias, 0, 0, width, height);

      return pdf.output("blob");
    } catch (error) {
      console.error("Blob Generation Error:", error);
      throw error;
    } finally {
      if (onAfterPrint) onAfterPrint();
    }
  }, []);

  const printPdf = useCallback(async (options: PrintOptions) => {
    setIsPrinting(true);
    const toastId = toast.loading("Memproses Dokumen...", {
      description: "Mohon tunggu sebentar, sedang menyiapkan dokumen.",
    });

    try {
      const pdfBlob = await generatePdfBlob(options);

      if (pdfBlob) {
        const url = URL.createObjectURL(pdfBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = options.fileName;
        link.click();
        URL.revokeObjectURL(url);

        toast.success("Berhasil mengunduh Dokumen!", {
          id: toastId,
          description: "Dokumen telah berhasil dibuat dan diunduh."
        });
      }
    } catch (error) {
      toast.error("Gagal membuat Dokumen.", {
        description: "Terjadi kesalahan saat memproses data.",
        id: toastId,
      });
    } finally {
      setIsPrinting(false);
    }
  }, [generatePdfBlob]);

  return {
    isPrinting,
    printPdf,
    generatePdfBlob, // Expose this
  };
}
