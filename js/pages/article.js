// Single Article Viewer Controller (Rich content injection, view counter, related recommendations, and moderated comment submission)
import { dbService } from '../firebase/config.js';
import { formatDate, calculateReadingTime, shareOnTwitter, shareOnFacebook, copyToClipboard } from '../utils.js';
import { showToast } from '../components/ui.js';

let currentArticle = null;

export async function initArticlePage() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    renderError("Geçersiz makale bağlantısı.");
    return;
  }

  try {
    // 1. Fetch Article by Slug
    currentArticle = await dbService.getArticleBySlug(slug);
    if (!currentArticle) {
      renderError("İstenen yazı bulunamadı.");
      return;
    }

    // 2. Increment view count instantly
    const newViews = await dbService.incrementArticleViews(currentArticle.id);
    currentArticle.views = newViews;

    // 3. Populate Page Metadata & Body
    renderArticleDetails();

    // 4. Set document title for SEO
    document.title = currentArticle.seoTitle || `${currentArticle.title} | A. Author`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", currentArticle.seoDescription || currentArticle.summary);

    // 5. Load and Render Comments
    await loadComments();

    // 6. Bind Comment Form Submission
    bindCommentForm();

    // 7. Bind Social Actions
    bindShareButtons();

    // 8. Render Read Next recommendations
    await loadRelatedArticles();

  } catch (error) {
    console.error("Failed to load article:", error);
    renderError("Makale yüklenirken bir hata oluştu.");
  }
}

function renderError(message) {
  const main = document.querySelector("main");
  if (main) {
    main.innerHTML = `
      <div style="text-align:center; padding:5rem 2rem; max-width:600px; margin:0 auto;">
        <h2 style="font-family:var(--font-serif); margin-bottom:1.5rem;">Hata!</h2>
        <p style="color:var(--text-secondary); margin-bottom:2.5rem;">${message}</p>
        <a href="/articles.html" class="btn btn-primary">Yazılara Geri Dön</a>
      </div>
    `;
  }
}

function renderArticleDetails() {
  const art = currentArticle;
  document.getElementById("article-view-title").textContent = art.title;
  document.getElementById("article-view-date").textContent = formatDate(art.publishedAt);
  document.getElementById("article-view-reading-time").textContent = calculateReadingTime(art.content);
  document.getElementById("article-view-counter").textContent = `${art.views} görüntülenme`;
  document.getElementById("article-view-cover-img").src = art.cover;
  document.getElementById("article-view-cover-img").alt = art.title;
  
  // Content Injection
  document.getElementById("article-view-body-root").innerHTML = art.content;

  // Tags Section
  const tagsRoot = document.getElementById("article-view-tags-root");
  if (tagsRoot) {
    if (art.tags && art.tags.length > 0) {
      tagsRoot.innerHTML = art.tags.map(tag => `
        <span class="article-tag">${tag}</span>
      `).join('');
    } else {
      tagsRoot.innerHTML = "";
    }
  }

  // Set Category Tag
  const categoryBadge = document.getElementById("article-view-category");
  if (categoryBadge && art.categories && art.categories.length > 0) {
    // Just fetch first category placeholder names or call async names
    dbService.getCategories().then(list => {
      const match = list.find(c => c.id === art.categories[0]);
      if (match) categoryBadge.textContent = match.name;
    });
  }
}

async function loadComments() {
  const listRoot = document.getElementById("comments-timeline-list");
  const countBadge = document.getElementById("comments-count-badge");
  if (!listRoot) return;

  listRoot.innerHTML = `
    <div style="text-align:center; padding:1.5rem; color:var(--text-tertiary);">Yorumlar yükleniyor...</div>
  `;

  try {
    const list = await dbService.getComments(currentArticle.id);
    countBadge.textContent = list.length;

    if (list.length === 0) {
      listRoot.innerHTML = `
        <li style="text-align:center; color: var(--text-tertiary); padding: 2rem 0;">Bu yazı için henüz yorum yapılmamış. Düşüncelerinizi paylaşan ilk kişi olun!</li>
      `;
      return;
    }

    listRoot.innerHTML = list.map(c => `
      <li class="comment-item">
        <div class="comment-header">
          <span class="comment-author">${escapeHTML(c.authorName)}</span>
          <span class="comment-date">${formatDate(c.createdAt)}</span>
        </div>
        <div class="comment-body">
          <p>${escapeHTML(c.content).replace(/\n/g, '<br>')}</p>
        </div>
      </li>
    `).join('');

  } catch (error) {
    console.error("Failed to load comments:", error);
    listRoot.innerHTML = `<li style="color:var(--danger); padding:1rem;">Yorum listesi yüklenemedi.</li>`;
  }
}

function bindCommentForm() {
  const form = document.getElementById("article-comment-submit-form");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nameVal = document.getElementById("comment-author-name").value.trim();
    const emailVal = document.getElementById("comment-author-email").value.trim();
    const bodyVal = document.getElementById("comment-message-body").value.trim();
    const spamVal = parseInt(document.getElementById("comment-spam-challenge").value.trim());

    // Spam Protection
    if (spamVal !== 8) {
      showToast("Spam koruması doğrulaması başarısız. Lütfen işlemi çözün: 5 + 3.", "error");
      return;
    }

    try {
      const commentData = {
        articleId: currentArticle.id,
        authorName: nameVal,
        authorEmail: emailVal,
        content: bodyVal
      };

      await dbService.createComment(commentData);
      showToast("Yorumunuz iletildi! Yönetici tarafından onaylandıktan sonra görünecektir.");
      form.reset();

    } catch (error) {
      console.error("Failed to submit comment:", error);
      showToast("Gönderim başarısız oldu. Tekrar deneyin.", "error");
    }
  });
}

function bindShareButtons() {
  const url = window.location.href;
  const title = currentArticle ? currentArticle.title : document.title;

  document.getElementById("share-btn-twitter").addEventListener("click", () => {
    shareOnTwitter(title, url);
  });

  document.getElementById("share-btn-facebook").addEventListener("click", () => {
    shareOnFacebook(url);
  });

  document.getElementById("share-btn-link").addEventListener("click", () => {
    copyToClipboard(url).then(() => {
      showToast("Bağlantı panoya kopyalandı!");
    }).catch(err => {
      showToast("Bağlantı kopyalanamadı.", "error");
    });
  });
}

async function loadRelatedArticles() {
  const root = document.getElementById("related-articles-root");
  if (!root) return;

  try {
    const list = await dbService.getArticles();
    // Exclude current article, match categories if overlapping
    const related = list
      .filter(a => a.status === "published" && a.id !== currentArticle.id)
      .filter(a => a.categories.some(c => currentArticle.categories.includes(c)))
      .slice(0, 2);

    // Fallback if no matching categories
    const finalRelated = related.length > 0 ? related : list.filter(a => a.status === "published" && a.id !== currentArticle.id).slice(0, 2);

    if (finalRelated.length === 0) {
      root.parentElement.style.display = "none";
      return;
    }

    root.innerHTML = finalRelated.map(a => {
      const readTime = calculateReadingTime(a.content);
      return `
        <article class="card article-card">
          <div class="article-card-cover">
            <a href="/article.html?slug=${a.slug}"><img src="${a.cover}" alt="${a.title}"></a>
          </div>
          <div class="article-card-content">
            <div class="article-card-meta">
              <span class="article-card-category">Sıradaki Yazı</span>
              <span>•</span>
              <span>${formatDate(a.publishedAt)}</span>
            </div>
            <h4 class="article-card-title" style="font-size:1.15rem;"><a href="/article.html?slug=${a.slug}">${a.title}</a></h4>
            <div class="article-card-footer" style="padding-top:0.75rem; font-size:0.8rem;">
              <span>${readTime}</span>
              <span>${a.views} okuma</span>
            </div>
          </div>
        </article>
      `;
    }).join('');

  } catch (error) {
    console.error("Failed to load related articles:", error);
    root.parentElement.style.display = "none";
  }
}

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
