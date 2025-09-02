"use client";
import Script from "next/script";
import { useEffect, useState, useRef } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, getFirestore } from "firebase/firestore";
import { auth } from "@/app/firebase/config";
import ReactDOM from "react-dom";

interface IzipayButtonProps {
  levelName: string;
  price: number;
  eventId: string;
  eventName?: string;
  className?: string;
  refreshKey?: string | number;
  onGlobalRefresh?: () => void;
  validateBeforePayment?: () => boolean; // Nueva prop para validación personalizada
}

export default function IzipayButton({
  levelName,
  price,
  eventId,
  eventName: providedEventName,
  className = "",
  refreshKey,
  onGlobalRefresh,
  validateBeforePayment, // Nueva prop
}: IzipayButtonProps) {
  const [formToken, setFormToken] = useState("");
  const [isFetchingToken, setIsFetchingToken] = useState(false);
  const [isRenderingForm, setIsRenderingForm] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isFormReady, setIsFormReady] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [eventName, setEventName] = useState<string | undefined>(providedEventName);
  const formRef = useRef<HTMLDivElement | null>(null);
  const lastMetaRef = useRef<{ levelName?: string; price?: number; eventId?: string; userId?: string } | null>(null);

  const [formInstanceId, setFormInstanceId] = useState<number>(() => Date.now());
  const formElementId = `kr-form-${eventId}-${levelName?.replace(/\s+/g, "-").toLowerCase()}-${formInstanceId}`;

  // auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // sync eventName si cambia prop
  useEffect(() => {
    setEventName(providedEventName);
  }, [providedEventName]);

  // reset cuando cambie evento o modal
  useEffect(() => {
    setFormToken("");
    setShowForm(false);
    setIsFormReady(false);
    setIsRenderingForm(false);
    lastMetaRef.current = null;
    try { (window as any).KR?.removeForms(); } catch (_) { }
  }, [eventId, providedEventName, refreshKey]);

  // si no se pasó eventName, buscar en Firestore
  useEffect(() => {
    if (providedEventName) return;
    let mounted = true;
    (async () => {
      try {
        const db = getFirestore();
        const ref = doc(db, "events", eventId);
        const snap = await getDoc(ref);
        if (mounted && snap.exists()) {
          const data = snap.data() as any;
          setEventName(data?.name || data?.title || `Evento ${eventId}`);
        }
      } catch (err) {
        console.warn("No se pudo leer evento:", err);
      }
    })();
    return () => { mounted = false; };
  }, [eventId, providedEventName]);

  // fetch token
  const fetchFormToken = async () => {
    try {
      setIsFetchingToken(true);
      setIsFormReady(false);
      setIsRenderingForm(false);
      setFormToken("");

      const body = {
        levelName,
        price,
        eventId,
        eventName: eventName ?? providedEventName ?? null,
        amount: Math.round((price ?? 0) * 100),
        customer: {
          userId: user?.uid ?? null,
          email: user?.email ?? null,
        },
      };
      lastMetaRef.current = { levelName, price, eventId, userId: user?.uid };

      const res = await fetch("/api/payments/izipay-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data?.token) return;

      setFormToken(data.token);
      setShowForm(true);
    } catch (error) {
      console.error("Error fetching payment token:", error);
    } finally {
      setIsFetchingToken(false);
    }
  };

  // init KR con callback de éxito modificado
  useEffect(() => {
    if (!showForm || !formToken || !formRef.current || typeof window === "undefined") return;
    const KR = (window as any).KR;
    if (!KR) return;

    let destroyed = false;
    let fallback: any;

    const init = async () => {
      try {
        setIsRenderingForm(true);
        setIsFormReady(false);

        KR.setFormConfig({
          formToken,
          "kr-popin": { "kr-button-label": `PAGAR S/ ${price.toFixed(2)}` },
        });

        try { KR.removeEventCallbacks?.(); } catch (_) { }
        try { KR.removeForms?.(); } catch (_) { }

        const el = document.getElementById(formElementId);
        if (!el) throw new Error("Contenedor del form no encontrado");
        el.setAttribute("data-kr-form-token", formToken);

        KR.onError = () => {
          if (!destroyed) { setIsFormReady(false); setIsRenderingForm(false); }
        };
        KR.onFormValid = () => {
          if (!destroyed) { setIsFormReady(true); setIsRenderingForm(false); }
        };

        // Callback para pago exitoso
        KR.onFormReady = () => {
          KR.onFormSuccess = () => {
            // Ejecutar callback de éxito después del pago
            if (onGlobalRefresh) {
              onGlobalRefresh();
            }
            handleCloseForm();
          };
        };

        await KR.renderElements(`#${formElementId}`);

        KR.onPopinClosed = () => {
          try { KR.removeEventCallbacks?.(); KR.removeForms?.(); } catch (_) { }
          if (!destroyed) {
            setFormToken("");
            lastMetaRef.current = null;
            setShowForm(false);
            setIsFormReady(false);
            setIsRenderingForm(false);
            setFormInstanceId(Date.now());
          }
        };

        fallback = setTimeout(() => {
          if (!destroyed && !isFormReady) setIsRenderingForm(false);
        }, 8000);
      } catch (err) {
        setIsRenderingForm(false);
        setIsFormReady(false);
      }
    };

    init();

    return () => {
      destroyed = true;
      if (fallback) clearTimeout(fallback);
      try { KR.removeEventCallbacks?.(); KR.removeForms?.(); } catch (_) { }
    };
  }, [showForm, formToken, formElementId, onGlobalRefresh]);

  // invalidar si cambian props
  useEffect(() => {
    const last = lastMetaRef.current;
    if (
      last &&
      (last.levelName !== levelName ||
        last.price !== price ||
        last.eventId !== eventId ||
        last.userId !== user?.uid)
    ) {
      setFormToken("");
      setIsFormReady(false);
      setShowForm(false);
      setIsRenderingForm(false);
    }
  }, [levelName, price, eventId, user?.uid]);

  const handlePaymentClick = async () => {
    // Ejecutar validación personalizada si existe
    if (validateBeforePayment && !validateBeforePayment()) {
      return; // No proceder si la validación falla
    }

    const last = lastMetaRef.current;
    const currentMetaMatch =
      last &&
      last.levelName === levelName &&
      last.price === price &&
      last.eventId === eventId &&
      last.userId === user?.uid;

    if (formToken && currentMetaMatch) {
      setShowForm(true);
      return;
    }
    await fetchFormToken();
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setIsFormReady(false);
    setIsRenderingForm(false);
    setFormToken("");
    lastMetaRef.current = null;
    setFormInstanceId(Date.now());

    try {
      const KR = (window as any).KR;
      KR?.removeForms?.();
      KR?.removeEventCallbacks?.();
      KR?.closePopin?.();
    } catch (_) { }
  };

  return (
    <>
      {/* Botón personalizado con estilo de "Guardar Inscripción" */}
      <div className={`relative ${className}`}>
        <Script
          src={
            process.env.NEXT_PUBLIC_IZIPAY_CLIENT_URL ||
            "https://static.micuentaweb.pe/static/js/krypton-client/V4.0/stable/kr-payment-form.min.js"
          }
          strategy="beforeInteractive"
        />

        <button
          onClick={handlePaymentClick}
          disabled={isFetchingToken || isRenderingForm}
          className="px-6 py-2 rounded-lg text-white flex items-center justify-center bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFetchingToken || isRenderingForm ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {isFetchingToken ? "Generando pago..." : "Inicializando formulario..."}
            </>
          ) : (
            'Guardar Inscripción'
          )}
        </button>
      </div>

      {/* Modal en el portal */}
      {showForm && formToken &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Pago de Entrada - {levelName}
                </h3>
                <button
                  onClick={handleCloseForm}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="p-4 flex flex-col items-center">
                <div className="mb-4 bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">
                    Evento: <span className="font-medium">{eventName ?? "Cargando..."}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Modalidad: <span className="font-medium">{levelName}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Precio: <span className="font-medium text-amber-600">S/. {price}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Usuario: <span className="font-medium">{user?.email ?? "No autenticado"}</span>
                  </p>
                </div>

                <div
                  ref={formRef}
                  key={formInstanceId}
                  id={formElementId}
                  className="kr-smart-form"
                  data-kr-form-token={formToken}
                />
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}