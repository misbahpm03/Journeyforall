/* Sends one message through EmailJS's public REST endpoint — no SDK.
   The template can use {{message}}, {{from_name}}, {{recipient}},
   {{sent_at}} and {{page_url}}. */
export type EmailjsIds = { serviceId: string; templateId: string; publicKey: string };

export const emailjsReady = (ids: EmailjsIds) => !!(ids.serviceId && ids.templateId && ids.publicKey);

export async function sendMessage(ids: EmailjsIds, params: { message: string; from_name: string; recipient: string }) {
  const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      service_id: ids.serviceId,
      template_id: ids.templateId,
      user_id: ids.publicKey,
      template_params: { ...params, sent_at: new Date().toLocaleString(), page_url: location.href },
    }),
  });
  if (!res.ok) throw new Error((await res.text()) || `EmailJS ${res.status}`);
}
