// Book CRUD management dashboard (list, uploads cover/PDF chapters, order arrangement, amazon/kobo purchase urls)
import { injectAdminStructure } from './admin-layout.js';
import { dbService, storageService } from '/js/firebase/config.js';
import { showToast } from '/js/components/ui.js';

let books = [];

// Initialize Layout & Guard
await injectAdminStructure("books");

// Selectors
const listPanel = document.getElementById("books-list-panel");
const composePanel = document.getElementById("book-compose-panel");
const tableBody = document.getElementById("books-table-body");
const composeTitle = document.getElementById("book-compose-title");
const bookForm = document.getElementById("book-form");

const btnCreate = document.getElementById("btn-create-book");
const btnCancel1 = document.getElementById("btn-cancel-book-compose");
const btnCancel2 = document.getElementById("btn-cancel-book-compose-2");

const coverInput = document.getElementById("book-cover-input");
const btnPickCover = document.getElementById("btn-pick-book-cover");
const coverUrlInput = document.getElementById("book-cover-url");
const coverPreview = document.getElementById("book-cover-preview");

const pdfInput = document.getElementById("book-pdf-input");
const btnPickPdf = document.getElementById("btn-pick-book-pdf");
const pdfUrlInput = document.getElementById("book-pdf-url");
const pdfSizeInput = document.getElementById("book-pdf-size");

// Navigation Bindings
btnCreate.addEventListener("click", () => showComposeForm());
btnCancel1.addEventListener("click", () => showListPanel());
btnCancel2.addEventListener("click", () => showListPanel());

// Bind Cover Selection & Upload
btnPickCover.addEventListener("click", () => coverInput.click());
coverInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      showToast("Kitap kapağı yükleniyor...");
      const url = await storageService.uploadFile(file, "book_covers");
      coverUrlInput.value = url;
      coverPreview.src = url;
      coverPreview.style.display = "block";
      showToast("Kitap kapağı yüklendi!");
    } catch (err) {
      showToast("Kitap kapağı yüklenemedi.", "error");
    }
  }
});

coverUrlInput.addEventListener("input", (e) => {
  const url = e.target.value.trim();
  if (url) {
    coverPreview.src = url;
    coverPreview.style.display = "block";
  } else {
    coverPreview.style.display = "none";
  }
});

// Bind Sample PDF Selection & Upload
btnPickPdf.addEventListener("click", () => pdfInput.click());
pdfInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (file) {
    try {
      showToast("Örnek PDF yükleniyor...");
      const url = await storageService.uploadFile(file, "book_samples");
      pdfUrlInput.value = url;
      
      // Calculate human-readable size
      const MBs = file.size / (1024 * 1024);
      pdfSizeInput.value = `${MBs.toFixed(1)} MB`;
      showToast("Örnek PDF başarıyla yüklendi!");
    } catch (err) {
      showToast("PDF örneği yüklenemedi.", "error");
    }
  }
});

// Initial load
async function loadBooks() {
  try {
    books = await dbService.getBooks();
    renderBooks();
  } catch (err) {
    console.error(err);
    showToast("Kitaplar yüklenirken hata oluştu.", "error");
  }
}

function renderBooks() {
  if (!tableBody) return;

  if (books.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:3rem; color:var(--text-tertiary);">Sistem kataloğunda tanımlanmış kitap bulunamadı.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = books.map(b => {
    const AmazonBuy = b.purchaseLinks ? b.purchaseLinks.amazon : "";
    const KoboBuy = b.purchaseLinks ? b.purchaseLinks.kobo : "";
    const isDlUrl = b.pdfUrl ? `<a href="${b.pdfUrl}" target="_blank" style="text-decoration:underline;">Örnek PDF (${b.pdfSize || 'indir'})</a>` : '<span style="color:var(--text-tertiary);">Yok</span>';

    return `
      <tr>
        <td>
          <img src="${b.cover}" alt="Book Cover" style="width: 40px; height: 55px; object-fit: cover; border-radius: var(--radius-sm);">
        </td>
        <td style="font-weight:600;">${b.title}</td>
        <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color:var(--text-secondary);">${b.description}</td>
        <td>${isDlUrl}</td>
        <td style="font-weight:600;">${b.downloads || 0}</td>
        <td style="text-align:right;">
          <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
            <button class="btn btn-secondary btn-sm edit-book-btn" data-id="${b.id}">Düzenle</button>
            <button class="btn btn-danger btn-sm delete-book-btn" data-id="${b.id}">Sil</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  tableBody.querySelectorAll(".edit-book-btn").forEach(btn => {
    btn.addEventListener("click", () => editBook(btn.getAttribute("data-id")));
  });

  tableBody.querySelectorAll(".delete-book-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteBook(btn.getAttribute("data-id")));
  });
}

function showComposeForm() {
  listPanel.style.display = "none";
  composePanel.style.display = "block";
  composeTitle.textContent = "Kitap Detaylarını Yapılandır";
  bookForm.reset();
  document.getElementById("edit-book-id").value = "";
  coverPreview.style.display = "none";
}

// Show list
function showListPanel() {
  listPanel.style.display = "block";
  composePanel.style.display = "none";
}

function editBook(id) {
  const b = books.find(item => item.id === id);
  if (!b) return;

  showComposeForm();
  composeTitle.textContent = `Düzenle: ${b.title}`;

  document.getElementById("edit-book-id").value = b.id;
  document.getElementById("book-title-input").value = b.title;
  document.getElementById("book-order-input").value = b.order || 0;
  document.getElementById("book-desc-input").value = b.description;
  
  document.getElementById("book-cover-url").value = b.cover || "";
  if (b.cover) {
    coverPreview.src = b.cover;
    coverPreview.style.display = "block";
  }

  document.getElementById("book-pdf-url").value = b.pdfUrl || "";
  document.getElementById("book-pdf-size").value = b.pdfSize || "";
  
  if (b.purchaseLinks) {
    document.getElementById("book-link-amazon").value = b.purchaseLinks.amazon || "";
    document.getElementById("book-link-nubihar").value = b.purchaseLinks.nubihar || "";
    document.getElementById("book-link-kobo").value = b.purchaseLinks.kobo || "";
  }

  document.getElementById("book-download-enabled-checkbox").checked = !!b.testDownloadEnabled;
}

async function deleteBook(id) {
  if (confirm("Bu kitabı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.")) {
    try {
      await dbService.deleteBook(id);
      showToast("Kitap başarıyla silindi.");
      books = books.filter(b => b.id !== id);
      renderBooks();
    } catch (err) {
      showToast("Kitap silinirken hata oluştu.", "error");
    }
  }
}

bookForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = document.getElementById("edit-book-id").value;
  const title = document.getElementById("book-title-input").value.trim();
  const order = parseInt(document.getElementById("book-order-input").value || "0");
  const description = document.getElementById("book-desc-input").value.trim();
  
  const cover = document.getElementById("book-cover-url").value.trim() || 
                "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='150'><rect width='100%' height='100%' fill='%23ccc'/></svg>";
  
  const pdfUrl = document.getElementById("book-pdf-url").value.trim();
  const pdfSize = document.getElementById("book-pdf-size").value.trim();
  
  const amazon = document.getElementById("book-link-amazon").value.trim();
  const nubihar = document.getElementById("book-link-nubihar").value.trim();
  const kobo = document.getElementById("book-link-kobo").value.trim();

  const testDownloadEnabled = document.getElementById("book-download-enabled-checkbox").checked;

  const bookData = {
    title,
    order,
    description,
    cover,
    pdfUrl,
    pdfSize,
    purchaseLinks: { amazon, nubihar, kobo },
    testDownloadEnabled
  };

  try {
    if (id) {
      await dbService.updateBook(id, bookData);
      showToast("Kitap başarıyla güncellendi!");
    } else {
      await dbService.createBook(bookData);
      showToast("Kitap başarıyla eklendi!");
    }

    books = await dbService.getBooks();
    renderBooks();
    showListPanel();
  } catch (err) {
    showToast("Kitap kaydedilirken hata oluştu.", "error");
  }
});

// Run Initializer loading
await loadBooks();
