import { injectAdminStructure } from './admin-layout.js';
import { dbService, storageService } from '/js/firebase/config.js';
import { showToast } from '/js/components/ui.js';

let newsItems = [];

// Initialize Layout
await injectAdminStructure("news");

const listPanel = document.getElementById("news-list-panel");
const composePanel = document.getElementById("news-compose-panel");
const tableBody = document.getElementById("news-table-body");
const composeTitle = document.getElementById("news-compose-title");
const newsForm = document.getElementById("news-form");

const btnCreate = document.getElementById("btn-create-news");
const btnCancel1 = document.getElementById("btn-cancel-news-compose");
const btnCancel2 = document.getElementById("btn-cancel-news-compose-2");

// Bind Navigation
btnCreate.addEventListener("click", () => showComposeForm());
btnCancel1.addEventListener("click", () => showListPanel());
btnCancel2.addEventListener("click", () => showListPanel());

async function initDashboard() {
  try {
    newsItems = await dbService.getNews(100);
    renderNews();
  } catch (err) {
    showToast("Haberler yüklenirken hata oluştu.", "error");
  }
}

function renderNews() {
  if (!tableBody) return;

  if (newsItems.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:3rem; color:var(--text-tertiary);">Henüz haber eklenmedi.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = newsItems.map(n => `
    <tr>
      <td style="font-weight:600;">${n.title}</td>
      <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color:var(--text-secondary);">${n.summary || '-'}</td>
      <td>${n.dateString}</td>
      <td style="text-align:right;">
        <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
          <button class="btn btn-secondary btn-sm edit-btn" data-id="${n.id}">Düzenle</button>
          <button class="btn btn-danger btn-sm delete-btn" data-id="${n.id}">Sil</button>
        </div>
      </td>
    </tr>
  `).join('');

  tableBody.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => editNews(btn.getAttribute("data-id")));
  });

  tableBody.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteNews(btn.getAttribute("data-id")));
  });
}

function showComposeForm() {
  listPanel.style.display = "none";
  composePanel.style.display = "block";
  composeTitle.textContent = "Haber Ekle";
  newsForm.reset();
  document.getElementById("edit-news-id").value = "";
}

function showListPanel() {
  listPanel.style.display = "block";
  composePanel.style.display = "none";
}

function editNews(id) {
  const n = newsItems.find(item => item.id === id);
  if (!n) return;

  showComposeForm();
  composeTitle.textContent = `Düzenle: ${n.title}`;

  document.getElementById("edit-news-id").value = n.id;
  document.getElementById("news-title-input").value = n.title;
  document.getElementById("news-date-input").value = n.dateString || "";
  document.getElementById("news-summary-input").value = n.summary || "";
  document.getElementById("news-content-input").value = n.content || "";
  document.getElementById("news-cover-url").value = n.coverUrl || "";
}

async function deleteNews(id) {
  if (confirm("Bu haberi silmek istediğinizden emin misiniz?")) {
    try {
      await dbService.deleteNews(id);
      showToast("Haber başarıyla silindi.");
      newsItems = newsItems.filter(n => n.id !== id);
      renderNews();
    } catch (err) {
      showToast("Haber silinirken hata oluştu.", "error");
    }
  }
}

newsForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("edit-news-id").value;
  const title = document.getElementById("news-title-input").value.trim();
  const dateString = document.getElementById("news-date-input").value.trim();
  const summary = document.getElementById("news-summary-input").value.trim();
  const content = document.getElementById("news-content-input").value.trim();
  const coverUrl = document.getElementById("news-cover-url").value.trim();

  const data = { title, dateString, summary, content, coverUrl };

  try {
    if (id) {
      await dbService.updateNews(id, data);
      showToast("Haber güncellendi.");
    } else {
      await dbService.createNews(data);
      showToast("Haber başarıyla eklendi!");
    }

    newsItems = await dbService.getNews(100);
    renderNews();
    showListPanel();
  } catch (err) {
    showToast("Haber kaydedilirken hata oluştu.", "error");
  }
});

await initDashboard();
