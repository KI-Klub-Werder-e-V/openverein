import PDFDocument from 'pdfkit';
import { MANDATE_TEXT } from '../../shared/applications.ts';
import { formatDate } from '../../shared/dates.ts';
import { decrypt, maskIban } from '../crypto.ts';
import type { Db } from '../db.ts';
import { Problem } from '../http/problem.ts';
import { FONT, FONT_BOLD } from '../invoices/pdf.ts';
import { personLines } from '../invoices/service.ts';
import { orgToday } from '../members/query.ts';

const mm = (v: number) => (v * 72) / 25.4;
const INK = '#14202e';
const MUTED = '#5f6874';

export interface MandateForm {
  memberId: string;
  personId: string;
  membershipNumber: string;
  name: string;
  /** first name, or the name of an organisation */
  firstName: string;
  email: string | null;
  preferredChannel: 'email' | 'letter' | 'none';
  postalCode: string | null;
  /** address block of the letter (the member) */
  recipientLines: string[];
  /** pre-filled account holder: the holder of the current mandate, otherwise the member */
  holder: { name: string; street: string; place: string };
}

export interface MandateFormOrg {
  name: string;
  street: string | null;
  postalCode: string | null;
  city: string | null;
  email: string | null;
  creditorId: string;
  isDemo: boolean;
  today: string;
}

/** The club's data for the form; refused without a creditor ID, since a mandate without it is not valid. */
export async function mandateFormOrg(db: Db, organizationId: string): Promise<MandateFormOrg> {
  const o = await db.selectFrom('organization').select(['name', 'street', 'postal_code', 'city', 'email', 'creditor_id', 'is_demo']).where('id', '=', organizationId).executeTakeFirstOrThrow();
  if (!o.creditor_id) throw new Problem(409, 'creditor-id-missing', 'Für Mandatsformular und Mitteilung fehlt die Gläubiger-ID des Vereins.', 'Trage sie unter Einstellungen → Verein ein.');
  return { name: o.name, street: o.street, postalCode: o.postal_code, city: o.city, email: o.email, creditorId: o.creditor_id, isDemo: o.is_demo, today: await orgToday(db, organizationId) };
}

/** Members (already checked for access by the caller) with what the form and the channel split need. */
export async function mandateForms(db: Db, organizationId: string, memberIds: string[]): Promise<MandateForm[]> {
  if (!memberIds.length) return [];
  const rows = await db.selectFrom('member').innerJoin('person', 'person.id', 'member.person_id')
    .select(['member.id', 'member.person_id', 'member.membership_number', 'person.kind', 'person.first_name', 'person.last_name', 'person.company_name', 'person.street', 'person.postal_code', 'person.city', 'person.country', 'person.email', 'person.preferred_channel'])
    .where('member.organization_id', '=', organizationId).where('member.id', 'in', memberIds).orderBy('member.membership_number').execute();
  const mandates = await currentMandates(db, organizationId, rows.map((r) => r.person_id));
  return rows.map((r) => {
    const { name, lines } = personLines(r);
    const place = [r.postal_code, r.city].filter(Boolean).join(' ');
    return {
      memberId: r.id,
      personId: r.person_id,
      membershipNumber: r.membership_number,
      name,
      firstName: r.first_name ?? name,
      email: r.email,
      preferredChannel: r.preferred_channel,
      postalCode: r.postal_code,
      recipientLines: lines,
      holder: { name: mandates.find((m) => m.person_id === r.person_id)?.account_holder ?? name, street: r.street ?? '', place },
    };
  });
}

export interface MandateNotice extends MandateForm {
  mandate: { reference: string; accountHolder: string; ibanMasked: string; signedOn: string };
}

/** The current mandate (active or awaiting the signed copy) of each person, newest first. */
async function currentMandates(db: Db, organizationId: string, personIds: string[]) {
  if (!personIds.length) return [];
  return db.selectFrom('sepa_mandate').select(['person_id', 'reference', 'account_holder', 'iban_encrypted', 'signed_on']).where('organization_id', '=', organizationId)
    .where('person_id', 'in', personIds).where('status', 'in', ['active', 'pending_evidence']).orderBy('created_at', 'desc').execute();
}

/** Members with their current mandate, for telling them its data; members without one are left out. */
export async function mandateNotices(db: Db, organizationId: string, memberIds: string[]): Promise<MandateNotice[]> {
  const forms = await mandateForms(db, organizationId, memberIds);
  const mandates = await currentMandates(db, organizationId, forms.map((f) => f.personId));
  return forms.flatMap((f) => {
    const m = mandates.find((x) => x.person_id === f.personId);
    return m ? [{ ...f, mandate: { reference: m.reference, accountHolder: m.account_holder, ibanMasked: maskIban(decrypt(m.iban_encrypted)), signedOn: m.signed_on } }] : [];
  });
}

/** Letterhead, sender line, address window and date block as on invoices (DIN 5008 form B); returns the document. */
function letter(org: MandateFormOrg, f: MandateForm, title: string) {
  const doc = new PDFDocument({ size: 'A4', margins: { top: mm(20), left: mm(25), right: mm(20), bottom: mm(15) }, info: { Title: `${title} ${f.name}`, Author: org.name } });
  doc.registerFont('text', FONT);
  doc.registerFont('bold', FONT_BOLD);
  const chunks: Buffer[] = [];
  doc.on('data', (c: Buffer) => chunks.push(c));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });
  const left = mm(25);
  const right = doc.page.width - mm(20);
  const width = right - left;
  const place = [org.postalCode, org.city].filter(Boolean).join(' ');
  if (org.isDemo) {
    doc.save().rotate(-35, { origin: [doc.page.width / 2, doc.page.height / 2] }).font('bold').fontSize(80).fillColor('#f2c230').opacity(0.25)
      .text('DEMO', 0, doc.page.height / 2 - 60, { width: doc.page.width, align: 'center' }).restore().opacity(1);
  }
  doc.font('bold').fontSize(13).fillColor(INK).text(org.name, left, mm(15), { width, align: 'right' });
  doc.font('text').fontSize(7).fillColor(MUTED).text([org.name, org.street, place].filter(Boolean).join(' · '), mm(20), mm(47), { width: mm(85), lineBreak: false, ellipsis: true });
  doc.font('text').fontSize(10).fillColor(INK).text(f.recipientLines.join('\n'), mm(20), mm(53), { width: mm(85) });
  let y = mm(50);
  for (const [k, v] of [['Datum', formatDate(org.today)], ['Mitgliedsnummer', f.membershipNumber]]) {
    doc.font('text').fontSize(9).fillColor(MUTED).text(k!, mm(125), y, { width: mm(30) });
    doc.font('text').fontSize(9).fillColor(INK).text(v!, mm(155), y, { width: right - mm(155), align: 'right' });
    y += 13;
  }
  doc.font('bold').fontSize(15).fillColor(INK).text(title, left, mm(100), { width });
  return { doc, done, left, right, width, address: [org.street, place].filter(Boolean).join(', ') };
}

/** Label and value rows in two columns, starting at y; returns the y below the last row. */
function facts(doc: PDFKit.PDFDocument, left: number, width: number, y: number, rows: [string, string][]) {
  for (const [k, v] of rows) {
    doc.font('text').fontSize(8).fillColor(MUTED).text(k, left, y + 1, { width: mm(45) });
    doc.font('text').fontSize(10).fillColor(INK).text(v, left + mm(47), y, { width: width - mm(47) });
    y = doc.y + 4;
  }
  return y;
}

/**
 * Tells the member the data of their mandate: payee, creditor ID, mandate reference, account holder, the IBAN
 * masked except for its last four digits, and the signing date.
 */
export function renderMandateNotice(org: MandateFormOrg, f: MandateNotice): Promise<Buffer> {
  const { doc, done, left, width, address } = letter(org, f, 'Dein SEPA-Lastschriftmandat');
  doc.moveDown(0.6).font('text').fontSize(10).fillColor(INK).text(`Hallo ${f.firstName},`, { width }).moveDown(0.5).text('wir ziehen Deine Beiträge per SEPA-Lastschrift ein. Hier sind die Angaben zu Deinem Mandat; bitte bewahre sie auf. Vor jeder Lastschrift kündigen wir Dir Betrag und Datum an.', { width, lineGap: 1.5 });
  const y = facts(doc, left, width, doc.y + 14, [
    ['Zahlungsempfänger', [org.name, address].filter(Boolean).join(', ')],
    ['Gläubiger-ID', org.creditorId],
    ['Mandatsreferenz', f.mandate.reference],
    ['Kontoinhaber:in', f.mandate.accountHolder],
    ['IBAN', f.mandate.ibanMasked],
    ['Unterschrieben am', formatDate(f.mandate.signedOn)],
    ['Zahlungsart', 'Wiederkehrende Zahlung'],
  ]);
  doc.font('text').fontSize(10).fillColor(INK).text(`Stimmt etwas nicht oder hat sich Deine Bankverbindung geändert? Dann melde Dich bitte bei uns${org.email ? `: ${org.email}` : '.'}`, left, y + 14, { width, lineGap: 1.5 });
  doc.moveDown(1.5).text(`Viele Grüße\n${org.name}`, { width });
  doc.end();
  return done;
}

/**
 * The mandate form on a DIN 5008 letter (window envelope, form B): payee with creditor ID, the member, the mandate
 * text and fields to fill in. No IBAN and no mandate reference: the reference comes with the pre-notification.
 */
export function renderMandateForm(org: MandateFormOrg, f: MandateForm): Promise<Buffer> {
  const { doc, done, left, right, width, address } = letter(org, f, 'SEPA-Lastschriftmandat');
  doc.moveDown(0.3).font('text').fontSize(10).text('Bitte trag Deine Bankverbindung ein, unterschreib das Formular und schick es an uns zurück.', { width });

  facts(doc, left, width, doc.y + 12, [
    ['Zahlungsempfänger', [org.name, address].filter(Boolean).join(', ')],
    ['Gläubiger-ID', org.creditorId],
    ['Mandatsreferenz', 'teilen wir Dir vor der ersten Lastschrift mit'],
    ['Mitglied', `${f.name}, Mitgliedsnummer ${f.membershipNumber}`],
    ['Zahlungsart', 'Wiederkehrende Zahlung'],
  ]);

  doc.font('text').fontSize(9).fillColor(INK).text(MANDATE_TEXT(org.name, null), left, doc.y + 12, { width, lineGap: 1.5 });

  // Fields: a line with a small caption below, pre-filled where we know the value.
  const line = (x: number, yy: number, w: number, caption: string, text = '') => {
    if (text) doc.font('text').fontSize(10.5).fillColor(INK).text(text, x + 2, yy - 13, { width: w - 4, lineBreak: false, ellipsis: true });
    doc.moveTo(x, yy).lineTo(x + w, yy).lineWidth(0.5).strokeColor(INK).stroke();
    doc.font('text').fontSize(7.5).fillColor(MUTED).text(caption, x, yy + 2, { width: w });
  };
  let y = doc.y + 30;
  line(left, y, width, 'Kontoinhaber:in (Vorname, Name)', f.holder.name);
  y += 32;
  line(left, y, width * 0.58, 'Straße und Hausnummer', f.holder.street);
  line(left + width * 0.62, y, width * 0.38, 'Postleitzahl und Ort', f.holder.place);
  y += 32;
  line(left, y, width * 0.58, 'Kreditinstitut');
  line(left + width * 0.62, y, width * 0.38, 'BIC (bei deutschen Konten nicht nötig)');

  // IBAN: 22 boxes for a German IBAN, in groups of four.
  y += 22;
  const box = mm(6.2);
  const gap = mm(1.6);
  let x = left;
  for (let i = 0; i < 22; i++) {
    if (i > 0 && i % 4 === 0) x += gap;
    doc.rect(x, y, box, box).lineWidth(0.5).strokeColor(INK).stroke();
    x += box;
  }
  doc.font('text').fontSize(7.5).fillColor(MUTED).text('IBAN', left, y + box + 2, { width });

  y += box + 44;
  line(left, y, width * 0.4, 'Ort, Datum');
  line(left + width * 0.48, y, width * 0.52, 'Unterschrift Kontoinhaber:in');
  doc.font('text').fontSize(8.5).fillColor(MUTED).text('Gehört das Konto einer anderen Person, trag bitte deren Namen und Anschrift ein; sie unterschreibt dann.', left, y + 18, { width });

  // Return address at the foot of the page.
  const foot = doc.page.height - mm(30);
  doc.moveTo(left, foot).lineTo(right, foot).lineWidth(0.5).strokeColor('#b4b9b0').stroke();
  doc.font('bold').fontSize(9).fillColor(INK).text('Bitte unterschrieben zurück an', left, foot + 6, { width });
  doc.font('text').fontSize(9).fillColor(INK).text([org.name, address, org.email].filter(Boolean).join(' · '), left, doc.y + 1, { width });
  doc.end();
  return done;
}
