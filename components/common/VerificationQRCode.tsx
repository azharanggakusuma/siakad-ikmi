"use client";

import React, { useEffect, useState } from "react";
import QRCode from "react-qr-code";

interface VerificationQRCodeProps {
  studentId: string;
  size?: number;
}

export default function VerificationQRCode({ studentId, size = 100 }: VerificationQRCodeProps) {
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  if (!origin) return null;

  return (
    <QRCode
      value={`${origin}/verify/${studentId}`}
      size={size}
      style={{ height: "auto", maxWidth: "100%", width: "100%" }}
      viewBox={`0 0 256 256`}
    />
  );
}
