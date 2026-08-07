// Global Instant Search Component (Algolia/Spotlight Styled Modal)
import { dbService } from '../firebase/config.js';
import { debounce } from '../utils.js';

export function initGlobalSearch() {
  // Inject Search Trigger to header search button
  const searchBtns = document.querySelectorAll(".search-toggle-btn");
  searchBtns.forEach(btn => {
    btn.addEventListener("click", () => openSearchModal());
  });

  // Create Modal element if not exists
  let searchModal = document.getElementById("search-modal");
  if (!searchModal) {
    searchModal = document.createElement("div");
    searchModal.id = "search-modal";
    searchModal.className = "modal-overlay";
    searchModal.innerHTML = `
      <div class="modal-box" style="max-width: 650px; padding: 1.5rem;">
        <div style="display:flex; align-items:center; gap: 0.75rem; border-bottom: 2px solid var(--border-color); padding-bottom: 0.75rem; margin-bottom: 1.5rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input type="text" id="global-search-input" placeholder="Makaleler, kitaplar, dosyalar arasında ara..." style="border:none; outline:none; background:none; font-size:1.15rem; width:100%; color:var(--text-primary);" />
          <button id="close-search-btn" style="color:var(--text-tertiary); font-size: 1.5rem; line-height: 1;">&times;</button>
        </div>
        <div id="search-results-panel" style="display:flex; flex-direction:column; gap:1.5rem; max-height: 380px; overflow-y:auto; padding-right:0.5rem;">
          <div class="search-empty-state" style="text-align:center; color:var(--text-tertiary); padding: 2rem 0;">
            Arama yapmak için en az 2 karakter girin
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(searchModal);

    // Bind event listeners
    const searchInput = searchModal.querySelector("#global-search-input");
    const closeBtn = searchModal.querySelector("#close-search-btn");
    
    closeBtn.addEventListener("click", () => closeSearchModal());
    searchModal.addEventListener("click", (e) => {
      if (e.target === searchModal) closeSearchModal();
    });

    // Debounced search trigger
    searchInput.addEventListener("input", debounce(async (e) => {
      const q = e.target.value.trim().toLowerCase();
      await executeSearch(q);
    }, 250));

    // Keyboard ESC listener
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && searchModal.classList.contains("show")) {
        closeSearchModal();
      }
    });
  }
}

export function openSearchModal() {
  const modal = document.getElementById("search-modal");
  if (modal) {
    modal.classList.add("show");
    const input = modal.querySelector("#global-search-input");
    if (input) {
      input.value = "";
      input.focus();
    }
    const resultsPanel = modal.querySelector("#search-results-panel");
    if (resultsPanel) {
      resultsPanel.innerHTML = `<div class="search-empty-state" style="text-align:center; color:var(--text-tertiary); padding: 2rem 0;">Arama yapmak için en az 2 karakter girin</div>`;
    }
  }
}

export function closeSearchModal() {
  const modal = document.getElementById("search-modal");
  if (modal) {
    modal.classList.remove("show");
  }
}

async function executeSearch(query) {
  const resultsPanel = document.getElementById("search-results-panel");
  if (!resultsPanel) return;

  if (query.length < 2) {
    resultsPanel.innerHTML = `<div class="search-empty-state" style="text-align:center; color:var(--text-tertiary); padding: 2rem 0;">Arama yapmak için en az 2 karakter girin</div>`;
    return;
  }

  resultsPanel.innerHTML = `<div style="text-align:center; color:var(--text-tertiary); padding: 1.5rem 0;">Aranıyor...</div>`;

  try {
    // Collect all collections
    const [articles, books, pdfs] = await Promise.all([
      dbService.getArticles(),
      dbService.getBooks(),
      dbService.getPdfs()
    ]);

    // Filter results
    const matchingArticles = articles.filter(a => 
      a.status === "published" && 
      (a.title.toLowerCase().includes(query) || 
       a.summary.toLowerCase().includes(query) || 
       a.tags.some(t => t.toLowerCase().includes(query)))
    );

    const matchingBooks = books.filter(b => 
      b.title.toLowerCase().includes(query) || 
      b.description.toLowerCase().includes(query)
    );

    const matchingPdfs = pdfs.filter(p => 
      p.visible && 
      (p.title.toLowerCase().includes(query) || 
       (p.description && p.description.toLowerCase().includes(query)))
    );

    const totalResults = matchingArticles.length + matchingBooks.length + matchingPdfs.length;

    if (totalResults === 0) {
      resultsPanel.innerHTML = `<div class="search-empty-state" style="text-align:center; color:var(--text-tertiary); padding: 2rem 0;">"${query}" için sonuç bulunamadı</div>`;
      return;
    }

    let html = "";

    // Books results
    if (matchingBooks.length > 0) {
      html += `
        <div>
          <h4 style="font-size:0.8rem; font-weight:600; text-transform:uppercase; color:var(--text-tertiary); margin-bottom:0.5rem; letter-spacing:0.05em;">Kitaplar (${matchingBooks.length})</h4>
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            ${matchingBooks.map(b => `
              <a href="/books.html" style="display:flex; align-items:center; gap:1rem; padding:0.75rem; border-radius:var(--radius-sm); background-color:var(--bg-secondary); border:1px solid var(--border-color); transition:all var(--transition-fast);">
                <img src="${b.cover}" style="width:30px; height:40px; object-fit:cover; border-radius:2px; box-shadow:0 2px 4px rgba(0,0,0,0.1);" />
                <div>
                  <div style="font-weight:600; font-size:0.95rem; color:var(--text-primary);">${b.title}</div>
                  <div style="font-size:0.8rem; color:var(--text-secondary); display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;">${b.description}</div>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    // Articles results
    if (matchingArticles.length > 0) {
      html += `
        <div>
          <h4 style="font-size:0.8rem; font-weight:600; text-transform:uppercase; color:var(--text-tertiary); margin-bottom:0.5rem; letter-spacing:0.05em;">Makaleler (${matchingArticles.length})</h4>
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            ${matchingArticles.map(a => `
              <a href="/article.html?slug=${a.slug}" style="display:flex; align-items:center; gap:1rem; padding:0.75rem; border-radius:var(--radius-sm); background-color:var(--bg-secondary); border:1px solid var(--border-color); transition:all var(--transition-fast);">
                <img src="${a.cover}" style="width:50px; height:30px; object-fit:cover; border-radius:2px; fill:var(--border-color);" />
                <div>
                  <div style="font-weight:600; font-size:0.95rem; color:var(--text-primary);">${a.title}</div>
                  <div style="font-size:0.8rem; color:var(--text-secondary); display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;">${a.summary}</div>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    // PDF Results
    if (matchingPdfs.length > 0) {
      html += `
        <div>
          <h4 style="font-size:0.8rem; font-weight:600; text-transform:uppercase; color:var(--text-tertiary); margin-bottom:0.5rem; letter-spacing:0.05em;">PDF Kütüphanesi (${matchingPdfs.length})</h4>
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            ${matchingPdfs.map(p => `
              <a href="/pdf-library.html" style="display:flex; align-items:center; gap:1rem; padding:0.75rem; border-radius:var(--radius-sm); background-color:var(--bg-secondary); border:1px solid var(--border-color); transition:all var(--transition-fast);">
                <div style="width:36px; height:36px; border-radius:3px; background-color:var(--danger-light); color:var(--danger); display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:0.8rem;">PDF</div>
                <div>
                  <div style="font-weight:600; font-size:0.95rem; color:var(--text-primary);">${p.title}</div>
                  <div style="font-size:0.8rem; color:var(--text-secondary);">${p.fileSize} • Yüklendi: ${p.uploadDate}</div>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
      `;
    }

    resultsPanel.innerHTML = html;

  } catch (error) {
    console.error("Search failed:", error);
    resultsPanel.innerHTML = `<div style="text-align:center; color:var(--danger); padding: 1.5rem 0;">Arama başarısız oldu. Tekrar deneyin.</div>`;
  }
}
