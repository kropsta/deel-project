import nodemailer from 'nodemailer';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const {
        firstName,
        lastName,
        email,
        phone,
        interest,
        message,
    } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !phone || !interest) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Invalid email address.' });
    }

    const subjectLine = `New Lead from Andare Residences Live Stream — ${firstName} ${lastName}`;

    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Georgia, 'Times New Roman', serif; background: #f9f8f5; margin: 0; padding: 0; }
    .wrapper { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { background: #1a1a2e; padding: 36px 40px; text-align: center; }
    .header h1 { font-family: Georgia, serif; font-style: italic; font-size: 24px; color: #ffffff; margin: 0; letter-spacing: 0.03em; }
    .header p { font-family: Arial, sans-serif; font-size: 11px; color: #8FA8C8; letter-spacing: 0.2em; text-transform: uppercase; margin: 8px 0 0; }
    .body { padding: 40px; }
    .label { font-family: Arial, sans-serif; font-size: 10px; font-weight: bold; letter-spacing: 0.15em; text-transform: uppercase; color: #8FA8C8; margin-bottom: 4px; }
    .value { font-family: Georgia, serif; font-size: 16px; color: #1a1a2e; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #ede9e2; }
    .value:last-child { border-bottom: none; }
    .footer { background: #f5f3ef; padding: 24px 40px; text-align: center; }
    .footer p { font-family: Arial, sans-serif; font-size: 11px; color: #9ca3af; margin: 0; line-height: 1.6; }
    .tag { display: inline-block; background: #8FA8C8; color: #fff; font-size: 11px; padding: 4px 12px; font-family: Arial, sans-serif; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 24px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>Andare Residences</h1>
      <p>New Lead Submission</p>
    </div>
    <div class="body">
      <span class="tag">Live Stream Lead</span>
      <div class="label">Full Name</div>
      <div class="value">${firstName} ${lastName}</div>
      <div class="label">Email Address</div>
      <div class="value"><a href="mailto:${email}" style="color:#8FA8C8;">${email}</a></div>
      <div class="label">Phone Number</div>
      <div class="value"><a href="tel:${phone}" style="color:#8FA8C8;">${phone}</a></div>
      <div class="label">Residence Interest</div>
      <div class="value">${interest}</div>
      ${message ? `<div class="label">Message / Notes</div><div class="value" style="white-space:pre-wrap;">${message}</div>` : ''}
      <div class="label">Submitted At</div>
      <div class="value" style="font-size:13px; color:#6b7280;">${new Date().toLocaleString('en-US', { timeZone: 'America/New_York', dateStyle: 'full', timeStyle: 'short' })} ET</div>
    </div>
    <div class="footer">
      <p>This lead was submitted via the Andare Residences Live Stream landing page.<br>
      Sales Gallery: 788 E Las Olas Blvd, Fort Lauderdale, FL 33301 · (954) 799-9857</p>
    </div>
  </div>
</body>
</html>
  `.trim();

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        const recipients = [
            process.env.LEAD_EMAIL_1,
            process.env.LEAD_EMAIL_2,
        ].filter(Boolean).join(', ');

        if (!recipients) {
            console.error('No recipient emails configured. Set LEAD_EMAIL_1 and LEAD_EMAIL_2 in .env.local');
            return res.status(500).json({ error: 'Email recipients not configured.' });
        }

        await transporter.sendMail({
            from: `"Andare Residences Leads" <${process.env.SMTP_USER}>`,
            to: recipients,
            replyTo: email,
            subject: subjectLine,
            html: htmlBody,
        });

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Email send error:', err);
        return res.status(500).json({ error: 'Failed to send email. Please check server configuration.' });
    }
}
