"use client";
import Script from "next/script";
import { useEffect, useState } from "react";

export default function IzipayButton() {
  const [formToken, setFormToken] = useState<string>("");

  // 1️⃣ Traer el token del backend
  const fetchFormToken = async () => {
    try {
      const res = await fetch("/api/payments/izipay-token");
      const data = await res.json();
      if (data.token) setFormToken(data.token);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFormToken();
  }, []);

  // 2️⃣ Renderizar solo cuando haya token y KR
  useEffect(() => {
    if (!formToken || !window.KR) return;

    // Limpiamos cualquier formulario anterior
    window.KR.removeForms();
    window.KR.renderElements();
  }, [formToken]);

  return (
    <>
      {/* Formulario */}
      <div className="kr-smart-form" kr-popin="true" kr-form-token={formToken}></div>
    </>
  );
}
