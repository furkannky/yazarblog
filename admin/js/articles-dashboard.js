// Article CRUD management dashboard (list, filter tabs, edit modal, custom editor coordination, media uploading)
import { injectAdminStructure } from './admin-layout.js';
import { dbService, storageService } from '/js/firebase/config.js';
import { createRichEditor } from '/js/components/editor.js';
import { showToast } from '/js/components/ui.js';
import { formatDate, generateSlug } from '/js/utils.js';

let articles = [];
let categories = [];
let activeTab = "all";
let editorInstance = null;

// Initialize Admin UI elements
await injectAdminStructure("articles");

// Elements
const listPanel = document.getElementById("articles-list-panel");
const composePanel = document.getElementById("article-compose-panel");
const tableBody = document.getElementById("articles-table-body");
const composeTitleHdr = document.getElementById("compose-title-hdr");
const articleForm = document.getElementById("article-form");

const btnCreate = document.getElementById("btn-create-article");
const btnCancelList1 = document.getElementById("btn-cancel-compose");
const btnCancelList2 = document.getElementById("btn-cancel-compose-2");

const coverInput = document.getElementById("article-cover-input");
const btnPickCover = document.getElementById("btn-pick-cover");
const coverUrlInput = document.getElementById("article-cover-url");
const coverPreview = document.getElementById("article-cover-preview");

// Set up event listeners
btnCreate.addEventListener("click", () => showComposeForm());
btnCancelList1.addEventListener("click", () => showListPanel());
btnCancelList2.addEventListener("click", () => showListPanel());

// Bind Cover uploads
btnPickCover.addEventListener("click", () => coverInput.click());
coverInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      showToast("Kapak görseli yükleniyor...");
      const url = await storageService.uploadFile(file, "covers");
      coverUrlInput.value = url;
      coverPreview.src = url;
      coverPreview.style.display = "block";
      showToast("Kapak görseli yüklendi!");
    } catch (err) {
      showToast("Kapak görseli yüklenemedi.", "error");
    }
  }
});

// Sync input preview if URL entered manually
coverUrlInput.addEventListener("input", (e) => {
  const val = e.target.value.trim();
  if (val) {
    coverPreview.src = val;
    coverPreview.style.display = "block";
  } else {
    coverPreview.style.display = "none";
  }
});

// Setup tab filters click binders
document.getElementById("tab-filter-all").addEventListener("click", (e) => toggleTab(e, "all"));
document.getElementById("tab-filter-published").addEventListener("click", (e) => toggleTab(e, "published"));
document.getElementById("tab-filter-drafts").addEventListener("click", (e) => toggleTab(e, "draft"));

function toggleTab(e, filterType) {
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  e.target.classList.add("active");
  activeTab = filterType;
  renderArticlesList();
}

// Initial Loading
async function initDashboard() {
  try {
    const [cats, arts] = await Promise.all([
      dbService.getCategories(),
      dbService.getArticles()
    ]);

    categories = cats;
    articles = arts;

    populateCategoriesSelect();
    renderArticlesList();
  } catch (err) {
    console.error("Articles dash failed:", err);
    showToast("Makaleler yüklenemedi.", "error");
  }
}

function populateCategoriesSelect() {
  const select = document.getElementById("article-categories-select");
  if (!select) return;
  select.innerHTML = categories.map(c => `
    <option value="${c.id}">${c.name}</option>
  `).join('');
}

function renderArticlesList() {
  if (!tableBody) return;

  const filtered = articles.filter(a => {
    if (activeTab === "all") return true;
    return a.status === activeTab;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align:center; padding: 3rem; color: var(--text-tertiary);">Bu sekmede makale bulunamadı.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(a => {
    const catsStr = a.categories.map(id => {
      const match = categories.find(c => c.id === id);
      return match ? match.name : "";
    }).filter(n => n.length > 0).join(', ');

    const dateStr = formatDate(a.publishedAt || a.createdAt);

    return `
      <tr>
        <td>
          <img src="${a.cover}" alt="cover" style="width: 50px; height: 35px; object-fit: cover; border-radius: var(--radius-sm);">
        </td>
        <td style="font-weight: 600; max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
          ${a.title}
        </td>
        <td>${catsStr}</td>
        <td>${dateStr}</td>
        <td style="font-weight:600;">${a.views || 0}</td>
        <td>
          <span class="status-badge ${a.status === 'published' ? 'approved' : 'pending'}">${a.status === 'published' ? 'Yayınlandı' : 'Taslak'}</span>
        </td>
        <td style="text-align:right;">
          <div style="display:flex; gap:0.5rem; justify-content:flex-end;">
            <button class="btn btn-secondary btn-sm edit-article-btn" data-id="${a.id}">Düzenle</button>
            <button class="btn btn-danger btn-sm delete-article-btn" data-id="${a.id}">Sil</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind Actions Clicks
  tableBody.querySelectorAll(".edit-article-btn").forEach(btn => {
    btn.addEventListener("click", () => editArticle(btn.getAttribute("data-id")));
  });

  tableBody.querySelectorAll(".delete-article-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteArticle(btn.getAttribute("data-id")));
  });
}

function showComposeForm() {
  listPanel.style.display = "none";
  composePanel.style.display = "block";
  composeTitleHdr.textContent = "Yeni Makale Yaz";
  articleForm.reset();
  document.getElementById("edit-article-id").value = "";
  coverPreview.style.display = "none";
  
  // Clear category selections
  const select = document.getElementById("article-categories-select");
  Array.from(select.options).forEach(opt => opt.selected = false);

  // Mount RTE component
  editorInstance = createRichEditor("#editor-mount-point", "");
}

function showListPanel() {
  listPanel.style.display = "block";
  composePanel.style.display = "none";
  editorInstance = null;
}

async function editArticle(id) {
  const art = articles.find(a => a.id === id);
  if (!art) return;

  showComposeForm();
  composeTitleHdr.textContent = `Düzenle: ${art.title}`;
  
  document.getElementById("edit-article-id").value = art.id;
  document.getElementById("article-title-input").value = art.title;
  document.getElementById("article-slug-input").value = art.slug;
  document.getElementById("article-summary-input").value = art.summary;
  document.getElementById("article-cover-url").value = art.cover;
  document.getElementById("article-tags-input").value = (art.tags || []).join(', ');
  
  if (art.cover) {
    coverPreview.src = art.cover;
    coverPreview.style.display = "block";
  }

  // Pre-select category options
  const select = document.getElementById("article-categories-select");
  Array.from(select.options).forEach(opt => {
    opt.selected = art.categories.includes(opt.value);
  });

  // SEO details
  document.getElementById("article-seo-title").value = art.seoTitle || "";
  document.getElementById("article-seo-desc").value = art.seoDescription || "";

  // Status option
  document.getElementById("article-status-select").value = art.status;

  // Mount RTE component with initial content
  editorInstance = createRichEditor("#editor-mount-point", art.content);
}

async function deleteArticle(id) {
  if (confirm("Bu makaleyi silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!")) {
    try {
      await dbService.deleteArticle(id);
      showToast("Makale başarıyla silindi.");
      // Refresh local cache list
      articles = articles.filter(a => a.id !== id);
      renderArticlesList();
    } catch (err) {
      showToast("Makale silinirken hata oluştu.", "error");
    }
  }
}

// Binds Article Submission Form
articleForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("edit-article-id").value;
  const title = document.getElementById("article-title-input").value.trim();
  const rawSlug = document.getElementById("article-slug-input").value.trim();
  const summary = document.getElementById("article-summary-input").value.trim();
  
  // Read category selections
  const select = document.getElementById("article-categories-select");
  const selectedCats = Array.from(select.selectedOptions).map(opt => opt.value);

  const coverUrl = document.getElementById("article-cover-url").value.trim() || 
                    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450'><rect width='100%' height='100%' fill='%23666'/></svg>";
  
  const tags = document.getElementById("article-tags-input").value.split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0);

  const seoTitle = document.getElementById("article-seo-title").value.trim();
  const seoDescription = document.getElementById("article-seo-desc").value.trim();
  const status = document.getElementById("article-status-select").value;

  const content = editorInstance ? editorInstance.getContent() : "";

  if (selectedCats.length === 0) {
    showToast("Lütfen en az bir kategori seçin.", "error");
    return;
  }

  if (!content) {
    showToast("Makale içeriği boş olamaz.", "error");
    return;
  }

  // Generate URL slug from title optionally
  const slug = rawSlug || generateSlug(title);

  const articleData = {
    title,
    slug,
    summary,
    categories: selectedCats,
    cover: coverUrl,
    tags,
    content,
    seoTitle,
    seoDescription,
    status
  };

  try {
    if (id) {
      // Edit mode
      await dbService.updateArticle(id, articleData);
      showToast("Makale başarıyla güncellendi!");
    } else {
      // Create mode
      await dbService.createArticle(articleData);
      showToast("Makale başarıyla oluşturuldu!");
    }

    // Refresh list cache
    articles = await dbService.getArticles();
    renderArticlesList();
    showListPanel();

  } catch (error) {
    console.error("Save fail:", error);
    showToast("Makale kaydedilirken hata oluştu.", "error");
  }
});

// Run Init
await initDashboard();
