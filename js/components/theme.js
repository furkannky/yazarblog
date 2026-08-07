// Dark / Light Mode System Coordinator (Notion/Stripe Inspired Minimal Theme Manager)

export function initTheme() {
  const savedTheme = localStorage.getItem("site_theme");
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  
  const theme = savedTheme || (prefersDark ? "dark" : "light");
  setTheme(theme);
}

export function setTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("site_theme", theme);
  updateToggleButtons(theme);
}

export function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute("data-theme") || "light";
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  setTheme(newTheme);
  return newTheme;
}

function updateToggleButtons(theme) {
  const buttons = document.querySelectorAll(".theme-toggle-btn");
  buttons.forEach(btn => {
    if (theme === "dark") {
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
      btn.setAttribute("aria-label", "Switch to Light Mode");
    } else {
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
      btn.setAttribute("aria-label", "Switch to Dark Mode");
    }
  });
}

// Automatically listen for system theme changes if user hasn't explicitly set one
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
  if (!localStorage.getItem("site_theme")) {
    setTheme(e.matches ? "dark" : "light");
  }
});
