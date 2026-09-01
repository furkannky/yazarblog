// Site settings configuration dashboard controller (read/write config values, form bindings)
import { injectAdminStructure } from './admin-layout.js';
import { dbService } from '/js/firebase/config.js';
import { showToast } from '/js/components/ui.js';

// Initialize Guard & Sidebar
await injectAdminStructure("settings");

const form = document.getElementById("settings-form");

async function loadSettings() {
  try {
    const settings = await dbService.getSettings();
    
    document.getElementById("setting-logo-text").value = settings.logoText || "";
    document.getElementById("setting-contact-email").value = settings.contactEmail || "";
    document.getElementById("setting-banner-title").value = settings.bannerTitle || "";
    document.getElementById("setting-banner-subtitle").value = settings.bannerSubtitle || "";
    document.getElementById("setting-footer-text").value = settings.footerText || "";
    
    if (settings.socialLinks) {
      document.getElementById("setting-social-twitter").value = settings.socialLinks.twitter || "";
      document.getElementById("setting-social-medium").value = settings.socialLinks.medium || "";
      document.getElementById("setting-social-github").value = settings.socialLinks.github || "";
    }
    
    document.getElementById("setting-analytics-id").value = settings.analyticsId || "";

  } catch (err) {
    showToast("Site ayarları yüklenirken hata oluştu.", "error");
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const logoText = document.getElementById("setting-logo-text").value.trim();
  const contactEmail = document.getElementById("setting-contact-email").value.trim();
  const bannerTitle = document.getElementById("setting-banner-title").value.trim();
  const bannerSubtitle = document.getElementById("setting-banner-subtitle").value.trim();
  const footerText = document.getElementById("setting-footer-text").value.trim();
  
  const twitter = document.getElementById("setting-social-twitter").value.trim();
  const medium = document.getElementById("setting-social-medium").value.trim();
  const github = document.getElementById("setting-social-github").value.trim();

  const analyticsId = document.getElementById("setting-analytics-id").value.trim();

  const updatedSettings = {
    logoText,
    contactEmail,
    bannerTitle,
    bannerSubtitle,
    footerText,
    socialLinks: { twitter, medium, github },
    analyticsId
  };

  try {
    await dbService.updateSettings(updatedSettings);
    showToast("Tercihler başarıyla kaydedildi!");
  } catch (err) {
    showToast("Kaydedilemedi: " + (err.message || err), "error");
    console.error(err);
  }
});

// Run load
await loadSettings();
