// Books page controller (list display, Amazon/Kobo integrations, and sample PDF links)
import { dbService } from '../firebase/config.js';
import { createGridSkeleton, showToast } from '../components/ui.js';

export async function initBooksPage() {
  createGridSkeleton("#books-catalog-list", 2, "card");

  try {
    const books = await dbService.getBooks();
    renderBooksList(books);
  } catch (error) {
    console.error("Failed to load books catalog:", error);
    showToast("Kitaplar yüklenemedi.", "error");
  }
}

function renderBooksList(books) {
  const root = document.getElementById("books-catalog-list");
  if (!root) return;
  root.classList.remove("books-grid");

  if (books.length === 0) {
    root.innerHTML = `<div style="text-align:center; grid-column: 1/-1; padding: 4rem 0; color: var(--text-secondary);">Henüz kitap eklenmedi. Yakında tekrar kontrol edin.</div>`;
    return;
  }

  root.innerHTML = books.map(b => {
    const buyAmazon = b.purchaseLinks ? b.purchaseLinks.amazon : "";
    const buyNubihar = b.purchaseLinks ? b.purchaseLinks.nubihar : "";
    const buyKobo = b.purchaseLinks ? b.purchaseLinks.kobo : "";

    // Show PDF sample download if enabled
    const showDownloadLink = b.testDownloadEnabled && b.pdfUrl;

    return `
      <div class="catalog-book-card">
        <div class="catalog-book-cover-container">
          <img src="${b.cover}" alt="${b.title}" class="catalog-book-cover">
        </div>
        <div class="catalog-book-info">
          <h2>${b.title}</h2>
          <span class="catalog-book-author">Dr. Adil Yılmayan</span>
          <p class="catalog-book-desc">${b.description}</p>
          
          <div class="catalog-book-actions">
            ${buyNubihar ? `<a href="${buyNubihar}" target="_blank" class="btn btn-primary nubihar">Nûbihar'dan Al</a>` : ''}
            ${buyAmazon ? `<a href="${buyAmazon}" target="_blank" class="btn btn-primary">Amazon'dan Al</a>` : ''}
            ${buyKobo ? `<a href="${buyKobo}" target="_blank" class="btn btn-secondary">Kobo'dan Al</a>` : ''}
            ${showDownloadLink ? `
              <a href="${b.pdfUrl}" target="_blank" class="btn btn-secondary download-sample-btn" data-id="${b.id}" style="border: 1px dashed var(--accent); color: var(--accent);">
                Örnek İndir
              </a>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Bind Downloads
  root.querySelectorAll(".download-sample-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const id = btn.getAttribute("data-id");
      showToast("Örnek PDF indirmesi başlatılıyor...");
      // Background increment
      dbService.incrementPdfDownloads(id).catch(err => console.error("Download fail:", err));
    });
  });
}
