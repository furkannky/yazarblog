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

  const settingsList = await dbService.getSettings();
  const logoText = settingsList.logoText || "A. Author";

  header.innerHTML = `
    <div class="container nav-container">
      <a href="/index.html" class="logo">
        ${logoText}
      </a>
      <ul class="nav-links">
        <li><a href="/index.html" class="${activePage === 'home' ? 'active' : ''}">Ana Sayfa</a></li>
        <li><a href="/books.html" class="${activePage === 'books' ? 'active' : ''}">Kitaplar</a></li>
        <li><a href="/articles.html" class="${activePage === 'articles' ? 'active' : ''}">Yazılar</a></li>
        <li><a href="/news.html" class="${activePage === 'news' ? 'active' : ''}">Haberler</a></li>
        <li><a href="/about.html" class="${activePage === 'about' ? 'active' : ''}">Hakkında</a></li>
        <li><a href="/contact.html" class="${activePage === 'contact' ? 'active' : ''}">İletişim</a></li>
      </ul>
      <div class="nav-actions">
        <button class="theme-toggle-btn" aria-label="Toggle Theme"></button>
        <button class="menu-toggle" aria-label="Toggle Menu">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
      </div>
    </div>
  `;

  // Mobile Menu Toggler
  const menuToggle = header.querySelector(".menu-toggle");
  const navLinks = header.querySelector(".nav-links");
  
  // Create overlay for mobile menu
  const navOverlay = document.createElement("div");
  navOverlay.className = "nav-overlay";
  document.body.appendChild(navOverlay);
  
  if (menuToggle && navLinks) {
    const toggleMenu = () => {
      navLinks.classList.toggle("active");
      navOverlay.classList.toggle("active");
      document.body.style.overflow = navLinks.classList.contains("active") ? "hidden" : "";
    };
    
    menuToggle.addEventListener("click", toggleMenu);
    
    // Close menu when clicking overlay
    navOverlay.addEventListener("click", toggleMenu);
    
    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (navLinks.classList.contains("active") &&
          !navLinks.contains(e.target) &&
          !menuToggle.contains(e.target) &&
          !navOverlay.contains(e.target)) {
        toggleMenu();
      }
    });
    
    // Close menu on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navLinks.classList.contains("active")) {
        toggleMenu();
      }
    });
  }

  // Theme Toggler
  const themeBtn = header.querySelector(".theme-toggle-btn");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      toggleTheme();
    });
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

  const settingsList = await dbService.getSettings();
  const logoText = settingsList.logoText || "A. Author";
  const footerText = settingsList.footerText || `© ${new Date().getFullYear()} ${logoText}. Tüm hakları saklıdır.`;
  const social = settingsList.socialLinks || {};

  footer.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div class="footer-col">
          <a href="/index.html" class="logo">
            ${logoText}
          </a>
          <p style="margin-top: 1rem; color: var(--text-secondary); font-size: 0.9rem;">
            Tarih araştırmaları, kuantum dünyasının sınırları ve modern edebiyata dair derinlemesine denemeler içeren yayın portalı.
          </p>
          <div class="footer-socials">
            ${social.twitter ? `<a href="${social.twitter}" target="_blank" aria-label="Twitter"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg></a>` : ''}
            ${social.medium ? `<a href="${social.medium}" target="_blank" aria-label="Medium"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 12c-2.2 0-4-3.58-4-8s1.8-8 4-8 4 3.58 4 8-1.8 8-4 8zM20 12c-1.1 0-2-3.13-2-7s.9-7 2-7 2 3.13 2 7-.9 7-2 7zM4 12c.55 0 1-2.68 1-6s-.45-6-1-6-1 2.68-1 6 .45 6 1 6z"/></svg></a>` : ''}
            ${social.github ? `<a href="${social.github}" target="_blank" aria-label="GitHub"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/></svg></a>` : ''}
          </div>
        </div>
        <div class="footer-col">
          <h4>Keşfet</h4>
          <ul>
            <li><a href="/index.html">Ana Sayfa</a></li>
            <li><a href="/about.html">Yazar Hakkında</a></li>
            <li><a href="/articles.html">Bütün Yazılar</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Kaynaklar</h4>
          <ul>
            <li><a href="/books.html">Kitaplar</a></li>
            <li><a href="/news.html">Haberler</a></li>
            <li><a href="/contact.html">İletişim</a></li>
          </ul>
        </div>
        <div class="footer-col">
          <h4>Yönetim</h4>
          <ul>
            <li><a href="/admin/login.html">Panel Girişi</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>${footerText}</span>
        <a href="#top" style="font-size: 0.85rem; display: inline-flex; align-items: center; gap: 0.25rem;">
          Yukarı Dön &uarr;
        </a>
      </div>
    </div>
  `;
}

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
