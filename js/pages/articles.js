// Articles listing and catalog control (Category toggles, Search, Views-based sidebar, and Pagination)
import { dbService } from '../firebase/config.js';
import { formatDate, calculateReadingTime } from '../utils.js';
import { createGridSkeleton, showToast } from '../components/ui.js';

let articles = [];
let filteredArticles = [];
let categories = [];
let activeCategory = "all";
let searchQuery = "";
let currentPage = 1;
const itemsPerPage = 5;

export async function initArticlesPage() {
  createGridSkeleton("#articles-catalog-feed", 3, "card");
  
  try {
    // 1. Fetch categories & articles concurrently
    const [fetchedCategories, fetchedArticles] = await Promise.all([
      dbService.getCategories(),
      dbService.getArticles()
    ]);

    categories = fetchedCategories;
    articles = fetchedArticles.filter(a => a.status === "published");
    filteredArticles = [...articles];

    // 2. Render Filters & Sidebar
    renderCategoryFilters();
    renderPopularSidebar();

    // 3. Render Catalog feed
    renderArticlesFeed();

    // 4. Bind Search
    const searchInput = document.getElementById("article-catalog-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        currentPage = 1;
        applyFilters();
      });
    }

  } catch (error) {
    console.error("Failed to load article catalogs:", error);
    showToast("Yazı akışı yüklenirken hata oluştu.", "error");
  }
}

function renderCategoryFilters() {
  const root = document.getElementById("category-filter-list");
  if (!root) return;

  const html = `
    <li><a href="#" class="active" data-id="all">Tüm Konular</a></li>
    ${categories.map(c => `
      <li><a href="#" data-id="${c.id}">${c.name}</a></li>
    `).join('')}
  `;
  root.innerHTML = html;

  // Bind click listeners
  const tags = root.querySelectorAll("a");
  tags.forEach(tag => {
    tag.addEventListener("click", (e) => {
      e.preventDefault();
      tags.forEach(t => t.classList.remove("active"));
      tag.classList.add("active");
      activeCategory = tag.getAttribute("data-id");
      currentPage = 1;
      applyFilters();
    });
  });
}

function applyFilters() {
  filteredArticles = articles.filter(a => {
    // Category match
    const categoryMatch = activeCategory === "all" || a.categories.includes(activeCategory);
    // Search match
    const searchMatch = !searchQuery || 
      a.title.toLowerCase().includes(searchQuery) || 
      a.summary.toLowerCase().includes(searchQuery) ||
      a.tags.some(tag => tag.toLowerCase().includes(searchQuery));
    
    return categoryMatch && searchMatch;
  });

  renderArticlesFeed();
}

function renderArticlesFeed() {
  const root = document.getElementById("articles-catalog-feed");
  if (!root) return;

  if (filteredArticles.length === 0) {
    root.innerHTML = `<div style="text-align:center; padding: 3rem 0; color: var(--text-secondary);">Arama veya filtreleme kriterlerinize uygun yazı bulunamadı.</div>`;
    document.getElementById("pagination-controls").innerHTML = "";
    return;
  }

  // Calculate slice pagination coordinates
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageItems = filteredArticles.slice(startIndex, endIndex);

  root.innerHTML = pageItems.map(a => {
    const readTime = calculateReadingTime(a.content);
    return `
      <article class="card article-card" style="flex-direction:row; margin-bottom:1.5rem; gap:1.5rem; align-items:center; min-height: 180px;">
        <div class="article-card-cover" style="width:200px; height:180px; flex-shrink:0;">
          <a href="/article.html?slug=${a.slug}" style="width:100%; height:100%;"><img src="${a.cover}" alt="${a.title}" style="width:100%; height:100%; object-fit:cover;"></a>
        </div>
        <div class="article-card-content" style="padding:1rem; border:none; flex-grow:1;">
          <div class="article-card-meta">
            <span class="article-card-category">${getCategoryNames(a.categories)}</span>
            <span>•</span>
            <span>${formatDate(a.publishedAt)}</span>
          </div>
          <h3 class="article-card-title" style="font-size:1.35rem; margin-bottom:0.5rem;"><a href="/article.html?slug=${a.slug}">${a.title}</a></h3>
          <p class="article-card-summary" style="margin-bottom:0.75rem; -webkit-line-clamp:2;">${a.summary}</p>
          <div class="article-card-footer" style="padding-top:0.75rem;">
            <span>${readTime}</span>
            <span>${a.views} okuma</span>
          </div>
        </div>
      </article>
    `;
  }).join('');

  renderPaginationControls();
}

function getCategoryNames(catIds) {
  if (!catIds || catIds.length === 0) return "Makale";
  return catIds.map(id => {
    const match = categories.find(c => c.id === id);
    return match ? match.name : "";
  }).filter(n => n.length > 0).join(', ');
}

function renderPopularSidebar() {
  const root = document.getElementById("popular-articles-sidebar");
  if (!root) return;

  // Sort by highest view count
  const sorted = [...articles].sort((a,b) => (b.views || 0) - (a.views || 0)).slice(0, 4);

  if (sorted.length === 0) {
    root.innerHTML = `<div style="font-size:0.875rem; color:var(--text-secondary);">Gösterilecek popüler yazı bulunmuyor.</div>`;
    return;
  }

  root.innerHTML = sorted.map(a => `
    <div style="display:flex; flex-direction:column; gap:0.25rem;">
      <h4 style="font-size:0.95rem; font-family:var(--font-serif); font-weight:600; line-height:1.3;"><a href="/article.html?slug=${a.slug}">${a.title}</a></h4>
      <div style="font-size:0.75rem; color:var(--text-tertiary); display:flex; gap:0.5rem;">
        <span>${formatDate(a.publishedAt)}</span>
        <span>•</span>
        <span>${a.views} okuma</span>
      </div>
    </div>
  `).join('');
}

function renderPaginationControls() {
  const root = document.getElementById("pagination-controls");
  if (!root) return;

  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  if (totalPages <= 1) {
    root.innerHTML = "";
    return;
  }

  let html = `
    <button class="pagination-btn" id="prev-page-btn" ${currentPage === 1 ? 'disabled' : ''}>&larr;</button>
  `;

  for (let i = 1; i <= totalPages; i++) {
    html += `
      <button class="pagination-btn ${currentPage === i ? 'active' : ''}" data-page="${i}">${i}</button>
    `;
  }

  html += `
    <button class="pagination-btn" id="next-page-btn" ${currentPage === totalPages ? 'disabled' : ''}>&rarr;</button>
  `;

  root.innerHTML = html;

  // Bind clicks
  root.querySelectorAll(".pagination-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const pageAttr = btn.getAttribute("data-page");
      if (pageAttr) {
        currentPage = parseInt(pageAttr);
      } else if (btn.id === "prev-page-btn") {
        currentPage = Math.max(1, currentPage - 1);
      } else if (btn.id === "next-page-btn") {
        currentPage = Math.min(totalPages, currentPage + 1);
      }
      renderArticlesFeed();
      window.scrollTo({ top: document.querySelector(".filter-bar").offsetTop - 100, behavior: 'smooth' });
    });
  });
}
