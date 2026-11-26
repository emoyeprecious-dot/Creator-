(() => {
  let installPrompt = null;
  let button = null;
  const isInstalled = () => window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
  const mount = () => {
    if (button || isInstalled()) return;
    button = document.createElement("button");
    button.type = "button";
    button.textContent = "Install app";
    button.setAttribute("aria-label", "Install this app");
    button.style.cssText = "position:fixed;right:16px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:99999;border:0;border-radius:999px;padding:12px 18px;background:#2b2026;color:#fff;font:600 13px Urbanist,system-ui,sans-serif;box-shadow:0 5px 22px #0003;cursor:pointer;display:none";
    button.addEventListener("click", async () => {
      if (!installPrompt) return;
      button.disabled = true;
      try {
        installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice?.outcome === "accepted" || choice?.outcome === "dismissed") button.remove();
      } catch (_) {}
      installPrompt = null;
      if (button?.isConnected) button.disabled = false;
    });
    document.body.appendChild(button);
  };
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    installPrompt = event;
    if (!button) mount();
    if (button && !isInstalled()) button.style.display = "block";
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null;
    if (button) button.remove();
    button = null;
  });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount, { once: true });
  else mount();
})();
