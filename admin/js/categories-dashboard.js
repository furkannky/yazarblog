// Category catalog CRUD management (list index sorting priority orders, slug key auto generation)
import { injectAdminStructure } from './admin-layout.js';
import { dbService } from '/js/firebase/config.js';
import { showToast } from '/js/components/ui.js';
import { generateSlug } from '/js/utils.js';

let categories = [];

// Initialize Layout & Guard
await injectAdminStructure("categories");

// Selectors
const tableBody = document.getElementById("categories-table-body");
const form = document.getElementById("category-form");
const editIdInput = document.getElementById("edit-category-id");
const nameInput = document.getElementById("category-name-input");
const slugInput = document.getElementById("category-slug-input");
const orderInput = document.getElementById("category-order-input");
const clearBtn = document.getElementById("btn-clear-category");
const panelTitle = document.getElementById("category-panel-title");

// Clear form button
clearBtn.addEventListener("click", () => resetFormState());

async function loadCategories() {
  try {
    categories = await dbService.getCategories();
    // Sort categories locally by sorting order priority first
    categories.sort((a, b) => (a.order || 0) - (b.order || 0));
    renderCategories();
  } catch (err) {
    showToast("Kategoriler yüklenirken hata oluştu.", "error");
  }
}

function renderCategories() {
  if (!tableBody) return;

  if (categories.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding: 2rem; color:var(--text-tertiary);">Henüz kategori oluşturulmadı.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = categories.map(c => `
    <tr>
      <td style="font-weight:600;">${c.name}</td>
      <td><code>${c.slug}</code></td>
      <td style="font-weight:600;">${c.order || 0}</td>
      <td style="text-align:right;">
        <div style="display:flex; justify-content:flex-end; gap:0.5rem;">
          <button class="btn btn-secondary btn-sm edit-cat-btn" data-id="${c.id}">Düzenle</button>
          <button class="btn btn-danger btn-sm delete-cat-btn" data-id="${c.id}">Sil</button>
        </div>
      </td>
    </tr>
  `).join('');

  tableBody.querySelectorAll(".edit-cat-btn").forEach(btn => {
    btn.addEventListener("click", () => editCategory(btn.getAttribute("data-id")));
  });

  tableBody.querySelectorAll(".delete-cat-btn").forEach(btn => {
    btn.addEventListener("click", () => deleteCategory(btn.getAttribute("data-id")));
  });
}

function editCategory(id) {
  const c = categories.find(item => item.id === id);
  if (!c) return;

  editIdInput.value = c.id;
  nameInput.value = c.name;
  slugInput.value = c.slug;
  orderInput.value = c.order || 0;

  panelTitle.textContent = "Kategoriyi Düzenle";
  clearBtn.style.display = "inline-block";
}

function resetFormState() {
  form.reset();
  editIdInput.value = "";
  panelTitle.textContent = "Kategori Oluştur";
  clearBtn.style.display = "none";
}

async function deleteCategory(id) {
  if (confirm("Bu kategoriyi silmek istediğinizden emin misiniz? Bu kategorideki tüm makaleler genel/kategorisiz olarak ayarlanacaktır.")) {
    try {
      await dbService.deleteCategory(id);
      showToast("Kategori silindi.");
      categories = categories.filter(c => c.id !== id);
      renderCategories();
      resetFormState();
    } catch (err) {
      showToast("Kategori silinirken hata oluştu.", "error");
    }
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = editIdInput.value;
  const name = nameInput.value.trim();
  const rawSlug = slugInput.value.trim();
  const order = parseInt(orderInput.value || "0");

  const slug = rawSlug || generateSlug(name);
  const catData = { name, slug, order };

  try {
    if (id) {
      await dbService.updateCategory(id, catData);
      showToast("Kategori ayarları güncellendi!");
    } else {
      await dbService.createCategory(catData);
      showToast("Kategori başarıyla eklendi!");
    }

    await loadCategories();
    resetFormState();
  } catch (err) {
    showToast("Kategori kaydedilirken hata oluştu.", "error");
  }
});

// Run Initial load config
await loadCategories();
