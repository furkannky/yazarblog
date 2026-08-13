// PDF library controller (filtering, search, download counters, metadata display)
import { dbService } from '../firebase/config.js';
import { createGridSkeleton, showToast } from '../components/ui.js';
import { formatDate } from '../utils.js';

let pdfs = [];
let filteredPdfs = [];
let categories = [];
let activeCategory = "all";
let searchQuery = "";

export async function initPdfsPage() {
  createGridSkeleton("#pdf-catalogue-root", 3, "pdf");

  try {
    const [fetchedCats, fetchedPdfs] = await Promise.all([
      dbService.getCategories(),
      dbService.getPdfs()
    ]);

    categories = fetchedCats;
    pdfs = fetchedPdfs.filter(p => p.visible !== false);
    filteredPdfs = [...pdfs];

    renderCategoryToggles();
    renderPdfsGrid();

    // Bind Search Input keyword filters
    const searchInput = document.getElementById("pdf-search-bar");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        applyFilters();
      });
    }

  } catch (error) {
    console.error("Failed to load PDF library items:", error);
    showToast("Belge kataloğu yüklenirken hata oluştu.", "error");
  }
}

function renderCategoryToggles() {
  const root = document.getElementById("pdf-category-toggles");
  if (!root) return;

  const html = `
    <li><a href="#" class="active" data-id="all">Tüm Dosyalar</a></li>
    ${categories.map(c => `
      <li><a href="#" data-id="${c.id}">${c.name}</a></li>
    `).join('')}
  `;
  root.innerHTML = html;

  root.querySelectorAll("a").forEach(tag => {
    tag.addEventListener("click", (e) => {
      e.preventDefault();
      root.querySelectorAll("a").forEach(t => t.classList.remove("active"));
      tag.classList.add("active");
      activeCategory = tag.getAttribute("data-id");
      applyFilters();
    });
  });
}

function applyFilters() {
  filteredPdfs = pdfs.filter(p => {
    const categoryMatch = activeCategory === "all" || p.category === activeCategory;
    const searchMatch = !searchQuery || 
      p.title.toLowerCase().includes(searchQuery) ||
      (p.description && p.description.toLowerCase().includes(searchQuery));
    
    return categoryMatch && searchMatch;
  });

  renderPdfsGrid();
}

function renderPdfsGrid() {
  const root = document.getElementById("pdf-catalogue-root");
  if (!root) return;

  if (filteredPdfs.length === 0) {
    root.innerHTML = `<div style="text-align:center; grid-column: 1/-1; padding: 4rem 0; color: var(--text-secondary);">İsteğinize uygun belge bulunamadı.</div>`;
    return;
  }

  root.innerHTML = filteredPdfs.map(p => {
    return `
      <div class="pdf-card">
        <div class="pdf-header">
          <div class="pdf-icon-wrapper">PDF</div>
          <span style="font-size:0.8rem; font-weight:600; color:var(--text-tertiary);">${p.fileSize}</span>
        </div>
        <div class="pdf-details">
          <h3 class="pdf-title">${p.title}</h3>
          <p style="color:var(--text-secondary); font-size:0.875rem; margin-bottom:0.75rem; min-height: 40px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
            ${p.description || 'Giriş bölümü veya analiz özeti.'}
          </p>
          <div class="pdf-meta">
            <span>Yüklendi: ${formatDate(p.uploadDate)}</span>
          </div>
        </div>
        <div class="pdf-actions">
          <span class="pdf-stats" id="download-count-${p.id}">📥 ${p.downloads || 0} indirme</span>
          <button class="btn btn-primary btn-sm start-pdf-download-btn" data-id="${p.id}" data-title="${p.title}">
            İndir
          </button>
        </div>
      </div>
    `;
  }).join('');

  // Bind Downloads Triggers
  root.querySelectorAll(".start-pdf-download-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      const title = btn.getAttribute("data-title");
      
      showToast(`İndiriliyor: ${title}`);
      
      // Trigger synchronous download FIRST to maintain user gesture
      triggerBrowserDownload(title);
      
      // Background increment
      dbService.incrementPdfDownloads(id)
        .then((newCount) => {
          if (newCount) {
            const countSpans = document.querySelectorAll(`#download-count-${id}`);
            countSpans.forEach(span => span.textContent = `📥 ${newCount} indirme`);
            
            const inMemPdf = pdfs.find(p => p.id === id);
            if (inMemPdf) inMemPdf.downloads = newCount;
            const inMemFiltered = filteredPdfs.find(p => p.id === id);
            if (inMemFiltered) inMemFiltered.downloads = newCount;
          }
        })
        .catch(err => console.error("Increment fail:", err));
    });
  });
}

function triggerBrowserDownload(filename) {
  // Generates dummy PDF content stream for modular client side files
  const data = new Blob(["%PDF-1.4 Mock file stream content representing " + filename], { type: "application/pdf" });
  const url = window.URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename.replace(/\s+/g, "_")}.pdf`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
}
