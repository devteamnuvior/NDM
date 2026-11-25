/**
 * Tells Google Tag Manager that a lead was saved: the same `popupFormSubmit` event the old WordPress site's
 * forms pushed (plugins ndm-forms and ndm-popup-subscribe), which the container's "form_lead_submission"
 * tag waits for. Push it only after the server saved the request, and never anything the visitor typed
 * (PHIPA): which form, and a few words about the choice they made.
 *
 * `then` runs once Tag Manager has sent its tags (its `eventCallback`), or after `waitMs` when Tag Manager
 * is not on the page or does not answer, so a page change right after the push does not cut the tag off.
 */
export function pushLead(formId: string, extra: Record<string, string> = {}, then?: () => void, waitMs = 1200): void {
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  w.dataLayer = w.dataLayer || [];
  if (!then) {
    w.dataLayer.push({ event: "popupFormSubmit", formId, formType: "ajax", status: "success", ...extra });
    return;
  }
  let done = false;
  const go = () => {
    if (done) return;
    done = true;
    then();
  };
  w.dataLayer.push({ event: "popupFormSubmit", formId, formType: "ajax", status: "success", ...extra, eventCallback: go, eventTimeout: waitMs });
  window.setTimeout(go, waitMs + 200);
}
