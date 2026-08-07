// Profile Center dashboard controller (passwords modification, avatar uploading, session details, and 2FA key setup)
import { injectAdminStructure } from './admin-layout.js';
import { authService, storageService } from '/js/firebase/config.js';
import { showToast } from '/js/components/ui.js';

// Initialize Guard & Sidebar
await injectAdminStructure("profile");

const accountForm = document.getElementById("profile-account-form");
const securityForm = document.getElementById("profile-security-form");
const avatarInput = document.getElementById("profile-avatar-input");
const btnPickAvatar = document.getElementById("btn-pick-avatar");
const avatarUrlInput = document.getElementById("profile-avatar-url");
const avatarPreview = document.getElementById("profile-avatar-preview");

// 2FA details
const mfaBtn = document.getElementById("btn-toggle-mfa");
const mfaModal = document.getElementById("mfa-setup-modal");
const mfaCodeInput = document.getElementById("mfa-code-input");
const btnMfaCancel = document.getElementById("btn-mfa-cancel");
const btnMfaConfirm = document.getElementById("btn-mfa-confirm");

let is2faEnabled = false;

function loadUserProfile() {
  const user = authService.getCurrentUser();
  if (!user) return;

  document.getElementById("profile-email").value = user.email || "";

  if (user.avatar) {
    avatarUrlInput.value = user.avatar;
    avatarPreview.src = user.avatar;
    avatarPreview.style.display = "block";
  }

  // Read mock 2FA status from memory configuration session
  const stored2FA = localStorage.getItem("admin_2fa_enabled");
  if (stored2FA === "true") {
    is2faEnabled = true;
    mfaBtn.textContent = "2FA Devre Dışı Bırak";
    mfaBtn.style.backgroundColor = "var(--danger)";
    mfaBtn.style.color = "white";
    mfaBtn.style.border = "none";
  }
}

// Bind Avatar Pick File
btnPickAvatar.addEventListener("click", () => avatarInput.click());
avatarInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      showToast("Profil resmi yükleniyor...");
      const url = await storageService.uploadFile(file, "avatars");
      avatarUrlInput.value = url;
      avatarPreview.src = url;
      avatarPreview.style.display = "block";
      showToast("Profil resmi yüklendi!");
    } catch (err) {
      showToast("Profil resmi yüklenemedi.", "error");
    }
  }
});

avatarUrlInput.addEventListener("input", (e) => {
  const url = e.target.value.trim();
  if (url) {
    avatarPreview.src = url;
    avatarPreview.style.display = "block";
  } else {
    avatarPreview.style.display = "none";
  }
});

// Save Profile Info details
accountForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const avatarUrl = avatarUrlInput.value.trim();

  try {
    await authService.updateAvatar(avatarUrl);
    showToast("Profil ayarları başarıyla kaydedildi!");
  } catch (err) {
    showToast("Profil güncellenemedi.", "error");
  }
});

// Save Security password changes
securityForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const newPass = document.getElementById("profile-new-password").value.trim();
  const confirmPass = document.getElementById("profile-confirm-password").value.trim();

  if (newPass !== confirmPass) {
    showToast("Şifreler eşleşmiyor.", "error");
    return;
  }

  try {
    await authService.updatePassword(newPass);
    showToast("Şifre başarıyla güncellendi!");
    securityForm.reset();
  } catch (err) {
    showToast(err.message, "error");
  }
});

// Setup 2FA Dialog binders
mfaBtn.addEventListener("click", () => {
  if (is2faEnabled) {
    const disableConfirm = confirm("İki adımlı doğrulamayı devre dışı bırakmak istediğinizden emin misiniz?");
    if (disableConfirm) {
      is2faEnabled = false;
      localStorage.setItem("admin_2fa_enabled", "false");
      mfaBtn.textContent = "2FA Kur";
      mfaBtn.style.backgroundColor = "";
      mfaBtn.style.color = "";
      mfaBtn.style.border = "";
      showToast("İki adımlı doğrulama devre dışı bırakıldı.");
    }
  } else {
    mfaModal.classList.add("show");
  }
});

btnMfaCancel.addEventListener("click", () => {
  mfaModal.classList.remove("show");
  mfaCodeInput.value = "";
});

btnMfaConfirm.addEventListener("click", () => {
  const code = mfaCodeInput.value.trim();
  if (code.length === 6 && /^\d+$/.test(code)) {
    is2faEnabled = true;
    localStorage.setItem("admin_2fa_enabled", "true");
    mfaModal.classList.remove("show");
    mfaCodeInput.value = "";
    
    mfaBtn.textContent = "2FA Devre Dışı Bırak";
    mfaBtn.style.backgroundColor = "var(--danger)";
    mfaBtn.style.color = "white";
    mfaBtn.style.border = "none";

    showToast("Doğrulayıcı kurulumu başarıyla tamamlandı!");
  } else {
    showToast("Geçersiz doğrulama kodu. Lütfen 6 haneli sayısal kod girin.", "error");
  }
});

// Load Profile
loadUserProfile();
