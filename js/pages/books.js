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
      <div class="card book-card" style="display:grid; grid-template-columns: 300px 1fr; border-radius:var(--radius-lg);">
        <div class="book-card-cover-container" style="padding: 2.5rem; background-color: var(--bg-secondary);">
          <img src="${b.cover}" alt="${b.title}" class="book-card-cover" style="width: 80%; max-width: 220px;">
        </div>
        <div class="book-card-info" style="padding: 2.5rem; justify-content: center;">
          <h2 style="font-family: var(--font-serif); font-size: 1.85rem; margin-bottom: 0.5rem; letter-spacing:-0.02em;">${b.title}</h2>
          <span style="font-size: 0.9rem; font-weight:600; color: var(--accent); margin-bottom: 1.5rem; display:block;">A. Author tarafından</span>
          <p style="color: var(--text-secondary); line-height: 1.7; margin-bottom: 2rem; font-size: 1.05rem;">${b.description}</p>
          
          <div style="display:flex; flex-wrap:wrap; gap:1rem; border-top:1px solid var(--border-color); padding-top: 1.5rem;">
            ${buyAmazon ? `<a href="${buyAmazon}" target="_blank" class="btn btn-primary">Amazon'dan Satın Al</a>` : ''}
            ${buyKobo ? `<a href="${buyKobo}" target="_blank" class="btn btn-secondary">Kobo'dan Satın Al</a>` : ''}
            ${showDownloadLink ? `
              <button class="btn btn-secondary download-sample-btn" data-url="${b.pdfUrl}" data-id="${b.id}" style="border: 1px dashed var(--accent); color: var(--accent);">
                Örnek İndir (${b.pdfSize || 'Bölüm'})
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');

  // Bind Downloads
  root.querySelectorAll(".download-sample-btn").forEach(btn => {
    btn.addEventListener("click", async (e) => {
      const url = btn.getAttribute("data-url");
      const id = btn.getAttribute("data-id");
      try {
        await dbService.incrementPdfDownloads(id);
        showToast("Örnek PDF indirmesi başlatılıyor...");
        // In a real environment, redirect to target:
        window.open(url, "_blank");
      } catch (err) {
        console.error("Download fail:", err);
      }
    });
  });
}
