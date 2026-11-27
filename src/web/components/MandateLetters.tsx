import { useState, type MouseEvent, type ReactNode } from 'react';
import { Link } from 'react-router';
import { api, ApiError } from '../lib/api.ts';

/** request: the form to fill in and sign; notice: the data of the current mandate (reference, creditor ID, masked IBAN). */
export type MandateLetterKind = 'request' | 'notice';

const PATH: Record<MandateLetterKind, string> = { request: 'mandate-forms', notice: 'mandate-notices' };
const MAIL: Record<MandateLetterKind, [one: string, many: string]> = {
  request: ['Eine E-Mail mit dem Mandatsformular ist', 'E-Mails mit dem Mandatsformular sind'],
  notice: ['Eine E-Mail mit den Mandatsdaten ist', 'E-Mails mit den Mandatsdaten sind'],
};

interface Result { messageId: string | null; sent: number; alreadyQueued: number; toPrint: { memberId: string; name: string; reason: string }[]; withoutMandate: { memberId: string; name: string }[] }

/** Fetches a PDF and saves it under the server's file name; a refusal comes back as an ApiError. */
export async function downloadPdf(path: string, body?: unknown) {
  const res = await fetch(path, body === undefined ? { credentials: 'same-origin' } : { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), credentials: 'same-origin' });
  if (!res.ok) throw new ApiError(await res.json());
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement('a');
  a.href = url;
  a.download = /filename="([^"]+)"/.exec(res.headers.get('content-disposition') ?? '')?.[1] ?? 'SEPA-Mandat.pdf';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export const problemText = (err: unknown) => (err instanceof ApiError ? [err.problem.title, err.problem.detail].filter(Boolean).join(' ') : 'Das hat nicht geklappt.');

/** Closes the surrounding disclosure menu (native details) after an item was chosen. */
export const closeMenu = (e: MouseEvent<HTMLElement>) => e.currentTarget.closest('details')?.removeAttribute('open');

/** The "SEPA-Mandat" disclosure menu; its items are buttons. */
export function MandateMenu({ end = false, children }: { end?: boolean; children: ReactNode }) {
  return (
    <details className={end ? 'menu menu-end' : 'menu'}>
      <summary className="btn btn-ghost">SEPA-Mandat</summary>
      <div className="menu-list">{children}</div>
    </details>
  );
}

/**
 * Asks members for a mandate (the form) or tells them its data, by e-mail or, for several members, as one PDF to
 * print. Those who prefer letters or have no address end up on a print list. Starts at the confirmation step.
 */
export function MandateLetters({ kind, memberIds, prompt, canMail, onClose }: { kind: MandateLetterKind; memberIds: string[]; prompt: string; canMail: boolean; onClose: () => void }) {
  const [busy, setBusy] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [result, setResult] = useState<Result>();
  const [error, setError] = useState<string>();

  // One PDF for all letters, sorted by postal code and padded for duplex printing.
  async function print(ids: string[]) {
    setPrinting(true);
    setError(undefined);
    try {
      await downloadPdf(`/api/v1/${PATH[kind]}/letters.pdf`, { memberIds: ids });
    } catch (err) {
      setError(problemText(err));
    } finally {
      setPrinting(false);
    }
  }

  async function send() {
    setBusy(true);
    setError(undefined);
    try {
      setResult(await api<Result>(`/${PATH[kind]}/send`, { method: 'POST', body: { memberIds } }));
    } catch (err) {
      setError(problemText(err));
    } finally {
      setBusy(false);
    }
  }

  const errorLine = error && <div role="alert" className="alert alert-error" style={{ marginTop: 'var(--s-2)', marginBottom: 0 }}>{error}</div>;
  if (result) {
    const [one, many] = MAIL[kind];
    return (
      <div role="status">
        <span>{result.sent > 0 ? <>{result.sent === 1 ? one : `${result.sent} ${many}`} unterwegs (<Link to={`/kommunikation/${result.messageId}`}>Zustellung</Link>).</> : 'Keine E-Mail verschickt.'}</span>
        {result.alreadyQueued > 0 && <div className="meta">{result.alreadyQueued === 1 ? 'Eine E-Mail wartet' : `${result.alreadyQueued} E-Mails warten`} noch auf den Versand, diesmal ausgelassen.</div>}
        {result.withoutMandate.length > 0 && <div className="meta">Ohne Mandat, nichts verschickt: {result.withoutMandate.map((m) => m.name).join(', ')}</div>}
        {result.toPrint.length > 0 && (
          <div className="meta" style={{ marginTop: 'var(--s-1)' }}>
            Als Brief drucken: {result.toPrint.map((p) => `${p.name} (${p.reason})`).join(', ')}
            <div style={{ marginTop: 'var(--s-2)' }}>
              <button className="btn" aria-busy={printing} disabled={printing} onClick={() => void print(result.toPrint.map((p) => p.memberId))}>
                {result.toPrint.length === 1 ? 'Brief als PDF' : `Alle ${result.toPrint.length} Briefe als ein PDF`}
              </button>
            </div>
          </div>
        )}
        <div style={{ marginTop: 'var(--s-2)' }}><button className="btn btn-ghost" onClick={onClose}>Schließen</button></div>
        {errorLine}
      </div>
    );
  }
  return (
    <div>
      <span className="actions-inline">
        <span>{prompt}</span>
        {canMail && <button className="btn btn-primary" aria-busy={busy} disabled={busy} onClick={() => void send()}>Per E-Mail senden</button>}
        {memberIds.length > 1 && <button className="btn" aria-busy={printing} disabled={printing} onClick={() => void print(memberIds)}>Alle als PDF drucken</button>}
        <button className="btn btn-ghost" onClick={onClose}>Abbrechen</button>
      </span>
      {canMail && <div className="meta">Wer Briefe bevorzugt oder keine E-Mail-Adresse hat, kommt auf eine Druckliste.{kind === 'notice' && ' Mitglieder ohne Mandat werden ausgelassen.'}</div>}
      {errorLine}
    </div>
  );
}
