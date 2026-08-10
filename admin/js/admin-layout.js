// Secure Admin Portal Layout Coordinator (Page session protection, sidebar injections and logout controllers)
import { authService, dbService } from '/js/firebase/config.js';
import { showToast } from '/js/components/ui.js';

export function runAdminGuard() {
  const user = authService.getCurrentUser();
  if (!user) {
    showToast("Oturum süresi doldu veya yetkisiz erişim. Giriş sayfasına yönlendiriliyorsunuz...", "error");
    setTimeout(() => {
      window.location.href = "/admin/login.html";
    }, 800);
    return false;
  }
  return true;
}

export async function injectAdminStructure(activePage = "") {
  if (!runAdminGuard()) return;

  const wrapper = document.querySelector(".admin-wrapper");
  if (!wrapper) return;

  const settings = await dbService.getSettings();
  let title = settings.logoText || "Adil Yılmayan";
  if (title === "name" || title === "A. Author") title = "Adil Yılmayan";

  const user = authService.getCurrentUser();
  const userName = user.email ? user.email.split("@")[0] : "Admin";
  const userAvatar = user.avatar || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100'><rect width='100' height='100' fill='%23ccc'/></svg>";

  const path = window.location.pathname;

  // Breadcrumbs labels mapping
  let pageLabel = "Kontrol Paneli";
  if (path.endsWith("/articles.html")) pageLabel = "Yazı Yönetimi";
  else if (path.endsWith("/books.html")) pageLabel = "Kitap Yönetimi";
  else if (path.endsWith("/news.html")) pageLabel = "Haber & Etkinlik Yönetimi";
  else if (path.endsWith("/comments.html")) pageLabel = "Yorum Moderasyonu";
  else if (path.endsWith("/categories.html")) pageLabel = "Kategori Kataloğu";
  else if (path.endsWith("/settings.html")) pageLabel = "Site Ayarları";
  else if (path.endsWith("/profile.html")) pageLabel = "Profil Merkezi";

  // HTML structure mapping: Sidebar and Main section template wrapper
  const sidebarHTML = `
    <aside class="admin-sidebar">
      <div class="admin-brand">
        <a href="/index.html" target="_blank" class="logo" style="font-size:1.25rem;">
          <span class="logo-icon" style="width:28px; height:28px; font-size:0.95rem;">A</span>
          <span>${title}</span>
        </a>
      </div>
      
      <ul class="sidebar-menu">
        <li class="sidebar-menu-item ${activePage === 'dashboard' ? 'active' : ''}">
          <a href="/admin/dashboard.html">📊 Kontrol Paneli</a>
        </li>
        <li class="sidebar-menu-item ${activePage === 'articles' ? 'active' : ''}">
          <a href="/admin/articles.html">✍️ Makaleler</a>
        </li>
        <li class="sidebar-menu-item ${activePage === 'books' ? 'active' : ''}">
          <a href="/admin/books.html">📚 Kitaplar</a>
        </li>
        <li class="sidebar-menu-item ${activePage === 'news' ? 'active' : ''}">
          <a href="/admin/news.html">📢 Haberler</a>
        </li>
        <li class="sidebar-menu-item ${activePage === 'comments' ? 'active' : ''}">
          <a href="/admin/comments.html">💬 Yorumlar</a>
        </li>
        <li class="sidebar-menu-item ${activePage === 'categories' ? 'active' : ''}">
          <a href="/admin/categories.html">🏷️ Kategoriler</a>
        </li>
        <li class="sidebar-menu-item ${activePage === 'settings' ? 'active' : ''}">
          <a href="/admin/settings.html">⚙️ Ayarlar</a>
        </li>
        <li class="sidebar-menu-item ${activePage === 'profile' ? 'active' : ''}">
          <a href="/admin/profile.html">👤 Profil</a>
        </li>
      </ul>

      <div class="admin-sidebar-footer">
        <div class="admin-user-card">
          <img src="${userAvatar}" alt="Admin Avatar" class="admin-avatar">
          <div class="admin-user-info">
            <div class="admin-user-name">${userName}</div>
            <div class="admin-user-role">Yönetici</div>
          </div>
          <button class="btn-logout" id="sidebar-logout-btn" title="Çıkış Yap">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </div>
    </aside>
  `;

  const headerHTML = `
    <header class="admin-header">
      <div class="breadcrumbs">
        <span>Panel</span>
        <span class="breadcrumbs-separator">&rarr;</span>
        <span class="breadcrumbs-active">${pageLabel}</span>
      </div>
      <div>
        <a href="/index.html" target="_blank" class="btn btn-secondary btn-sm">Siteyi Önizle ↗</a>
      </div>
    </header>
  `;

  // Inject Sidebar
  const sidebarContainer = document.createElement("div");
  sidebarContainer.innerHTML = sidebarHTML;
  wrapper.insertBefore(sidebarContainer.firstElementChild, wrapper.firstChild);

  // Inject Header inside main column
  const mainCol = document.querySelector(".admin-main");
  if (mainCol) {
    const headerContainer = document.createElement("div");
    headerContainer.innerHTML = headerHTML;
    mainCol.insertBefore(headerContainer.firstElementChild, mainCol.firstChild);
  }

  // Bind Logout
  const logoutBtn = document.getElementById("sidebar-logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      const confirmLogout = confirm("Çıkış yapmak istediğinizden emin misiniz?");
      if (confirmLogout) {
        await authService.logout();
        showToast("Başarıyla çıkış yapıldı.");
        setTimeout(() => {
          window.location.href = "/admin/login.html";
        }, 600);
      }
    });
  }
}
