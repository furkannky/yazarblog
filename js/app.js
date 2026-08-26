// Central Application Bootstrap Router (Vanilla ES6 Modular Coordinator)
import { injectHeader, injectFooter, initScrollEffects } from './components/ui.js';
import { initGlobalSearch } from './components/search.js';

// Page Initializers
import { initHomePage } from './pages/home.js';
import { initArticlesPage } from './pages/articles.js';
import { initArticlePage } from './pages/article.js';
import { initBooksPage } from './pages/books.js';
import { initNewsPage } from './pages/news.js';
import { initContactPage } from './pages/contact.js';
import { initPdfsPage } from './pages/pdfs.js';

// About page doesn't need dynamic content, just scroll effects
const initAboutPage = () => {
  console.log('About page initialized');
  return Promise.resolve();
};

document.addEventListener("DOMContentLoaded", async () => {
  // Detect Current Page
  const path = window.location.pathname;
  let activeTab = "";

  if (path === "/" || path.endsWith("/index.html") || path === "") {
    activeTab = "home";
  } else if (path.endsWith("/about.html")) {
    activeTab = "about";
  } else if (path.endsWith("/articles.html")) {
    activeTab = "articles";
  } else if (path.endsWith("/article.html")) {
    activeTab = "articles"; // Share active link state
  } else if (path.endsWith("/books.html")) {
    activeTab = "books";
  } else if (path.endsWith("/news.html")) {
    activeTab = "news";
  } else if (path.endsWith("/contact.html")) {
    activeTab = "contact";
  } else if (path.endsWith("/pdf-library.html")) {
    activeTab = "pdfs";
  }

  // Inject structural nodes
  await injectHeader(activeTab);
  await injectFooter();

  // Initialize global interactions
  initScrollEffects();
  // initGlobalSearch(); // Arama modalı istenmediği için pasif edildi

  // Load page-specific business workflows
  if (activeTab === "home") {
    await initHomePage();
  } else if (activeTab === "about") {
    await initAboutPage();
  } else if (activeTab === "articles" && path.endsWith("/articles.html")) {
    await initArticlesPage();
  } else if (activeTab === "articles" && path.endsWith("/article.html")) {
    await initArticlePage();
  } else if (activeTab === "books") {
    await initBooksPage();
  } else if (activeTab === "news") {
    await initNewsPage();
  } else if (activeTab === "contact") {
    await initContactPage();
  } else if (activeTab === "pdfs") {
    await initPdfsPage();
  }
});
