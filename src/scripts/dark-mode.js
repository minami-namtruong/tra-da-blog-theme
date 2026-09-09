/* Zero-FOUC Dark Mode Switcher */
(function() {
  const currentTheme = localStorage.getItem("theme") || 
    (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", currentTheme);

  window.toggleTheme = function() {
    const active = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", active);
    localStorage.setItem("theme", active);
    updateThemeIcon();
  };

  function updateThemeIcon() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const btn = document.getElementById("theme-toggle-btn");
    if (btn) btn.innerHTML = isDark ? "☀️" : "🌙";
  }

  document.addEventListener("DOMContentLoaded", updateThemeIcon);
})();
