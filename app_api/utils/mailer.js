const nodemailer = require('nodemailer');

// Ако SMTP не е конфигуриран, пораките се „праќаат“ во JSON форма и се печатат во конзолата.
let transporter;
function getTransporter() {
  if (transporter) return transporter;
  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
  } else {
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }
  return transporter;
}

/**
 * Испраќа е-пошта. Грешката при праќање не го прекинува барањето – само се запишува во конзолата.
 * @param {string|string[]} to
 * @param {string} subject
 * @param {string} text
 */
async function sendMail(to, subject, text) {
  const recipients = Array.isArray(to) ? to.filter(Boolean) : [to];
  if (!recipients.length) return;
  try {
    await getTransporter().sendMail({
      from: process.env.MAIL_FROM || 'ВрвТура <no-reply@vrvtura.mk>',
      bcc: recipients.length > 1 ? recipients : undefined,
      to: recipients.length === 1 ? recipients[0] : undefined,
      subject,
      text: `${text}\n\n— Тимот на ВрвТура`,
    });
    if (!process.env.SMTP_HOST) console.log(`[е-пошта] до ${recipients.join(', ')}: ${subject}`);
  } catch (err) {
    console.error('[е-пошта] грешка:', err.message);
  }
}

module.exports = { sendMail };
