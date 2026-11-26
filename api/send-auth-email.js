const crypto = require("node:crypto");

const APP_ORIGIN = "https://subtled-platform.vercel.app";
const SUPABASE_URL = process.env.SUPABASE_URL || "https://mevzzvpddflbduavwggo.supabase.co";

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(body));
}
function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function safeRedirect(value, realm) {
  try {
    const u = new URL(value || "/auth/callback.html", APP_ORIGIN);
    if (u.origin !== APP_ORIGIN || u.pathname !== "/auth/callback.html") throw new Error("Invalid redirect");
    const requestedRealm = u.searchParams.get("realm");
    if (requestedRealm && requestedRealm !== realm) throw new Error("Realm mismatch");
    u.searchParams.set("realm", realm);
    return u.toString();
  } catch {
    const u = new URL("/auth/callback.html", APP_ORIGIN);
    u.searchParams.set("realm", realm);
    return u.toString();
  }
}
function emailCopy(action, realm) {
  if (action === "recovery" || action === "reauthentication") return {
    subject:"Reset your Subtled password", heading:"Reset your password",
    message:"We received a request to secure your Subtled account. Use the button below to continue. If you did not request this, you can safely ignore this email.",
    button:"Reset password", note:"For your security, this link can only be used once."
  };
  if (action === "email_change") return {
    subject:"Confirm your new email address", heading:"Confirm your email",
    message:"Confirm this email address to finish updating your Subtled account.",
    button:"Confirm email address", note:"If you did not request this change, you can safely ignore this email."
  };
  if (action === "magiclink") return realm === "viewer" ? {
    subject:"Your Subtled sign-in link", heading:"Continue to your creator page",
    message:"Use this secure link to sign in to Subtled. After verification, you will return to the creator page you were visiting.",
    button:"Sign in and return to creator", note:"This secure link can only be used once."
  } : {
    subject:"Your sign-in link for Subtled", heading:"Sign in to Subtled",
    message:"Use the secure link below to sign in to your Subtled account.",
    button:"Sign in to Subtled", note:"This secure link can only be used once."
  };
  if (realm === "admin") return {
    subject:"Confirm your Subtled administrator email", heading:"Confirm your administrator email",
    message:"Your administrator email is ready to be verified. After confirmation, you will be asked to set and confirm your administrator password again before entering the Admin Panel.",
    button:"Confirm email and set password", note:"Administrator access is only granted to accounts with an approved administrator role."
  };
  if (realm === "creator") return {
    subject:"Welcome to Subtled — confirm your email", heading:"Welcome to Subtled",
    message:"Confirm your email address to activate your creator account. Once verified, you will be taken to your Creator Studio.",
    button:"Confirm email and open Creator Studio", note:"If you did not create this account, you can safely ignore this email."
  };
  return {
    subject:"Welcome to Subtled — confirm your email", heading:"Welcome to Subtled",
    message:"Confirm your email address to activate your viewer account. After confirmation, we will return you to the creator page you were visiting.",
    button:"Confirm email and return to creator", note:"If you did not create this account, you can safely ignore this email."
  };
}
function renderEmail(name, copy, url) {
  const greeting = name ? "Hey there, " + escapeHtml(name) + "." : "Hey there.";
  const supportUrl = process.env.ARTISTIC_SUPPORT_URL;
  const socials = [
    process.env.ARTISTIC_INSTAGRAM_URL ? '<a href="' + escapeHtml(process.env.ARTISTIC_INSTAGRAM_URL) + '" style="color:#77716e;text-decoration:none;margin-left:12px">Instagram</a>' : "",
    process.env.ARTISTIC_TIKTOK_URL ? '<a href="' + escapeHtml(process.env.ARTISTIC_TIKTOK_URL) + '" style="color:#77716e;text-decoration:none;margin-left:12px">TikTok</a>' : "",
    process.env.ARTISTIC_YOUTUBE_URL ? '<a href="' + escapeHtml(process.env.ARTISTIC_YOUTUBE_URL) + '" style="color:#77716e;text-decoration:none;margin-left:12px">YouTube</a>' : ""
  ].filter(Boolean).join("");
  const support = supportUrl ? '<a href="' + escapeHtml(supportUrl) + '" style="font-size:11px;color:#77716e;text-decoration:none;font-weight:600">Contact support</a>' : "";
  return '<!doctype html><html><body style="margin:0;padding:28px 12px;background:#f4f2ef;color:#292323;font-family:Arial,Helvetica,sans-serif"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:490px;margin:0 auto;background:#fff;border-collapse:separate;border-spacing:0"><tr><td style="padding:25px 28px 23px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="vertical-align:middle;padding-right:8px"><svg xmlns="http://www.w3.org/2000/svg" width="34" height="34" viewBox="0 0 120 120"><g fill="none" stroke="#30252b" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 33 Q34 25 45 33"/><path d="M75 33 Q86 25 97 33"/><circle cx="34" cy="46" r="4.8" fill="#30252b" stroke="none"/><circle cx="86" cy="46" r="4.8" fill="#30252b" stroke="none"/><path d="M60 44 C60 58 60 69 57 76"/><circle cx="60" cy="94" r="7"/></g></svg></td><td style="font-size:10px;font-weight:800;letter-spacing:2px;color:#30252b">ARTISTIC</td></tr></table><h1 style="font-size:18px;line-height:1.3;font-weight:700;letter-spacing:-.3px;margin:25px 0 10px;color:#292323">' + escapeHtml(copy.heading) + '</h1><p style="font-size:13px;line-height:1.8;color:#77716e;margin:0">' + greeting + '<br>' + escapeHtml(copy.message) + '</p><p style="text-align:right;margin:24px 0 0"><a href="' + escapeHtml(url) + '" style="display:inline-block;background:#30252b;color:#fff;text-decoration:none;font-size:11px;font-weight:700;padding:11px 17px;border-radius:999px">' + escapeHtml(copy.button) + ' &nbsp;→</a></p><p style="font-size:10.5px;line-height:1.7;color:#99918e;margin:20px 0 0">' + escapeHtml(copy.note) + '</p></td></tr><tr><td style="border-top:1px solid #f0eeeb;background:#fcfbfa;padding:17px 28px 19px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td>' + support + '</td><td style="text-align:right;font-size:10px">' + socials + '</td></tr></table><p style="font-size:9px;color:#aaa29e;line-height:1.6;margin:13px 0 0">© 2026 Subtled. All rights reserved.</p></td></tr></table></body></html>';
}
async function readBody(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 1024 * 1024) throw new Error("Payload too large");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}
function verifyWebhook(raw, headers, secret) {
  const id = headers["webhook-id"], timestamp = headers["webhook-timestamp"], signature = headers["webhook-signature"];
  if (!id || !timestamp || !signature) throw new Error("Missing webhook signature headers");
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds) || Math.abs(Date.now()/1000 - seconds) > 300) throw new Error("Webhook timestamp outside tolerance");
  const encoded = secret.replace(/^v1,whsec_/, "").replace(/^whsec_/, "");
  const key = Buffer.from(encoded, "base64");
  const expected = crypto.createHmac("sha256", key).update(id + "." + timestamp + "." + raw).digest("base64");
  const valid = signature.split(" ").some(part => {
    const [version, value] = part.split(",", 2);
    if (version !== "v1" || !value) return false;
    const a = Buffer.from(value), b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
  if (!valid) throw new Error("Invalid webhook signature");
}
module.exports = async function handler(req, res) {
  if (req.method === "GET") return json(res, 200, {
    service:"subtled-auth-email", resendConfigured:!!process.env.RESEND_API_KEY,
    hookSecretConfigured:!!process.env.SEND_EMAIL_HOOK_SECRET
  });
  if (req.method !== "POST") return json(res, 405, {error:"Method not allowed"});
  const resendKey = process.env.RESEND_API_KEY;
  const hookSecret = process.env.SEND_EMAIL_HOOK_SECRET;
  if (!resendKey || !hookSecret) return json(res, 500, {error:"Email delivery is not configured"});
  try {
    const raw = await readBody(req);
    verifyWebhook(raw, req.headers, hookSecret);
    const payload = JSON.parse(raw);
    const email = payload.user?.email;
    const tokenHash = payload.email_data?.token_hash;
    const emailAction = payload.email_data?.email_action_type;
    if (!email || !tokenHash || !emailAction) throw new Error("Required auth email fields are missing");
    const requested = new URL(payload.email_data.redirect_to || APP_ORIGIN);
    const realmParam = requested.searchParams.get("realm");
    const meta = payload.user.user_metadata || payload.user.raw_user_meta_data || {};
    const metadataRealm = String(meta.account_type || "");
    const realm = realmParam || (["creator","viewer","admin"].includes(metadataRealm) ? metadataRealm : "viewer");
    if (!["creator","viewer","admin"].includes(realm)) throw new Error("Unknown account realm");
    const redirectTo = safeRedirect(payload.email_data.redirect_to, realm);
    const verifyUrl = new URL("/auth/v1/verify", SUPABASE_URL);
    verifyUrl.searchParams.set("token", tokenHash);
    verifyUrl.searchParams.set("type", emailAction);
    verifyUrl.searchParams.set("redirect_to", redirectTo);
    const copy = emailCopy(emailAction, realm);
    const name = String(meta.display_name || meta.full_name || "").trim();
    const response = await fetch("https://api.resend.com/emails", {
      method:"POST", headers:{Authorization:"Bearer " + resendKey, "Content-Type":"application/json"},
      body:JSON.stringify({from:process.env.RESEND_FROM_EMAIL || "Subtled <onboarding@resend.dev>",to:[email],subject:copy.subject,html:renderEmail(name,copy,verifyUrl.toString())})
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("Resend delivery failed", response.status, result);
      return json(res, 502, {error:"Email provider rejected the message"});
    }
    return json(res, 200, {});
  } catch (error) {
    console.error("Auth email hook failed", error);
    return json(res, 400, {error:"Unable to send authentication email"});
  }
};
module.exports.config = { api: { bodyParser: false } };
