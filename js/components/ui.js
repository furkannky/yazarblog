// Global UI Component Injections, Toast Notifications, and Scroll Animators
import { toggleTheme } from './theme.js';
import { dbService } from '../firebase/config.js';

export function showToast(message, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
    <span class="toast-close">&times;</span>
  `;

  container.appendChild(toast);

  // Animate Entrance
  setTimeout(() => toast.classList.add("show"), 10);

  // Self Dismissal
  const dismissTimeout = setTimeout(() => dismiss(), 4000);

  function dismiss() {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }

  toast.querySelector(".toast-close").addEventListener("click", () => {
    clearTimeout(dismissTimeout);
    dismiss();
  });
}

// Inject global website Header
export async function injectHeader(activePage = "") {
  const header = document.querySelector(".site-header");
  if (!header) return;

  // Set active nav link if present
  const links = header.querySelectorAll(".nav-links a");
  links.forEach(a => {
    if (a.getAttribute("href").includes(activePage) && activePage !== "") {
      a.classList.add("active");
    } else if (activePage === "home" && a.getAttribute("href") === "/index.html") {
      a.classList.add("active");
    } else {
      a.classList.remove("active");
    }
  });

  // Bind toggles if not bound yet
  if (!header.dataset.bound) {
    const themeBtn = header.querySelector(".theme-toggle-btn");
    const menuBtn = header.querySelector(".menu-toggle");
    const navLinks = header.querySelector(".nav-links");

    if (themeBtn) {
      themeBtn.addEventListener("click", () => {
        toggleTheme();
      });
    }
    
    if (menuBtn && navLinks) {
      const navOverlay = document.createElement("div");
      navOverlay.className = "nav-overlay";
      document.body.appendChild(navOverlay);

      const toggleMenu = () => {
        navLinks.classList.toggle("active");
        navOverlay.classList.toggle("active");
        document.body.style.overflow = navLinks.classList.contains("active") ? "hidden" : "";
      };
      
      menuBtn.addEventListener("click", toggleMenu);
      navOverlay.addEventListener("click", toggleMenu);
    }
    header.dataset.bound = "true";
  }

  // Trigger visual toggle configuration
  const savedTheme = localStorage.getItem("site_theme") || "light";
  document.documentElement.setAttribute("data-theme", savedTheme);
  
  // Re-run this check to populate icon correctly
  const buttons = document.querySelectorAll(".theme-toggle-btn");
  buttons.forEach(btn => {
    if (savedTheme === "dark") {
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`;
    } else {
      btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>`;
    }
  });
}

// Inject global website Footer
export async function injectFooter() {
  const footer = document.querySelector(".site-footer");
  if (!footer) return;
}
// Footer is now hardcoded in HTML
// Global scroll observers & reading statistics trackers
export function initScrollEffects() {
  // Back to Top Button
  const btn = document.createElement("button");
  btn.className = "back-to-top";
  btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>`;
  btn.setAttribute("aria-label", "Scroll to top");
  document.body.appendChild(btn);

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Reading progress indicators
  const pBarContainer = document.createElement("div");
  pBarContainer.className = "progress-bar-container";
  const pBar = document.createElement("div");
  pBar.className = "progress-bar";
  pBarContainer.appendChild(pBar);
  document.body.appendChild(pBarContainer);

  window.addEventListener("scroll", () => {
    // Show back-to-top
    if (window.scrollY > 400) {
      btn.classList.add("show");
    } else {
      btn.classList.remove("show");
    }

    // Update progress bar width
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (totalHeight > 0) {
      const scrolled = (window.scrollY / totalHeight) * 100;
      pBar.style.width = `${scrolled}%`;
    }
  });

  // Scroll Animations helper
  const animateOnScroll = () => {
    const elements = document.querySelectorAll(".scroll-trigger");
    elements.forEach(el => {
      const position = el.getBoundingClientRect().top;
      const screenHeight = window.innerHeight;

      if (position < screenHeight - 60) {
        el.classList.add("visible");
      }
    });
  };

  window.addEventListener("scroll", animateOnScroll);
  setTimeout(animateOnScroll, 100);
}

// Skeletons creation utils
export function createGridSkeleton(parentIdentifier, count = 3, type = "card") {
  const parent = document.querySelector(parentIdentifier);
  if (!parent) return;

  parent.innerHTML = Array(count).fill(0).map(() => {
    if (type === "card") {
      return `
        <div class="card skeleton-card" style="border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 1.5rem; display:flex; flex-direction:column; gap: 1rem;">
          <div class="skeleton skeleton-image" style="height: 180px; border-radius: var(--radius-sm);"></div>
          <div class="skeleton skeleton-title" style="width: 70%; height: 20px;"></div>
          <div class="skeleton skeleton-text" style="width: 90%;"></div>
          <div class="skeleton skeleton-text" style="width: 80%;"></div>
        </div>
      `;
    } else if (type === "pdf") {
      return `
        <div class="card skeleton-pdf" style="padding:1.5rem; display:flex; gap:1.5rem; align-items:center; border:1px solid var(--border-color); border-radius: var(--radius-md);">
          <div class="skeleton" style="width: 48px; height: 48px; border-radius: 4px;"></div>
          <div style="flex-grow:1; display:flex; flex-direction:column; gap:0.5rem;">
            <div class="skeleton skeleton-title" style="width: 60%; height: 16px; margin:0;"></div>
            <div class="skeleton skeleton-text" style="width: 30%; height: 10px; margin:0;"></div>
          </div>
        </div>
      `;
    }
    return "";
  }).join('');
}
