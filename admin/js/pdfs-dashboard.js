// PDF collection CRUD management (list, metadata config, storage upload hook, category selection sync)
import { injectAdminStructure } from './admin-layout.js';
import { dbService, storageService } from '/js/firebase/config.js';
import { showToast } from '/js/components/ui.js';
import { formatDate } from '/js/utils.js';

let pdfs = [];
let categories = [];

// Initialize Layout & Guard
await injectAdminStructure("pdfs");

// Selectors
const listPanel = document.getElementById("pdfs-list-panel");
const composePanel = document.getElementById("pdf-compose-panel");
const tableBody = document.getElementById("pdfs-table-body");
const composeTitle = document.getElementById("pdf-compose-title");
const pdfForm = document.getElementById("pdf-form");

const btnCreate = document.getElementById("btn-create-pdf");
const btnCancel1 = document.getElementById("btn-cancel-pdf-compose");
const btnCancel2 = document.getElementById("btn-cancel-pdf-compose-2");

const fileInput = document.getElementById("pdf-file-input");
const btnPickFile = document.getElementById("btn-pick-pdf-file");
const fileUrlInput = document.getElementById("pdf-file-url");
const fileSizeInput = document.getElementById("pdf-file-size");

// Bind Navigation
btnCreate.addEventListener("click", () => showComposeForm());
btnCancel1.addEventListener("click", () => showListPanel());
btnCancel2.addEventListener("click", () => showListPanel());

// Bind PDF File Pick & Upload
btnPickFile.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      showToast("PDF belgesi yükleniyor...");
      const url = await storageService.uploadFile(file, "pdfs");
      fileUrlInput.value = url;

      // Calculate file size
      const KBs = file.size / 1024;
      if (KBs > 1024) {
        fileSizeInput.value = `${(KBs / 1024).toFixed(1)} MB`;
      } else {
        fileSizeInput.value = `${Math.round(KBs)} KB`;
      }
      showToast("PDF belgesi yüklendi!");
    } catch (err) {
      showToast("PDF belgesi yüklenemedi.", "error");
    }
  }
});

// Load resources
async function initDashboard() {
  try {
    const [catsData, pdfsData] = await Promise.all([
      dbService.getCategories(),
      dbService.getPdfs()
    ]);
    
    categories = catsData;
    pdfs = pdfsData;

    populateCategoriesDropdown();
    renderPdfs();
  } catch (err) {
    showToast("Veriler yüklenirken hata oluştu.", "error");
  }
}

function populateCategoriesDropdown() {
  const dropdown = document.getElementById("pdf-category-select");
  if (!dropdown) return;
  dropdown.innerHTML = `
    <option value="" disabled selected>Kategori Seçin</option>
    ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
  `;
}

function renderPdfs() {
  if (!tableBody) return;

  if (pdfs.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" style="text-align:center; padding:3rem; color:var(--text-tertiary);">Henüz indirilebilir PDF belgesi eklenmedi.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = pdfs.map(p => {
    const catMatch = categories.find(c => c.id === p.category);
    const catName = catMatch ? catMatch.name : '<span style="color:var(--text-tertiary);">Genel</span>';
    const isVisible = p.visible !== false ? '✅ Görünür' : '❌ Gizli';

    return `
      <tr>
        <td style="font-weight:600;">${p.title}</td>
        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color:var(--text-secondary);">${p.description || '-'}</td>
        <td>${catName}</td>
        <td>${p.fileSize}</td>
        <td>${formatDate(p.uploadDate)}</td>
        <td>${isVisible}</td>
        <td style="font-weight:600;">${p.downloads || 0}</td>
        <td style="text-align:right;">
          <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
            <button class="btn btn-secondary btn-sm edit-pdf-btn" data-id="${p.id}">Düzenle</button>
            <button class="btn btn-danger btn-sm delete-pdf-btn" data-id="${p.id}">Sil</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  tableBody.querySelectorAll(".edit-pdf-btn").forEach(btn => {
    btn.addEventListener("click", () => editPdf(btn.getAttribute("data-id")));
  });

  tableBody.querySelectorAll(".delete-pdf-btn").forEach(btn => {
    btn.addEventListener("click", () => deletePdf(btn.getAttribute("data-id")));
  });
}

function showComposeForm() {
  listPanel.style.display = "none";
  composePanel.style.display = "block";
  composeTitle.textContent = "Araştırma PDF'i Yükle veya Yapılandır";
  pdfForm.reset();
  document.getElementById("edit-pdf-id").value = "";
}

function showListPanel() {
  listPanel.style.display = "block";
  composePanel.style.display = "none";
}

function editPdf(id) {
  const p = pdfs.find(item => item.id === id);
  if (!p) return;

  showComposeForm();
  composeTitle.textContent = `Düzenle: ${p.title}`;

  document.getElementById("edit-pdf-id").value = p.id;
  document.getElementById("pdf-title-input").value = p.title;
  document.getElementById("pdf-desc-input").value = p.description || "";
  document.getElementById("pdf-category-select").value = p.category;
  
  document.getElementById("pdf-file-url").value = p.url;
  document.getElementById("pdf-file-size").value = p.fileSize;

  document.getElementById("pdf-visible-checkbox").checked = p.visible !== false;
}

async function deletePdf(id) {
  if (confirm("Bu PDF arşivini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
    try {
      await dbService.deletePdf(id);
      showToast("Belge başarıyla silindi.");
      pdfs = pdfs.filter(p => p.id !== id);
      renderPdfs();
    } catch (err) {
      showToast("PDF silinirken hata oluştu.", "error");
    }
  }
}

pdfForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("edit-pdf-id").value;
  const title = document.getElementById("pdf-title-input").value.trim();
  const description = document.getElementById("pdf-desc-input").value.trim();
  const category = document.getElementById("pdf-category-select").value;
  
  const url = document.getElementById("pdf-file-url").value.trim();
  const fileSize = document.getElementById("pdf-file-size").value.trim();
  const visible = document.getElementById("pdf-visible-checkbox").checked;

  const pdfData = {
    title,
    description,
    category,
    url,
    fileSize,
    visible
  };

  try {
    if (id) {
      await dbService.updatePdf(id, pdfData);
      showToast("Belge ayarları güncellendi.");
    } else {
      await dbService.createPdf(pdfData);
      showToast("Belge başarıyla eklendi!");
    }

    pdfs = await dbService.getPdfs();
    renderPdfs();
    showListPanel();
  } catch (err) {
    showToast("Belge ayrıntıları kaydedilirken hata oluştu.", "error");
  }
});

// Load
await initDashboard();
