import nodemailer from 'nodemailer';

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function sendAdminEmail(opts: {
  applicationId: string;
  adminToken: string;
  subjectName: string;
  nipt: string;
  subjectEmail: string;
  repName: string;
  submittedAt: string;
}) {
  const adminUrl = `${process.env.NEXT_PUBLIC_APP_URL}/admin/${opts.adminToken}`;
  await createTransport().sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `[AKKC] Aplikim i ri - ${opts.applicationId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px">
        <div style="background:#5c4b8c;color:#fff;padding:16px 24px">
          <h2 style="margin:0">Aplikim i ri – AKKC</h2>
        </div>
        <div style="padding:24px">
          <table cellpadding="6" style="border-collapse:collapse;width:100%;font-size:14px">
            <tr><td style="color:#666;width:160px">ID:</td><td><strong>${opts.applicationId}</strong></td></tr>
            <tr><td style="color:#666">Subjekti:</td><td>${opts.subjectName}</td></tr>
            <tr><td style="color:#666">NUIS/NIPT:</td><td>${opts.nipt}</td></tr>
            <tr><td style="color:#666">E-mail:</td><td>${opts.subjectEmail}</td></tr>
            <tr><td style="color:#666">Përfaqësuesi:</td><td>${opts.repName}</td></tr>
            <tr><td style="color:#666">Data:</td><td>${opts.submittedAt}</td></tr>
          </table>
          <div style="margin-top:24px">
            <a href="${adminUrl}"
               style="background:#5c4b8c;color:#fff;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block">
              Shiko aplikimin e plotë
            </a>
          </div>
          <p style="color:#888;font-size:12px;margin-top:24px">
            SHËNIM: Ky link është konfidencial. Mos e ndani me persona të paautorizuar.<br>
            ${adminUrl}
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendInquiryEmail(opts: {
  inquiryId: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  applicationId?: string;
  submittedAt: string;
}) {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  await createTransport().sendMail({
    from: process.env.SMTP_FROM,
    to: process.env.ADMIN_EMAIL,
    replyTo: opts.email,
    subject: `[AKKC] Pyetje/kërkesë - ${opts.subject}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px">
        <div style="background:#009b93;color:#fff;padding:16px 24px">
          <h2 style="margin:0">Pyetje/kërkesë e re – AKKC</h2>
        </div>
        <div style="padding:24px">
          <table cellpadding="6" style="border-collapse:collapse;width:100%;font-size:14px">
            <tr><td style="color:#666;width:160px">ID:</td><td><strong>${opts.inquiryId}</strong></td></tr>
            <tr><td style="color:#666">E-mail:</td><td>${esc(opts.email)}</td></tr>
            <tr><td style="color:#666">Kategoria:</td><td>${esc(opts.category)}</td></tr>
            <tr><td style="color:#666">Subjekti:</td><td>${esc(opts.subject)}</td></tr>
            ${opts.applicationId ? `<tr><td style="color:#666">Aplikimi:</td><td>${esc(opts.applicationId)}</td></tr>` : ''}
            <tr><td style="color:#666">Data:</td><td>${opts.submittedAt}</td></tr>
          </table>
          <div style="margin-top:16px;padding:14px;background:#f5f3f8;border-left:4px solid #009b93;border-radius:0 6px 6px 0">
            <div style="color:#666;font-size:12px;margin-bottom:6px">Pyetja/kërkesa:</div>
            <div style="white-space:pre-wrap;font-size:14px">${esc(opts.message)}</div>
          </div>
          <p style="color:#888;font-size:12px;margin-top:20px">
            Për t'iu përgjigjur, përdorni butonin "Reply" – do të dërgohet te ${esc(opts.email)}.
          </p>
        </div>
      </div>
    `,
  });
}

export async function sendApplicantEmail(opts: {
  applicationId: string;
  repFirstName: string;
  repLastName: string;
  subjectEmail: string;
  submittedAt: string;
}) {
  await createTransport().sendMail({
    from: process.env.SMTP_FROM,
    to: opts.subjectEmail,
    subject: `Konfirmim i aplikimit - ${opts.applicationId}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px">
        <div style="background:#5c4b8c;color:#fff;padding:16px 24px">
          <h2 style="margin:0">Konfirmim i aplikimit – AKKC</h2>
        </div>
        <div style="padding:24px">
          <p>I/E nderuar <strong>${opts.repFirstName} ${opts.repLastName}</strong>,</p>
          <p>
            Aplikimi juaj pranë Agjencisë Kombëtare të Kontrollit të Cannabis-it
            është regjistruar me sukses.
          </p>
          <table cellpadding="6" style="border-collapse:collapse;width:100%;font-size:14px">
            <tr><td style="color:#666;width:180px">ID i aplikimit:</td><td><strong>${opts.applicationId}</strong></td></tr>
            <tr><td style="color:#666">Data e dorëzimit:</td><td>${opts.submittedAt}</td></tr>
          </table>
          <p style="margin-top:20px">
            Aplikimi juaj do të shqyrtohet nga stafi i AKKC.<br>
            <strong>Dorëzimi i aplikimit nuk nënkupton miratim të licencës.</strong>
          </p>
          <p>Për çdo pyetje kontaktoni: <a href="mailto:info@nacc.gov.al">info@nacc.gov.al</a></p>
          <p style="color:#666">
            Me respekt,<br>
            Agjencia Kombëtare e Kontrollit të Cannabis-it
          </p>
        </div>
      </div>
    `,
  });
}
