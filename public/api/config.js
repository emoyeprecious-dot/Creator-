// Public browser configuration only. Never return Supabase secret/service-role keys here.
module.exports = function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  const url =
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_PROJECT_URL ||
    "";
  const publishableKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";
  if (!url || !publishableKey) {
    res.statusCode = 503;
    return res.end(JSON.stringify({
      error: "Supabase public configuration is missing.",
      required: ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY"]
    }));
  }
  res.statusCode = 200;
  return res.end(JSON.stringify({ url, publishableKey }));
};
