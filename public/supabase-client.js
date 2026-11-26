(function () {
  const state = { client: null, error: null, clients: Object.create(null), config: null };
  window.creatorSupabase = state;
  window.creatorSupabaseFor = async function (realm) {
    const allowed = ["admin", "creator", "viewer"];
    if (!allowed.includes(realm)) throw new Error("Unknown account area.");
    if (state.clients[realm]) return state.clients[realm];
    if (!state.config) {
      const response = await fetch("/api/config", { cache: "no-store", headers: { Accept: "application/json" } });
      const raw = await response.text();
      let config;
      try {
        config = JSON.parse(raw);
      } catch (_) {
        throw new Error("The backend configuration endpoint did not return JSON (HTTP " + response.status + "). Please refresh shortly; if this continues, the deployment API route needs attention.");
      }
      if (!response.ok) throw new Error(config.error || ("Unable to load backend configuration (HTTP " + response.status + ")."));
      if (!config || typeof config.url !== "string" || typeof config.publishableKey !== "string" || !config.url || !config.publishableKey) {
        throw new Error("Backend configuration is incomplete. Check the Supabase URL and publishable key in Vercel.");
      }
      if (!window.supabase || typeof window.supabase.createClient !== "function") {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
          script.onload = resolve;
          script.onerror = () => reject(new Error("Supabase client library could not be loaded."));
          document.head.appendChild(script);
        });
      }
      state.config = config;
    }
    const instance = window.supabase.createClient(state.config.url, state.config.publishableKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: location.pathname !== "/auth/callback.html",
        storageKey: "subtled-auth-" + realm + "-v1"
      }
    });
    state.clients[realm] = instance;
    if (realm === "admin") state.admin = instance;
    if (realm === "creator") state.creator = instance;
    if (realm === "viewer") state.viewer = instance;
    return instance;
  };
  const path = location.pathname;
  const realm = path === "/admin.html" ? "admin" :
    (path === "/creator-signup.html" || path === "/creator-studio.html" ? "creator" :
    (path === "/auth/callback.html" ? (new URLSearchParams(location.search).get("realm") || "viewer") : "viewer"));
  window.creatorSupabaseReady = window.creatorSupabaseFor(realm).then(client => {
    state.client = client;
    window.supabaseClient = client;
    window.dispatchEvent(new CustomEvent("creator:supabase-ready", { detail: client }));
    return client;
  }).catch(error => {
    state.error = error;
    console.error("[Creator Platform] Supabase initialization failed:", error);
    window.dispatchEvent(new CustomEvent("creator:supabase-error", { detail: error }));
    throw error;
  });
})();