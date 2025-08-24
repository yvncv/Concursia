const nodemailer = require('nodemailer');

export default async function handler(req, res) {
    const { userId, academyName, message, academyEmail } = req.body;

    const gmailUser = process.env.GMAIL_USER;
    const gmailPassword = process.env.GMAIL_APP_PASSWORD;
    const fromEmail = process.env.FROM_EMAIL;
    const fromName = process.env.FROM_NAME || 'Competencia de Marinera';

    if (!gmailUser || !gmailPassword) {
        return res.status(500).json({
            success: false,
            message: 'Faltan credenciales de Gmail. Verifica GMAIL_USER y GMAIL_APP_PASSWORD en .env.local'
        });
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: gmailUser,
            pass: gmailPassword
        }
    });

    const mailOptions = {
        from: `${fromName} <${fromEmail}>`,
        to: academyEmail,
        subject: `Nueva solicitud de afiliación a ${academyName}`,
        text: `Hola,\n\nEl usuario ${userId} ha solicitado unirse a ${academyName}.\n\nMensaje: ${message}\n\n¡Gracias!`
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}