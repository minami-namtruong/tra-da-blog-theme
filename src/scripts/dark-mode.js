/* Zero-FOUC Multi-Theme Switcher (Light / Dark / Airy Pastel) */
(function() {
  const THEMES = ["light", "dark", "airy-pastel"];
  const THEME_CONFIG = {
    "light": {
      icon: "☀️",
      name: "Giao diện Sáng",
      nextTheme: "dark",
      nextName: "Tối"
    },
    "dark": {
      icon: "🌙",
      name: "Giao diện Tối",
      nextTheme: "airy-pastel",
      nextName: "Xanh Mint"
    },
    "airy-pastel": {
      icon: "🍃",
      name: "Giao diện Xanh Mint",
      nextTheme: "light",
      nextName: "Sáng"
    }
  };

  const savedTheme = localStorage.getItem("theme");
  const initialTheme = THEMES.includes(savedTheme)
    ? savedTheme
    : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

  document.documentElement.setAttribute("data-theme", initialTheme);

  window.toggleTheme = function() {
    const active = document.documentElement.getAttribute("data-theme") || "light";
    const currentIndex = THEMES.indexOf(active);
    const nextTheme = THEMES[(currentIndex + 1) % THEMES.length];

    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("theme", nextTheme);
    updateThemeIcon();
  };

  function updateThemeIcon() {
    const active = document.documentElement.getAttribute("data-theme") || "light";
    const config = THEME_CONFIG[active] || THEME_CONFIG["light"];
    const btn = document.getElementById("theme-toggle-btn");
    if (btn) {
      btn.innerHTML = config.icon;
      btn.setAttribute("title", config.name + " (Click để chuyển sang " + config.nextName + ")");
      btn.setAttribute("aria-label", "Đổi giao diện: hiện tại " + config.name + ", chuyển sang " + config.nextName);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateThemeIcon);
  } else {
    updateThemeIcon();
  }
})();
