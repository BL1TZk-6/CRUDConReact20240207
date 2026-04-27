import nodemailer from "nodemailer";

// construye la plantilla HTML del correo para verificación de cuenta
const buildVerificationEmailHtml = (verificationCode, otpUrl) => `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Verificación de cuenta</title>
  </head>
  <body style="margin:0;padding:0;background-color:#111111;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#111111;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#1F1F1F;border-radius:18px;overflow:hidden;border:1px solid #822727;">
            <tr>
              <td style="background:linear-gradient(135deg,#1F1F1F 0%,#2a1f1f 55%,#822727 100%);padding:36px 28px;">
                <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:1.2px;text-transform:uppercase;color:#ffffff;">Autorect</p>
                <h1 style="margin:0;font-size:30px;line-height:1.2;color:#ffffff;font-weight:700;">Confirma tu cuenta</h1>
                <p style="margin:14px 0 0 0;font-size:15px;line-height:1.7;color:#ffffff;max-width:520px;">
                  Estamos a un paso de activar tu acceso. Usa el siguiente código para verificar tu cuenta.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #822727;border-radius:14px;background:#1a1a1a;">
                  <tr>
                    <td align="center" style="padding:18px 16px 8px 16px;font-size:13px;color:#822727;font-weight:600;letter-spacing:.6px;text-transform:uppercase;">
                      Código de verificación
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:0 16px 18px 16px;">
                      <span style="display:inline-block;padding:10px 18px;font-size:30px;letter-spacing:4px;font-weight:700;color:#822727;background:#111111;border:1px dashed #822727;border-radius:10px;">
                        ${verificationCode}
                      </span>
                    </td>
                  </tr>
                </table>

                <div style="margin:20px 0 4px 0;text-align:center;">
                  <a
                    href="${otpUrl}"
                    style="display:inline-block;background:#822727;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:700;"
                  >
                    Ir a verificar cuenta
                  </a>
                </div>

                <p style="margin:18px 0 0 0;font-size:14px;line-height:1.7;color:#cccccc;">
                  Este código expira en 5 minutos por seguridad. Si tú no solicitaste este registro, puedes ignorar este correo.
                </p>

                <p style="margin:10px 0 0 0;font-size:12px;line-height:1.6;color:#999999;word-break:break-all;">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
                  <a href="${otpUrl}" style="color:#822727;text-decoration:underline;">${otpUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 28px;background:#1a1a1a;border-top:1px solid #822727;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#999999;">
                  Este mensaje fue enviado automáticamente por Autorect.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

// construye la plantilla HTML del correo para recuperación de contraseña
const buildPasswordRecoveryEmailHtml = (verificationCode, otpUrl) => `
<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Recuperación de contraseña</title>
  </head>
  <body style="margin:0;padding:0;background-color:#111111;font-family:Arial,Helvetica,sans-serif;color:#ffffff;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#111111;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#1F1F1F;border-radius:18px;overflow:hidden;border:1px solid #822727;">
            <tr>
              <td style="background:linear-gradient(135deg,#1F1F1F 0%,#2a1f1f 55%,#822727 100%);padding:36px 28px;">
                <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:1.2px;text-transform:uppercase;color:#ffffff;">Autorect</p>
                <h1 style="margin:0;font-size:30px;line-height:1.2;color:#ffffff;font-weight:700;">Recupera tu contraseña</h1>
                <p style="margin:14px 0 0 0;font-size:15px;line-height:1.7;color:#ffffff;max-width:520px;">
                  Usa este código para confirmar el cambio de contraseña de tu cuenta.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #822727;border-radius:14px;background:#1a1a1a;">
                  <tr>
                    <td align="center" style="padding:18px 16px 8px 16px;font-size:13px;color:#822727;font-weight:600;letter-spacing:.6px;text-transform:uppercase;">
                      Código de recuperación
                    </td>
                  </tr>
                  <tr>
                    <td align="center" style="padding:0 16px 18px 16px;">
                      <span style="display:inline-block;padding:10px 18px;font-size:30px;letter-spacing:4px;font-weight:700;color:#822727;background:#111111;border:1px dashed #822727;border-radius:10px;">
                        ${verificationCode}
                      </span>
                    </td>
                  </tr>
                </table>

                <div style="margin:20px 0 4px 0;text-align:center;">
                  <a
                    href="${otpUrl}"
                    style="display:inline-block;background:#822727;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:10px;font-size:14px;font-weight:700;"
                  >
                    Ir a restablecer contraseña
                  </a>
                </div>

                <p style="margin:18px 0 0 0;font-size:14px;line-height:1.7;color:#cccccc;">
                  Este código expira en 5 minutos por seguridad. Si tú no solicitaste este cambio, ignora este correo.
                </p>

                <p style="margin:10px 0 0 0;font-size:12px;line-height:1.6;color:#999999;word-break:break-all;">
                  Si el botón no funciona, copia y pega este enlace en tu navegador:<br />
                  <a href="${otpUrl}" style="color:#822727;text-decoration:underline;">${otpUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:26px 28px;background:#1a1a1a;border-top:1px solid #822727;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#999999;">
                  Este mensaje fue enviado automáticamente por Autorect.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

// crea el transporter de nodemailer con las credenciales configuradas
const createTransporter = (senderEmail, senderPassword) =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: senderEmail,
      pass: senderPassword,
    },
  });

export const sendVerificationEmail = async (
  senderEmail,
  senderPassword,
  recipientEmail,
  verificationCode,
  otpUrl,
) => {
  const transporter = createTransporter(senderEmail, senderPassword); // inicializamos transporte de correo

  const html = buildVerificationEmailHtml(verificationCode, otpUrl); // construimos contenido HTML de verificación

  const mailOptions = { // definimos payload del correo de verificación
    from: senderEmail,
    to: recipientEmail,
    subject: "Autorect | Verificación de cuenta",
    text: `Tu código de verificación es: ${verificationCode}. Expira en 5 minutos. Verifícalo en: ${otpUrl}`,
    html,
  };

  return transporter.sendMail(mailOptions); // enviamos correo y devolvemos promesa de envío
};

export const sendPasswordRecoveryEmail = async (
  senderEmail,
  senderPassword,
  recipientEmail,
  verificationCode,
  otpUrl,
) => {
  const transporter = createTransporter(senderEmail, senderPassword); // inicializamos transporte de correo
  const html = buildPasswordRecoveryEmailHtml(verificationCode, otpUrl); // construimos contenido HTML de recuperación

  const mailOptions = { // definimos payload del correo de recuperación
    from: senderEmail,
    to: recipientEmail,
    subject: "Autorect | Recuperación de contraseña",
    text: `Tu código de recuperación es: ${verificationCode}. Expira en 5 minutos. Restablece tu contraseña en: ${otpUrl}`,
    html,
  };

  return transporter.sendMail(mailOptions); // enviamos correo y devolvemos promesa de envío
};

