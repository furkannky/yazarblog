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

  if (books.length === 0) {
    root.innerHTML = `<div style="text-align:center; grid-column: 1/-1; padding: 4rem 0; color: var(--text-secondary);">Henüz kitap eklenmedi. Yakında tekrar kontrol edin.</div>`;
    return;
  }

  root.innerHTML = books.map(b => {
    const buyAmazon = b.purchaseLinks ? b.purchaseLinks.amazon : "";
    const buyKobo = b.purchaseLinks ? b.purchaseLinks.kobo : "";

    // Show PDF sample download if enabled
    const showDownloadLink = b.testDownloadEnabled && b.pdfUrl;

    return `
      <div class="card book-card" style="display: flex; flex-direction: column; align-items: center; border-radius: var(--radius-lg); text-align: center;">
        <div class="book-card-cover-container" style="padding: 2.5rem; background-color: var(--bg-secondary); width: 100%; display: flex; justify-content: center;">
          <img src="${b.cover}" alt="${b.title}" class="book-card-cover" style="width: 200px; max-width: 100%; box-shadow: var(--shadow-md);">
        </div>
        <div class="book-card-info" style="padding: 2.5rem; display: flex; flex-direction: column; flex-grow: 1;">
          <h2 style="font-family: var(--font-serif); font-size: 1.5rem; margin-bottom: 0.5rem;">${b.title}</h2>
          <span style="font-size: 0.9rem; font-weight:600; color: var(--accent); margin-bottom: 1.5rem; display:block;">Dr. Adil Yılmayan</span>
          <p style="color: var(--text-secondary); line-height: 1.6; margin-bottom: 2rem; font-size: 1rem; text-align: left;">${b.description}</p>
          
          <div style="display:flex; flex-wrap:wrap; justify-content: center; gap:1rem; border-top:1px solid var(--border-color); padding-top: 1.5rem; margin-top: auto;">
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
