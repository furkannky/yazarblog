// Homepage public page controller
import { dbService } from '../firebase/config.js';
import { showToast, createGridSkeleton } from '../components/ui.js';
import { formatDate, calculateReadingTime } from '../utils.js';

export async function initHomePage() {
  // Inject skeletons first
  createGridSkeleton("#featured-article-root", 1, "card");
  createGridSkeleton("#latest-articles-root", 3, "card");
  createGridSkeleton("#featured-books-root", 2, "card");

  try {
    // 1. Load Settings details
    const settings = await dbService.getSettings();
    document.getElementById("hero-title-display").textContent = settings.bannerTitle || "Bilim, Tarih ve Sanat Üzerine Düşünceler";
    document.getElementById("hero-subtitle-display").textContent = settings.bannerSubtitle || "Yazar tarafından doğrudan yayınlanan denemeler, tarih incelemeleri ve teknik kitaplar.";
    
    // 2. Fetch and render Articles
    const articles = await dbService.getArticles();
    const published = articles.filter(a => a.status === "published");
    
    renderFeatured(published[0]);
    renderLatest(published.slice(1, 4));

    // 3. Fetch and render Books
    const books = await dbService.getBooks();
    renderFeaturedBooks(books.slice(0, 3));

    // 4. Newsletter binder
    const newsletterForm = document.getElementById("newsletter-form-home");
    if (newsletterForm) {
      newsletterForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const input = newsletterForm.querySelector("input");
        const email = input.value.trim();
        if (email) {
          try {
            await dbService.addNewsletterSub(email);
            showToast("Bültene başarıyla abone olundu!");
            input.value = "";
          } catch (err) {
            showToast(err.message, "error");
          }
        }
      });
    }

  } catch (error) {
    console.error("Home loading failed:", error);
    showToast("Sayfa içeriği yüklenemedi.", "error");
  }
}

function renderFeatured(article) {
  const root = document.getElementById("featured-article-root");
  if (!root) return;

  if (!article) {
    root.innerHTML = `<div style="text-align:center; padding: 2rem; color: var(--text-secondary);">Henüz öne çıkarılan bir yazı bulunmuyor.</div>`;
    return;
  }

  const readTime = calculateReadingTime(article.content);

  root.innerHTML = `
    <div class="featured-article-container">
      <div class="featured-article-cover">
        <img src="${article.cover}" alt="${article.title}">
      </div>
      <div class="featured-article-details">
        <span class="article-category-badge">Öne Çıkan</span>
        <h3 class="featured-article-title"><a href="/article.html?slug=${article.slug}">${article.title}</a></h3>
        <p style="color:var(--text-secondary); margin-bottom: 2rem; line-height: 1.6;">${article.summary}</p>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; color:var(--text-tertiary); width:100%; border-top: 1px solid var(--border-color); padding-top: 1rem;">
          <span>${formatDate(article.publishedAt)}</span>
          <span>${readTime} • ${article.views} görüntülenme</span>
        </div>
      </div>
    </div>
  `;
}

function renderLatest(articlesList) {
  const root = document.getElementById("latest-articles-root");
  if (!root) return;

  if (articlesList.length === 0) {
    root.innerHTML = `<div style="text-align:center; grid-column: 1/-1; padding: 2rem; color: var(--text-secondary);">Yazı bulunamadı.</div>`;
    return;
  }

  root.innerHTML = articlesList.map(a => {
    const readTime = calculateReadingTime(a.content);
    return `
      <article class="card article-card">
        <div class="article-card-cover">
          <a href="/article.html?slug=${a.slug}"><img src="${a.cover}" alt="${a.title}"></a>
        </div>
        <div class="article-card-content">
          <div class="article-card-meta">
            <span class="article-card-category">Makale</span>
            <span>•</span>
            <span>${formatDate(a.publishedAt)}</span>
          </div>
          <h3 class="article-card-title"><a href="/article.html?slug=${a.slug}">${a.title}</a></h3>
          <p class="article-card-summary">${a.summary}</p>
          <div class="article-card-footer">
            <span>${readTime}</span>
            <span>${a.views} okuma</span>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderFeaturedBooks(booksList) {
  const root = document.getElementById("featured-books-root");
  if (!root) return;

  if (booksList.length === 0) {
    root.innerHTML = `<div style="text-align:center; grid-column: 1/-1; padding: 2rem; color: var(--text-secondary);">Kitap bulunamadı. Yazarın eserleri yakında eklenecektir.</div>`;
    return;
  }

  root.innerHTML = booksList.map(b => {
    const AmazonBuy = b.purchaseLinks ? b.purchaseLinks.amazon : "";
    return `
      <div class="book-card">
        <div class="book-card-cover-container">
          <img src="${b.cover}" alt="${b.title}" class="book-card-cover">
        </div>
        <div class="book-card-info">
          <h3 class="book-card-title">${b.title}</h3>
          <span class="book-card-author">A. Author tarafından</span>
          <p class="book-card-description">${b.description}</p>
          <div class="book-card-actions">
            ${AmazonBuy ? `<a href="${AmazonBuy}" target="_blank" class="btn btn-secondary btn-sm">Amazon'dan Al</a>` : ''}
            <a href="/books.html" class="btn btn-primary btn-sm">Detaylar</a>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
