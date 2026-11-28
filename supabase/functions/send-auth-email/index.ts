import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const APP_ORIGIN = "https://creator-ebitimimoyeprecious-4743.vercel.app";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "https://mevzzvpddflbduavwggo.supabase.co";

function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[char] ?? char));
}

function safeRedirect(value: string, realm: string): string {
  try {
    const candidate = new URL(value || "/auth/callback.html", APP_ORIGIN);
    if (candidate.origin !== APP_ORIGIN || candidate.pathname !== "/auth/callback.html") {
      throw new Error("Unapproved authentication redirect.");
    }
    const requestedRealm = candidate.searchParams.get("realm");
    if (requestedRealm && requestedRealm !== realm) {
      throw new Error("Authentication realm mismatch.");
    }
    candidate.searchParams.set("realm", realm);
    return candidate.toString();
  } catch {
    const fallback = new URL("/auth/callback.html", APP_ORIGIN);
    fallback.searchParams.set("realm", realm);
    return fallback.toString();
  }
}

function emailCopy(action: string, realm: string) {
  if (action === "recovery" || action === "reauthentication") {
    return {
      subject: "Reset your Dense password",
      heading: "Reset your password",
      message: "We received a request to secure your Dense account. Use the button below to continue. If you did not request this, you can safely ignore this email.",
      button: "Reset password",
      note: "For your security, this link can only be used once.",
    };
  }
  if (action === "email_change") {
    return {
      subject: "Confirm your new email address",
      heading: "Confirm your email",
      message: "Confirm this email address to finish updating your Dense account.",
      button: "Confirm email address",
      note: "If you did not request this change, you can safely ignore this email.",
    };
  }
  if (action === "magiclink") {
    return realm === "viewer" ? {
      subject: "Your Dense sign-in link",
      heading: "Continue to your creator page",
      message: "Use this secure link to sign in to Dense. After verification, you will return to the creator page you were visiting.",
      button: "Sign in and return to creator",
      note: "This secure link can only be used once.",
    } : {
      subject: "Your sign-in link for Dense",
      heading: "Sign in to Dense",
      message: "Use the secure link below to sign in to your Dense account.",
      button: "Sign in to Dense",
      note: "This secure link can only be used once.",
    };
  }
  if (realm === "admin") {
    return {
      subject: "Confirm your Dense administrator email",
      heading: "Confirm your administrator email",
      message: "Your administrator email is ready to be verified. After confirmation, you will be asked to set and confirm your administrator password again before entering the Admin Panel.",
      button: "Confirm email and set password",
      note: "Administrator access is only granted to accounts with an approved administrator role.",
    };
  }
  if (realm === "creator") {
    return {
      subject: "Welcome to Dense — confirm your email",
      heading: "Welcome to Dense",
      message: "Confirm your email address to activate your creator account. Once verified, you will be taken to your Creator Studio.",
      button: "Confirm email and open Creator Studio",
      note: "If you did not create this account, you can safely ignore this email.",
    };
  }
  return {
    subject: "Welcome to Dense — confirm your email",
    heading: "Welcome to Dense",
    message: "Confirm your email address to activate your viewer account. After confirmation, we will return you to the creator page you were visiting.",
    button: "Confirm email and return to creator",
    note: "If you did not create this account, you can safely ignore this email.",
  };
}

function renderEmail(name: string, action: ReturnType<typeof emailCopy>, url: string): string {
  const greeting = name ? `Hey there, ${escapeHtml(name)}.` : "Hey there.";
  const supportUrl = Deno.env.get("ARTISTIC_SUPPORT_URL");
  const instagram = Deno.env.get("ARTISTIC_INSTAGRAM_URL");
  const tiktok = Deno.env.get("ARTISTIC_TIKTOK_URL");
  const youtube = Deno.env.get("ARTISTIC_YOUTUBE_URL");
  const socials = [
    instagram ? `<a href="${escapeHtml(instagram)}" style="color:#77716e;text-decoration:none;margin-left:12px">Instagram</a>` : "",
    tiktok ? `<a href="${escapeHtml(tiktok)}" style="color:#77716e;text-decoration:none;margin-left:12px">TikTok</a>` : "",
    youtube ? `<a href="${escapeHtml(youtube)}" style="color:#77716e;text-decoration:none;margin-left:12px">YouTube</a>` : "",
  ].filter(Boolean).join("");
  const support = supportUrl
    ? `<a href="${escapeHtml(supportUrl)}" style="font-size:11px;color:#77716e;text-decoration:none;font-weight:600">Contact support</a>`
    : "";
  return `<!doctype html><html><body style="margin:0;padding:28px 12px;background:#f4f2ef;color:#292323;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:490px;margin:0 auto;background:#fff;border-collapse:separate;border-spacing:0">
    <tr><td style="padding:25px 28px 23px">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td style="vertical-align:middle;padding-right:8px"><svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 120 120"><g fill="none" stroke="#30252b" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 33 Q34 25 45 33"/><path d="M75 33 Q86 25 97 33"/><circle cx="34" cy="46" r="4.8" fill="#30252b" stroke="none"/><circle cx="86" cy="46" r="4.8" fill="#30252b" stroke="none"/><path d="M60 44 C60 58 60 69 57 76"/><circle cx="60" cy="94" r="7"/></g></svg></td>
        <td style="font-size:10px;font-weight:800;letter-spacing:2px;color:#30252b">DENSE</td>
      </tr></table>
      <h1 style="font-size:18px;line-height:1.3;font-weight:700;letter-spacing:-.3px;margin:25px 0 10px;color:#292323">${escapeHtml(action.heading)}</h1>
      <p style="font-size:13px;line-height:1.8;color:#77716e;margin:0">${greeting}<br>${escapeHtml(action.message)}</p>
      <p style="text-align:right;margin:24px 0 0"><a href="${escapeHtml(url)}" style="display:inline-block;background:#30252b;color:#fff;text-decoration:none;font-size:11px;font-weight:700;padding:11px 17px;border-radius:999px">${escapeHtml(action.button)} &nbsp;→</a></p>
      <p style="font-size:10.5px;line-height:1.7;color:#99918e;margin:20px 0 0">${escapeHtml(action.note)}</p>
    </td></tr>
    <tr><td style="border-top:1px solid #f0eeeb;background:#fcfbfa;padding:17px 28px 19px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>${support}</td><td style="text-align:right;font-size:10px">${socials}</td></tr></table>
      <p style="font-size:9px;color:#aaa29e;line-height:1.6;margin:13px 0 0">© 2026 Dense. All rights reserved.</p>
    </td></tr>
  </table></body></html>`;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed." }), {
      status: 405, headers: { "Content-Type": "application/json" },
    });
  }

  const resendKey = Deno.env.get("RESEND_API_KEY");
  const hookSecret = Deno.env.get("SEND_EMAIL_HOOK_SECRET")?.replace("v1,whsec_", "");
  const configuredFrom = Deno.env.get("RESEND_FROM_EMAIL") || "onboarding@resend.dev";
  const fromAddress = configuredFrom.match(/<([^>]+)>/)?.[1] || configuredFrom.trim();
  const from = `Dense <${fromAddress}>`;
  if (!resendKey || !hookSecret) {
    console.error("Missing RESEND_API_KEY or SEND_EMAIL_HOOK_SECRET.");
    return new Response(JSON.stringify({ error: "Email delivery is not configured." }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const raw = await req.text();
    const webhook = new Webhook(hookSecret);
    const payload = webhook.verify(raw, Object.fromEntries(req.headers)) as {
      user: { email?: string; user_metadata?: Record<string, unknown>; raw_user_meta_data?: Record<string, unknown> };
      email_data: {
        token_hash: string;
        redirect_to: string;
        email_action_type: string;
      };
    };

    const email = payload.user?.email;
    const tokenHash = payload.email_data?.token_hash;
    const emailAction = payload.email_data?.email_action_type;
    if (!email || !tokenHash || !emailAction) throw new Error("Required auth email fields are missing.");

    const requested = new URL(payload.email_data.redirect_to || APP_ORIGIN);
    const realmParam = requested.searchParams.get("realm");
    const meta = payload.user.user_metadata || payload.user.raw_user_meta_data || {};
    const metadataRealm = String(meta.account_type || "");
    const realm = realmParam || (["creator", "viewer", "admin"].includes(metadataRealm) ? metadataRealm : "viewer");
    if (!["creator", "viewer", "admin"].includes(realm)) throw new Error("Unknown account realm.");

    const redirectTo = safeRedirect(payload.email_data.redirect_to, realm);
    const verifyUrl = new URL("/auth/v1/verify", SUPABASE_URL);
    verifyUrl.searchParams.set("token", tokenHash);
    verifyUrl.searchParams.set("type", emailAction);
    verifyUrl.searchParams.set("redirect_to", redirectTo);

    const copy = emailCopy(emailAction, realm);
    const name = String(meta.display_name || meta.full_name || "").trim();
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Authorization": `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [email],
        subject: copy.subject,
        html: renderEmail(name, copy, verifyUrl.toString()),
      }),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Resend delivery failed:", response.status, result);
      return new Response(JSON.stringify({ error: "Email provider rejected the message." }), {
        status: 502, headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({}), {
      status: 200, headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Auth email hook failed:", error);
    return new Response(JSON.stringify({ error: "Unable to send authentication email." }), {
      status: 500, headers: { "Content-Type": "application/json" },
    });
  }
});
