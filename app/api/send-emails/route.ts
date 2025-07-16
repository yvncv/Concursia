// app/api/send-emails/route.ts (si usas App Router)
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  console.log('🔍 API Route Gmail SMTP iniciada');
  
  // VALIDAR VARIABLES DE ENTORNO
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  const fromEmail = process.env.FROM_EMAIL;
  const fromName = process.env.FROM_NAME || 'Competencia de Marinera';
  
  console.log('🔍 Debug variables de entorno:');
  console.log('- GMAIL_USER:', gmailUser);
  console.log('- GMAIL_APP_PASSWORD existe:', !!gmailPassword);
  console.log('- FROM_EMAIL:', fromEmail);
  
  if (!gmailUser || !gmailPassword) {
    console.error('❌ Faltan credenciales de Gmail');
    return NextResponse.json({
      success: false,
      message: 'Faltan credenciales de Gmail. Verifica GMAIL_USER y GMAIL_APP_PASSWORD en .env.local',
      error: 'Missing Gmail credentials'
    }, { status: 500 });
  }

  try {
    const { emails } = await request.json();
    console.log('📧 Emails recibidos:', emails?.length || 0);

    if (!emails || !Array.isArray(emails)) {
      return NextResponse.json({ 
        success: false,
        message: 'Se requiere un array de emails' 
      }, { status: 400 });
    }

    // Crear transporter de Gmail
    console.log('🔧 Configurando Gmail SMTP...');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPassword,
      },
    });

    // Verificar conexión
    try {
      await transporter.verify();
      console.log('✅ Conexión Gmail SMTP verificada');
    } catch (verifyError) {
      console.error('❌ Error verificando Gmail SMTP:', verifyError);
      return NextResponse.json({
        success: false,
        message: 'Error de autenticación con Gmail. Verifica tu contraseña de aplicación.',
        error: verifyError.message
      }, { status: 500 });
    }

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

        const mailOptions = {
          from: `${fromName} <${fromEmail}>`,
          to: emailData.to,
          subject: emailData.subject,
          html: emailData.html,
          text: emailData.text,
        };

        const info = await transporter.sendMail(mailOptions);

        console.log(`✅ Email enviado exitosamente a: ${emailData.to}, MessageID:`, info.messageId);
        results.success++;
        results.details.push({
          email: emailData.to,
          success: true,
          participantCode: emailData.participantCode
        });

        // Pausa entre envíos para evitar rate limiting de Gmail
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1 segundo entre emails

      } catch (emailError) {
        console.error(`❌ Error enviando a ${emailData.to}:`, emailError);
        results.failed++;
        const errorMessage = emailError.message || String(emailError);
        results.errors.push(`Error enviando a ${emailData.to}: ${errorMessage}`);
        results.details.push({
          email: emailData.to,
          success: false,
          error: errorMessage,
          participantCode: emailData.participantCode
        });
      }
    }

    console.log(`📊 Resumen final: ${results.success} exitosos, ${results.failed} fallidos`);

    return NextResponse.json({
      success: true,
      message: `Emails procesados: ${results.success} exitosos, ${results.failed} fallidos`,
      results
    });

  } catch (error) {
    console.error('❌ Error general en API route:', error);
    return NextResponse.json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

// Método GET para testing
export async function GET() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPassword = process.env.GMAIL_APP_PASSWORD;
  
  return NextResponse.json({
    message: 'API de emails con Gmail SMTP funcionando',
    hasGmailUser: !!gmailUser,
    hasGmailPassword: !!gmailPassword,
    fromEmail: process.env.FROM_EMAIL,
    timestamp: new Date().toISOString()
  });
}