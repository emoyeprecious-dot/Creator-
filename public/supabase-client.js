(function () {
  const state = { client: null, error: null };
  window.creatorSupabase = state;
  window.creatorSupabaseReady = (async function () {
    try {
      const response = await fetch("/api/config", { cache: "no-store" });
      const config = await response.json();
      if (!response.ok) throw new Error(config.error || "Unable to load backend configuration.");
      if (!window.supabase || typeof window.supabase.createClient !== "function") {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";
          script.onload = resolve;
          script.onerror = () => reject(new Error("Supabase client library could not be loaded."));
          document.head.appendChild(script);
        });
      }
      state.client = window.supabase.createClient(config.url, config.publishableKey, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
      });
      window.supabaseClient = state.client;
      window.dispatchEvent(new CustomEvent("creator:supabase-ready", { detail: state.client }));
      return state.client;
    } catch (error) {
      state.error = error;
      console.error("[Creator Platform] Supabase initialization failed:", error);
      window.dispatchEvent(new CustomEvent("creator:supabase-error", { detail: error }));
      throw error;
    }
  })();
})();
