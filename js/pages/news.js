import { dbService } from '../firebase/config.js';
import { createGridSkeleton } from '../components/ui.js';

export async function initNewsPage() {
  const newsFeed = document.getElementById("news-catalog-feed");
  if (!newsFeed) return;

  createGridSkeleton("#news-catalog-feed", 6);

  try {
    const news = await dbService.getNews(100);
    renderNews(news, newsFeed);
  } catch (error) {
    console.error("Error loading news:", error);
    newsFeed.innerHTML = `<p style="text-align:center; grid-column: 1/-1;">Haberler yüklenirken bir sorun oluştu.</p>`;
  }
}

function renderNews(newsArray, container) {
  if (!newsArray.length) {
    container.innerHTML = `<p style="text-align:center; grid-column: 1/-1; padding: 4rem;">Henüz bir haber veya duyuru bulunmuyor.</p>`;
    return;
  }

  container.innerHTML = newsArray.map(item => `
    <article class="card article-card scroll-trigger">
      ${item.coverUrl ? `
        <div class="article-card-cover">
          <img src="${item.coverUrl}" alt="${item.title}">
        </div>
      ` : ''}
      <div class="article-card-content">
        <div class="article-card-meta">
          <span class="article-card-category">Haber</span>
          <span>•</span>
          <span>${item.dateString}</span>
        </div>
        <h3 class="article-card-title">${item.title}</h3>
        <p class="article-card-summary">${item.summary || item.content.substring(0, 150) + '...'}</p>
      </div>
    </article>
  `).join('');
}
