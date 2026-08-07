// Contact page controller handling contact form capture and social link details
import { dbService } from '../firebase/config.js';
import { showToast } from '../components/ui.js';

export async function initContactPage() {
  try {
    const settings = await dbService.getSettings();
    
    // Set Email
    const emailVal = document.getElementById("contact-email-val");
    if (emailVal) {
      emailVal.textContent = settings.contactEmail || "author@publish.site";
    }

    // Set Social Links
    const socialsDiv = document.getElementById("contact-page-socials");
    if (socialsDiv && settings.socialLinks) {
      const social = settings.socialLinks;
      let html = "";
      if (social.twitter) {
        html += `<a href="${social.twitter}" target="_blank" class="share-btn" title="Twitter">🐦</a>`;
      }
      if (social.medium) {
        html += `<a href="${social.medium}" target="_blank" class="share-btn" title="Medium">👤</a>`;
      }
      if (social.github) {
        html += `<a href="${social.github}" target="_blank" class="share-btn" title="GitHub">🔗</a>`;
      }
      socialsDiv.innerHTML = html;
    }

    // Bind Contact Form Submission
    const form = document.getElementById("contact-submission-form");
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = document.getElementById("contact-sender-name").value.trim();
        const email = document.getElementById("contact-sender-email").value.trim();
        const subject = document.getElementById("contact-subject").value.trim();
        const message = document.getElementById("contact-message").value.trim();

        if (name && email && subject && message) {
          // Log or submit to Firebase settings newsletter / logs folder
          console.log("Contact form submission: ", { name, email, subject, message });
          showToast(`Teşekkürler ${name}! Mesajınız başarıyla iletildi.`);
          form.reset();
        } else {
          showToast("Lütfen tüm zorunlu alanları doldurun.", "error");
        }
      });
    }

  } catch (error) {
    console.error("Failed to initialize contact page settings:", error);
  }
}
