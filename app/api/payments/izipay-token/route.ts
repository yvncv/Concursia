// /api/payments/izipay-token/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { levelName, price, eventId, eventName, amount } = body;

    // Validar datos requeridos
    if (!levelName || !price || !eventId || !eventName) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // Configuración de Izipay
    const IZIPAY_API_URL = process.env.IZIPAY_API_URL; // ej: https://api.micuentaweb.pe
    const IZIPAY_SHOP_ID = process.env.IZIPAY_SHOP_ID;
    const IZIPAY_API_PASSWORD = process.env.IZIPAY_API_PASSWORD;
    const NEXT_PUBLIC_IZIPAY_PUBLIC_KEY = process.env.NEXT_PUBLIC_IZIPAY_PUBLIC_KEY;

    if (!IZIPAY_API_URL || !IZIPAY_SHOP_ID || !IZIPAY_API_PASSWORD) {
      return NextResponse.json(
        { error: 'Configuración de pago incompleta' },
        { status: 500 }
      );
    }

    // Crear el payload para Izipay
    const paymentData = {
      amount: amount || (price * 100), // Convertir a centavos
      currency: 'PEN', // Soles peruanos
      orderId: `${eventId}-${levelName?.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`,
      customer: {
        email: 'customer@example.com', // Deberías obtener esto del usuario autenticado
      },
      metadata: {
        eventId,
        eventName,
        levelName,
        price,
      },
      // Configurar URLs de retorno
      strongAuthentication: 'CHALLENGE_REQUESTED',
      transactionOptions: {
        cardOptions: {
          captureDelay: 0,
        },
      },
    };

    // Realizar la petición a Izipay para obtener el token
    const response = await fetch(`${IZIPAY_API_URL}/api-payment/V4/Charge/CreatePayment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${IZIPAY_SHOP_ID}:${IZIPAY_API_PASSWORD}`).toString('base64')}`,
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error de Izipay:', errorData);
      return NextResponse.json(
        { error: 'Error al crear el token de pago', details: errorData },
        { status: response.status }
      );
    }

    const responseData = await response.json();

    // Verificar si la respuesta contiene el token
    if (!responseData.answer || !responseData.answer.formToken) {
      return NextResponse.json(
        { error: 'Token de pago no recibido', details: responseData },
        { status: 500 }
      );
    }

    return NextResponse.json({
      token: responseData.answer.formToken,
      orderId: paymentData.orderId,
      amount: paymentData.amount,
      currency: paymentData.currency,
      publicKey: NEXT_PUBLIC_IZIPAY_PUBLIC_KEY,
    });

  } catch (error) {
    console.error('Error en la API de token:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// También mantener el método GET para compatibilidad si lo necesitas
export async function GET() {
  return NextResponse.json(
    { message: 'Use POST method with payment details' },
    { status: 405 }
  );
}