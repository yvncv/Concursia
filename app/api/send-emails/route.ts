// app/api/send-emails/route.ts (si usas App Router)
import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { emails } = await request.json();

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json({ message: 'Se requiere un array de emails' }, { status: 400 });
    }

    console.log(`📧 Procesando ${emails.length} emails...`);

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
      details: [] as Array<{ email: string; success: boolean; error?: string; participantCode?: string }>,
    };

    // Procesar emails uno por uno
    for (const emailData of emails) {
      try {
        console.log(`📤 Enviando email a: ${emailData.to}`);

        const { data, error } = await resend.emails.send({
          from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
          to: [emailData.to],
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        });

        if (error) {
          console.error(`❌ Error enviando a ${emailData.to}:`, error);
          results.failed++;
          results.errors.push(`Error enviando a ${emailData.to}: ${error.message}`);
          results.details.push({
            email: emailData.to,
            success: false,
            error: error.message,
            participantCode: emailData.participantCode
          });
        } else {
          console.log(`✅ Email enviado exitosamente a: ${emailData.to}`);
          results.success++;
          results.details.push({
            email: emailData.to,
            success: true,
            participantCode: emailData.participantCode
          });
        }

        // Pausa entre envíos para evitar rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (error) {
        console.error(`❌ Excepción enviando a ${emailData.to}:`, error);
        results.failed++;
        results.errors.push(`Excepción enviando a ${emailData.to}: ${error.message}`);
        results.details.push({
          email: emailData.to,
          success: false,
          error: error.message,
          participantCode: emailData.participantCode
        });
      }
    }

    console.log(`📊 Resumen: ${results.success} exitosos, ${results.failed} fallidos`);

    return NextResponse.json({
      success: true,
      message: `Emails procesados: ${results.success} exitosos, ${results.failed} fallidos`,
      results
    });

  } catch (error) {
    console.error('❌ Error general en API:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    }, { status: 500 });
  }
}