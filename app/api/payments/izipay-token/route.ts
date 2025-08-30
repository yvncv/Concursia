import { NextResponse } from "next/server";

export async function GET() {
  try {
    const body = {
      amount: 3000,
      orderId: `ORDER-${Date.now()}`,
      currency: "PEN",
      customerEmail: "cliente@example.com",
    };

    const res = await fetch(
      "https://api.micuentaweb.pe/api-payment/V4/Charge/CreatePayment",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(
            `${process.env.IZIPAY_SHOP_ID}:${process.env.IZIPAY_API_PASSWORD}`
          ).toString("base64")}`,
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    return NextResponse.json({ token: data.answer.formToken });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "No se pudo generar el token" }, { status: 500 });
  }
}
