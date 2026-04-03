import html2pdf from 'html2pdf.js';
import signatureUrl from '@/certificate-templates/signature.png';
import governmentLogoUrl from '@/certificate-templates/government_logo.png';

interface CertificateData {
  _id: string;
  certificateId?: string;
  applicantName: string;
  certificateType: string;
  appliedAt: string | Date;
  blockchainHash?: string;
  details?: any;
  [key: string]: any;
}

/* ─── shared CSS (optimized for precise A4 PDF printing) ─── */
const sharedCSS = `
@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&family=Inter:wght@400;700&display=swap');

* { margin: 0; padding: 0; box-sizing: border-box; }

.certificate-page {
  width: 210mm;
  height: 297mm;
  background: #ffffff;
  padding: 20mm 25mm !important; 
  position: relative;
  font-family: 'Merriweather', serif;
  color: #1a1a1a;
  font-size: 14px;
  line-height: 1.6;
}

.certificate-page::before {
  content: '';
  position: absolute;
  top: 8mm; left: 8mm; right: 8mm; bottom: 8mm;
  border: 2px solid var(--cert-color, #2c5f2d);
  pointer-events: none;
}

.certificate-page::after {
  content: '';
  position: absolute;
  top: 10mm; left: 10mm; right: 10mm; bottom: 10mm;
  border: 1px solid var(--cert-color, #2c5f2d);
  opacity: 0.3;
  pointer-events: none;
}

.cert-header { 
  text-align: center; 
  margin-bottom: 8mm; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  border-bottom: 2px solid #eee;
  padding-bottom: 5mm;
}

.gov-logo { height: 30mm; margin-bottom: 4mm; }

.dept-name { 
  font-size: 24px; 
  font-weight: 700; 
  text-transform: uppercase; 
  letter-spacing: 2.5px; 
  color: #333;
  margin-bottom: 2px;
}

.dept-sub { 
  font-size: 14px; 
  font-weight: 400; 
  text-transform: uppercase; 
  letter-spacing: 1.5px; 
  color: #666; 
}

.cert-title {
  font-size: 32px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 4px;
  color: var(--cert-color, #1b3a1b);
  margin: 12mm 0;
  text-align: center;
  position: relative;
}

.cert-title::after {
  content: '';
  display: block;
  width: 60mm;
  height: 1px;
  background: var(--cert-color, #1b3a1b);
  margin: 3mm auto 0;
  opacity: 0.5;
}

.cert-meta { 
  display: flex; 
  justify-content: space-between; 
  margin-bottom: 12mm; 
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  border-bottom: 1px dashed #ccc;
  padding-bottom: 5mm;
}

.meta-item { display: flex; align-items: baseline; gap: 8px; }
.meta-label { font-weight: 700; color: #555; text-transform: uppercase; font-size: 11px; }
.meta-value { font-weight: 700; color: #000; font-size: 14px; }

.cert-body-text {
  margin-bottom: 10mm;
  font-size: 16px;
  line-height: 1.8;
  text-align: justify;
  color: #333;
}

.cert-details { 
  width: 100%; 
  border-collapse: separate; 
  border-spacing: 0 4mm;
  margin: 5mm 0 15mm;
}

.label-cell { 
  width: 40%; 
  font-weight: 700; 
  color: #555;
  font-size: 14px;
  vertical-align: top;
  padding-right: 4mm;
}

.separator-cell { 
  width: 5%; 
  text-align: center; 
  font-weight: 700; 
  color: #888;
  vertical-align: top;
}

.value-cell { 
  width: 55%; 
  color: #000; 
  font-weight: 400;
  font-size: 15px;
  vertical-align: top;
}

.cert-footer { 
  position: absolute; 
  bottom: 30mm; 
  right: 25mm; 
  width: 70mm; 
  display: flex;
  flex-direction: column;
  align-items: center;
}

.cert-signature { 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  width: 100%;
}

.sig-image { 
  height: 18mm; 
  object-fit: contain; 
}

.sig-line { 
  width: 100%; 
  border-top: 1px solid #333; 
  margin: 2mm 0; 
}

.sig-name { 
  font-size: 14px; 
  font-weight: 700; 
  color: #000;
  margin-top: 2px;
}

.sig-title { 
  font-size: 11px; 
  text-transform: uppercase; 
  letter-spacing: 1px; 
  color: #666; 
  font-weight: 400;
}

.cert-digital-note { 
  position: absolute; 
  bottom: 10mm; 
  left: 20mm; 
  right: 20mm; 
  text-align: center; 
  font-size: 10px; 
  color: #888; 
  font-style: italic;
  border-top: 1px solid #eee;
  padding-top: 3mm;
}
`;

/* ─── color per certificate type ─── */
const CERT_COLORS: Record<string, string> = {
  birth: '#2c5f2d',
  death: '#3a3a3a',
  income: '#1a3a5c',
  marriage: '#6b1d2a',
  caste: '#4a5320',
  community: '#4a5320',
  domicile: '#1a3a5c',
};

/* ─── readable title per type ─── */
const CERT_TITLES: Record<string, string> = {
  birth: 'Birth Certificate',
  death: 'Death Certificate',
  income: 'Income Certificate',
  marriage: 'Marriage Certificate',
  caste: 'Community Certificate',
  community: 'Community Certificate',
  domicile: 'Domicile Certificate',
};

/* ─── build a detail row ─── */
function row(label: string, value: string): string {
  return `<tr><td class="label-cell">${label}</td><td class="separator-cell">:</td><td class="value-cell">${value || '—'}</td></tr>`;
}

/* ─── build certificate body text ─── */
function bodyText(type: string, data: CertificateData): string {
  const name = data.applicantName || '—';
  switch (type) {
    case 'birth':
      return `This is to certify that the birth of <strong>${name}</strong> has been duly registered in the official repository of the Certificate Department, State Government. The precise details of the birth, as registered according to the vital records act, are authentically presented below.`;
    case 'death':
      return `This is to certify that the death of <strong>${name}</strong> has been duly registered in the official repository of the Certificate Department, State Government. The details of the deceased, as registered according to the vital records act, are authentically presented below.`;
    case 'income':
      return `This is to certify that <strong>${name}</strong>, whose personal particulars are enumerated below, possesses an annual income as officially assessed. This formal attestation is issued upon extensive verification of the available revenue records.`;
    case 'marriage':
      return `This is to certify that the solemnized marriage involving <strong>${name}</strong> has been officially inscribed in the marriage registry of the Certificate Department, State Government. The verified details of the marital union are presented below.`;
    case 'caste':
    case 'community':
      return `This is to certify that <strong>${name}</strong>, whose details are rigorously verified and given below, legitimately belongs to the designated community/caste. This formal attestation is issued in adherence to the established state government records.`;
    default:
      return `This is an official certification that <strong>${name}</strong> is documented in the central repository of the Certificate Department, State Government.`;
  }
}

/* ─── build detail rows per type ─── */
function detailRows(type: string, data: CertificateData): string {
  const name = data.applicantName || '—';
  const d = data.details || data; // use dynamic details object if present
  switch (type) {
    case 'birth':
      return [
        row('Full Name of Child', name),
        row('Date of Birth', d.dateOfBirth || '—'),
        row('Place of Birth', d.placeOfBirth || '—'),
        row('Sex', d.sex || '—'),
        row("Father's Name", d.fatherName || '—'),
        row("Mother's Name", d.motherName || '—'),
        row('Permanent Address', d.address || '—'),
      ].join('');
    case 'death':
      return [
        row('Full Name of Deceased', name),
        row('Date of Death', d.dateOfDeath || '—'),
        row('Place of Death', d.placeOfDeath || '—'),
        row('Cause of Death', d.causeOfDeath || '—'),
        row('Sex', d.sex || '—'),
        row("Father's / Husband's Name", d.fatherOrHusbandName || '—'),
        row('Permanent Address', d.address || '—'),
      ].join('');
    case 'income':
      return [
        row('Full Name', name),
        row("Father's / Husband's Name", d.fatherOrHusbandName || '—'),
        row('Annual Income', d.annualIncome ? `₹ ${d.annualIncome}` : '—'),
        row('Source of Income', d.sourceOfIncome || '—'),
        row('Permanent Address', d.address || '—'),
        row('Purpose', d.purpose || '—'),
      ].join('');
    case 'marriage':
      return [
        row("Groom's Name", d.groomName || name),
        row("Bride's Name", d.brideName || '—'),
        row('Date of Marriage', d.dateOfMarriage || '—'),
        row('Venue of Marriage', d.venueOfMarriage || '—'),
      ].join('');
    case 'caste':
    case 'community':
      return [
        row('Full Name', name),
        row("Father's / Mother's Name", d.parentName || d.fatherName || '—'),
        row('Community / Caste', d.community || d.caste || '—'),
        row('Sub-Caste', d.subCaste || '—'),
        row('Permanent Address', d.address || '—'),
      ].join('');
    default:
      return row('Full Name', name);
  }
}

/* ═══════════════════════════════════════════
   Main export – generates and downloads PDF
   ═══════════════════════════════════════════ */
export async function generateCertificatePDF(cert: CertificateData): Promise<void> {
  const type = cert.certificateType.toLowerCase();
  const color = CERT_COLORS[type] || '#2c5f2d';
  const title = CERT_TITLES[type] || 'Certificate';
  const issueDate = new Date(cert.appliedAt).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const html = `
    <div class="certificate-page" style="--cert-color:${color}">
      <style>${sharedCSS}</style>

      <div class="cert-header">
        <img class="gov-logo" src="${governmentLogoUrl}" alt="Government Logo" />
        <div class="dept-name">State Government</div>
        <div class="dept-sub">Certificate Department</div>
      </div>

      <div class="cert-title">${title}</div>

      <div class="cert-meta">
        <div class="meta-item">
          <span class="meta-label">Certificate No.:</span>
          <span class="meta-value">${cert.certificateId || cert._id}</span>
        </div>
        <div class="meta-item">
          <span class="meta-label">Date of Issue:</span>
          <span class="meta-value">${issueDate}</span>
        </div>
      </div>

      <div class="cert-body-text">
        ${bodyText(type, cert)}
      </div>

      <table class="cert-details">
        ${detailRows(type, cert)}
      </table>

      <div class="cert-footer">
        <div class="cert-signature">
          <img class="sig-image" src="${signatureUrl}" alt="Signature" />
          <div class="sig-line"></div>
          <div class="sig-name">Authorised Officer</div>
          <div class="sig-title">Authorised Signatory</div>
        </div>
      </div>

      <div class="cert-digital-note">
        This is a digitally generated certificate. Any tampering or alteration will render it invalid.
        ${cert.blockchainHash ? `<br/>Digital Fingerprint: <span style="font-family:monospace; font-size:9px;">${cert.blockchainHash}</span>` : ''}
      </div>
    </div>
  `;

  const container = document.createElement('div');
  // Position offscreen so it doesn't mess up the UI, but it still maintains standard document flow for accurate canvas rendering
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '-9999px';
  container.innerHTML = html;
  document.body.appendChild(container);

  const options = {
    margin: 0,
    filename: `${title.replace(/\s+/g, '_')}_${cert.certificateId || cert._id}.pdf`,
    image: { type: 'jpeg' as const, quality: 1.0 },
    html2canvas: {
      scale: 3, // High resolution for clear text
      useCORS: true,
      letterRendering: true,
      windowWidth: 1024, // Fix viewport rendering issues
      backgroundColor: '#ffffff'
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
  };

  try {
    // Give external fonts via @import a moment to load if needed
    await new Promise(res => setTimeout(res, 300));
    await html2pdf().set(options).from(container.firstElementChild as HTMLElement).save();
  } finally {
    document.body.removeChild(container);
  }
}
