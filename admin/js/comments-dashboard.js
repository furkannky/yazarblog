// Comment Moderation Queue dashboard controller (status updates, deletion, article mapping, filtering)
import { injectAdminStructure } from './admin-layout.js';
import { dbService } from '/js/firebase/config.js';
import { showToast } from '/js/components/ui.js';
import { formatDate } from '/js/utils.js';

let comments = [];
let articles = [];
let activeFilter = "all";

// Initialize Layout & Guard
await injectAdminStructure("comments");

// Selectors
const tableBody = document.getElementById("comments-table-body");

// Tabs Binding
document.getElementById("comment-tab-all").addEventListener("click", (e) => toggleTab(e, "all"));
document.getElementById("comment-tab-pending").addEventListener("click", (e) => toggleTab(e, "pending"));
document.getElementById("comment-tab-approved").addEventListener("click", (e) => toggleTab(e, "approved"));
document.getElementById("comment-tab-spam").addEventListener("click", (e) => toggleTab(e, "spam"));

function toggleTab(e, status) {
  document.querySelectorAll(".tab-btn").forEach(btn => btn.classList.remove("active"));
  e.target.classList.add("active");
  activeFilter = status;
  renderComments();
}

async function loadData() {
  try {
    const [comms, arts] = await Promise.all([
      dbService.getCommentsAll(),
      dbService.getArticles()
    ]);
    comments = comms;
    articles = arts;
    
    renderComments();
  } catch (err) {
    showToast("Yorumlar yüklenirken hata oluştu.", "error");
  }
}

function renderComments() {
  if (!tableBody) return;

  const filtered = comments.filter(c => {
    if (activeFilter === "all") return true;
    return c.status === activeFilter;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:3rem; color:var(--text-tertiary);">Bu sekmede yorum bulunamadı.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filtered.map(c => {
    const artMatch = articles.find(a => a.id === c.articleId);
    const artLink = artMatch ? `<a href="/article.html?slug=${artMatch.slug}" target="_blank" style="text-decoration:underline; font-weight:500;">${artMatch.title}</a>` : `<span style="color:var(--text-tertiary);">Bulunamadı (ID: ${c.articleId})</span>`;
    
    let actionButtons = "";
    if (c.status === "pending") {
      actionButtons += `
        <button class="btn btn-secondary btn-sm approve-comment-btn" data-id="${c.id}" style="background-color: var(--success); color: white; border:none;">Onayla</button>
        <button class="btn btn-secondary btn-sm spam-comment-btn" data-id="${c.id}" style="background-color: var(--warning); color: white; border:none;">Spam</button>
      `;
    } else if (c.status === "approved") {
      actionButtons += `
        <button class="btn btn-secondary btn-sm reject-comment-btn" data-id="${c.id}">Onayı Kaldır</button>
        <button class="btn btn-secondary btn-sm spam-comment-btn" data-id="${c.id}" style="background-color: var(--warning); color: white; border:none;">Spam</button>
      `;
    } else if (c.status === "spam") {
      actionButtons += `
        <button class="btn btn-secondary btn-sm reject-comment-btn" data-id="${c.id}">Spam Değil</button>
      `;
    }

    actionButtons += `
      <button class="btn btn-danger btn-sm delete-comment-btn" data-id="${c.id}">Sil</button>
    `;

    let statusText = "Onay Bekliyor";
    if (c.status === "approved") statusText = "Onaylandı";
    else if (c.status === "spam") statusText = "Spam";

    return `
      <tr style="vertical-align: top;">
        <td>
          <div style="font-weight:600;">${escapeHTML(c.authorName)}</div>
          <div style="font-size:0.75rem; color:var(--text-tertiary);"><a href="mailto:${c.authorEmail}">${c.authorEmail}</a></div>
        </td>
        <td>${artLink}</td>
        <td style="max-width:300px; white-space:normal; font-size:0.9rem; color:var(--text-secondary); line-height:1.4;">
          ${escapeHTML(c.content)}
        </td>
        <td style="font-size:0.8rem; white-space:nowrap;">${formatDate(c.createdAt)}</td>
        <td>
          <span class="status-badge ${getStatusBadgeClass(c.status)}">${statusText}</span>
        </td>
        <td style="text-align:right;">
          <div style="display:flex; justify-content:flex-end; gap:0.4rem; flex-wrap:wrap; max-width:200px; margin-left:auto;">
            ${actionButtons}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // Bind clicks
  tableBody.querySelectorAll(".approve-comment-btn").forEach(btn => {
    btn.addEventListener("click", () => updateStatus(btn.getAttribute("data-id"), "approved"));
  });

  tableBody.querySelectorAll(".reject-comment-btn").forEach(btn => {
    btn.addEventListener("click", () => updateStatus(btn.getAttribute("data-id"), "pending"));
  });

  tableBody.querySelectorAll(".spam-comment-btn").forEach(btn => {
    btn.addEventListener("click", () => updateStatus(btn.getAttribute("data-id"), "spam"));
  });

  tableBody.querySelectorAll(".delete-comment-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteComment(btn.getAttribute("data-id")));
  });
}

function getStatusBadgeClass(status) {
  if (status === "approved") return "approved";
  if (status === "spam") return "danger";
  return "pending";
}

async function updateStatus(id, newStatus) {
  try {
    await dbService.updateCommentStatus(id, newStatus);
    const textStatus = newStatus === "approved" ? "Onaylandı" : newStatus === "spam" ? "Spam" : "Onay Bekliyor";
    showToast(`Yorum durumu güncellendi: ${textStatus}`);
    
    // Update local cache
    const match = comments.find(c => c.id === id);
    if (match) match.status = newStatus;
    
    renderComments();
  } catch (err) {
    showToast("Yorum güncellenemedi.", "error");
  }
}

async function deleteComment(id) {
  if (confirm("Bu yorumu kalıcı olarak silmek istediğinizden emin misiniz?")) {
    try {
      await dbService.deleteComment(id);
      showToast("Yorum kalıcı olarak silindi.");
      comments = comments.filter(c => c.id !== id);
      renderComments();
    } catch (err) {
      showToast("Yorum silinirken hata oluştu.", "error");
    }
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

// Load
await loadData();
