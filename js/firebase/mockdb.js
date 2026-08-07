// Mock Database System using localStorage to enable instant previewing and CRUD testing
export const InitialData = {
  categories: [
    { id: "cat-1", name: "Literature", slug: "literature", order: 1 },
    { id: "cat-2", name: "History", slug: "history", order: 2 },
    { id: "cat-3", name: "Science", slug: "science", order: 3 },
    { id: "cat-4", name: "Religion", slug: "religion", order: 4 },
    { id: "cat-5", name: "Education", slug: "education", order: 5 },
  ],
  articles: [
    {
      id: "art-1",
      title: "The Art of Writing in the Digital Age",
      slug: "art-of-writing-digital-age",
      summary:
        "Explore how modern digital tools and distribution mechanisms are reframing the relationship between writers and their audiences.",
      content: `<h2>The Evolution of the Written Word</h2>
<p>For centuries, the printing press was the final gatekeeper of written expression. Today, authors have direct, instantaneous channels to global readers. This shift has altered not only how we publish, but how we write.</p>
<blockquote>"The digital age doesn't change the heart of storytelling, but it multiplies the mirrors through which it is reflected."</blockquote>
<h2>The Rise of Micro-Publishing and Feedback Loops</h2>
<p>Unlike traditional editorial schedules, web newsletters and reader platforms allow authors to release pieces, collect critical commentary, and update work iteratively. This breeds a live relationship where books can develop in public spaces.</p>
<h3>Tools of the Modern Author</h3>
<ul>
  <li>Collaborative outline sheets like Notion.</li>
  <li>Direct email newsletter platforms.</li>
  <li>Interactive read-tracking analytical dashboards.</li>
</ul>
<p>Ultimately, a successful voice requires balancing modern digital platforms with classical, deep focus.</p>`,
      cover:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><defs><linearGradient id='g1' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%23495874;stop-opacity:1' /><stop offset='100%' style='stop-color:%23182030;stop-opacity:1' /></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g1)'/><text x='50%' y='45%' font-family='Georgia, serif' font-size='32' fill='%23ffffff' text-anchor='middle'>The Art of Writing</text><text x='50%' y='55%' font-family='sans-serif' font-size='16' fill='%23a0aec0' letter-spacing='2' text-anchor='middle'>DIGITAL PUBLISHING IDEAS</text></svg>",
      categories: ["cat-1"],
      tags: ["Writing", "Technology", "Publishing"],
      readTime: "3 min read",
      views: 145,
      status: "published",
      publishedAt: "2026-08-01T14:30:00.000Z",
      seoTitle: "The Art of Writing in the Digital Age | Professional Author",
      seoDescription:
        "Examine the dynamic shifts of publishing, reader interaction, and storytelling tools in modern systems.",
    },
    {
      id: "art-2",
      title: "Forgotten Capitals: A Journey Through Byzantine Architecture",
      slug: "forgotten-capitals-byzantine-architecture",
      summary:
        "An architectural analysis of medieval Byzantine design, tracking its evolution from Constantine structures to the late Paleo-Christian domes.",
      content: `<h2>The Grand Domes of Byzantium</h2>
<p>Byzantine engineering combined classical Roman proportions with complex geometric domes. These structures were not simply places of assembly; they represented heaven on earth through physical forms.</p>
<table>
  <thead>
    <tr>
      <th>Structure</th>
      <th>Location</th>
      <th>Key Architectural Feature</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Hagia Sophia</td>
      <td>Istanbul</td>
      <td>Pendentives supporting a 31m Dome</td>
    </tr>
    <tr>
      <td>San Vitale</td>
      <td>Ravenna</td>
      <td>Octagonal plan and exquisite mosaics</td>
    </tr>
  </tbody>
</table>
<h2>Spanning the Eastern Empire</h2>
<p>By using bricks and lightweight mortar instead of heavy Roman concrete, builders achieved height and complex illumination heights through clerestory windows.</p>`,
      cover:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><defs><linearGradient id='g2' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%238c3a3a;stop-opacity:1' /><stop offset='100%' style='stop-color:%23321515;stop-opacity:1' /></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g2)'/><text x='50%' y='45%' font-family='Georgia, serif' font-size='32' fill='%23ffffff' text-anchor='middle'>Forgotten Capitals</text><text x='50%' y='55%' font-family='sans-serif' font-size='16' fill='%23ff9999' letter-spacing='2' text-anchor='middle'>BYZANTINE ARCHITECTURE</text></svg>",
      categories: ["cat-2"],
      tags: ["History", "Architecture", "Art"],
      readTime: "5 min read",
      views: 98,
      status: "published",
      publishedAt: "2026-08-03T10:15:00.000Z",
      seoTitle: "Byzantine Architecture, Capitals & Domes History",
      seoDescription:
        "An in-depth article evaluating Byzantine domes, engineering materials and royal structures.",
    },
    {
      id: "art-3",
      title: "Understanding Quantum Entanglement and Local Realism",
      slug: "understanding-quantum-entanglement",
      summary:
        "Exploring the fundamentals of Einstein's 'spooky action at a distance' and the experiments verifying non-local physical states.",
      content: `<h2>The Einstein-Podolsky-Rosen Paradox</h2>
<p>In 1935, Einstein and his colleagues questioned whether quantum mechanics offered a complete description of physical reality. They argued that particles should possess pre-determined states prior to measurement.</p>
<h2>Bell's Theorem and the Modern Proving Ground</h2>
<p>John Bell demonstrated that no local hidden variable theory could reproduce the predictions of quantum mechanics. Modern experiments have repeatedly validated quantum predictions, with implications for quantum computing.</p>`,
      cover:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'><defs><linearGradient id='g3' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%232a5a67;stop-opacity:1' /><stop offset='100%' style='stop-color:%2311262d;stop-opacity:1' /></linearGradient></defs><rect width='100%' height='100%' fill='url(%23g3)'/><text x='50%' y='45%' font-family='Georgia, serif' font-size='32' fill='%23ffffff' text-anchor='middle'>Quantum Entanglement</text><text x='50%' y='55%' font-family='sans-serif' font-size='16' fill='%238be2ef' letter-spacing='2' text-anchor='middle'>QUANTUM PHYSICS</text></svg>",
      categories: ["cat-3"],
      tags: ["Science", "Quantum", "Physics"],
      readTime: "4 min read",
      views: 220,
      status: "published",
      publishedAt: "2026-08-05T09:00:00.000Z",
      seoTitle: "Understanding Quantum Entanglement Theory",
      seoDescription:
        "Examine quantum physics, Bell's inequality, research foundations and modern breakthroughs.",
    },
  ],
  books: [
    {
      id: "book-1",
      title: "Echoes of the Past: Byzantine Echoes",
      description:
        "An extensive exploration of ancient city planning, trade routes, and royal court architectures throughout the Eastern Aegean Basin.",
      cover:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'><defs><linearGradient id='b1' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%238c3a3a;stop-opacity:1' /><stop offset='100%' style='stop-color:%23321515;stop-opacity:1' /></linearGradient></defs><rect width='100%' height='100%' fill='url(%23b1)'/><rect x='20' y='20' width='360' height='460' fill='none' stroke='%23e2a2a2' stroke-width='2'/><text x='50%' y='40%' font-family='Georgia, serif' font-size='24' fill='%23ffffff' text-anchor='middle'>ECHOES OF THE PAST</text><text x='50%' y='48%' font-family='sans-serif' font-size='12' fill='%23ffb3b3' letter-spacing='2' text-anchor='middle'>BYZANTIUM STUDIES</text><text x='50%' y='85%' font-family='Georgia' font-style='italic' font-size='14' fill='%23ffffff' text-anchor='middle'>A. Author</text></svg>",
      pdfUrl: "mock_byzantine_echoes.pdf",
      pdfSize: "4.8 MB",
      purchaseLinks: {
        amazon: "https://amazon.com",
        kobo: "https://kobo.com",
      },
      order: 1,
      testDownloadEnabled: true,
      downloads: 42,
    },
    {
      id: "book-2",
      title: "The Quantum Horizon",
      description:
        "A comprehensive guide translating advanced subatomic mechanics into concepts accessible to lay readers, charting computing paradigms.",
      cover:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='500' viewBox='0 0 400 500'><defs><linearGradient id='b2' x1='0%' y1='0%' x2='100%' y2='100%'><stop offset='0%' style='stop-color:%232a5a67;stop-opacity:1' /><stop offset='100%' style='stop-color:%2311262d;stop-opacity:1' /></linearGradient></defs><rect width='100%' height='100%' fill='url(%23b2)'/><rect x='20' y='20' width='360' height='460' fill='none' stroke='%238be2ef' stroke-width='2'/><text x='50%' y='40%' font-family='Georgia, serif' font-size='24' fill='%23ffffff' text-anchor='middle'>THE QUANTUM HORIZON</text><text x='50%' y='48%' font-family='sans-serif' font-size='12' fill='%238be2ef' letter-spacing='2' text-anchor='middle'>SUBATOMIC PHYSICS</text><text x='50%' y='85%' font-family='Georgia' font-style='italic' font-size='14' fill='%23ffffff' text-anchor='middle'>A. Author</text></svg>",
      pdfUrl: "",
      pdfSize: "0",
      purchaseLinks: {
        amazon: "https://amazon.com",
      },
      order: 2,
      testDownloadEnabled: false,
      downloads: 0,
    },
  ],
  comments: [
    {
      id: "com-1",
      articleId: "art-1",
      authorName: "Clarissa Harris",
      authorEmail: "clarissa@example.com",
      content:
        "This is a wonderful summary of the changes in publishing. I particularly agree that direct newsletters have established much closer feedback loops with readers than traditional books ever did.",
      status: "approved",
      createdAt: "2026-08-02T16:00:00.000Z",
    },
    {
      id: "com-2",
      articleId: "art-1",
      authorName: "John Stone",
      authorEmail: "john@example.com",
      content:
        "Excellent read. I think the challenge is sustaining deep focus when the net prompts us to output content so quickly.",
      status: "approved",
      createdAt: "2026-08-02T18:20:00.000Z",
    },
    {
      id: "com-3",
      articleId: "art-2",
      authorName: "Skeptical reader",
      authorEmail: "spammer@spam.com",
      content: "BUY VIAGRA NOW!!! BEST DEAL ONLINE!!! CLICK HERE",
      status: "pending",
      createdAt: "2026-08-04T22:10:00.000Z",
    },
  ],
  settings: {
    logoText: "A. Author",
    bannerTitle: "Reflections on Science, History, and Art",
    bannerSubtitle:
      "Essays, historical accounts, and technical books published directly by the writer.",
    footerText:
      "© 2026 A. Author. All rights reserved. Built using clean web technologies.",
    contactEmail: "author@publish.site",
    socialLinks: {
      twitter: "https://twitter.com",
      github: "https://github.com",
      medium: "https://medium.com",
    },
    analyticsId: "UA-12345678-9",
  },
  users: [
    {
      email: "admin@publish.site",
      password: "admin123",
      avatar:
        "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'><rect width='100' height='100' fill='%234a5568'/><circle cx='50' cy='35' r='20' fill='%23cbd5e0'/><path d='M20 80c0-15 15-20 30-20s30 5 30 20z' fill='%23cbd5e0'/></svg>",
    },
  ],
  pdfs: [
    {
      id: "pdf-1",
      title: "Byzantine Echoes (Digital Extract)",
      category: "cat-2",
      fileSize: "4.8 MB",
      uploadDate: "2026-08-01",
      downloads: 42,
      visible: true,
      description:
        "Introductory chapter mapping Constantinople city layouts and wall structures.",
    },
    {
      id: "pdf-2",
      title: "Introduction to Quantum Computations",
      category: "cat-3",
      fileSize: "1.2 MB",
      uploadDate: "2026-08-04",
      downloads: 18,
      visible: true,
      description:
        "A preliminary research paper on gate configurations and superposition models.",
    },
  ],
  newsletter: [
    { email: "reader1@example.com", subscribedAt: "2026-08-01T12:00:00.000Z" },
    { email: "reader2@example.com", subscribedAt: "2026-08-03T15:20:00.000Z" },
  ],
};

class LocalStorageDB {
  constructor() {
    this.init();
  }

  init() {
    for (const key of Object.keys(InitialData)) {
      if (!localStorage.getItem(`author_db_${key}`)) {
        localStorage.setItem(
          `author_db_${key}`,
          JSON.stringify(InitialData[key]),
        );
      }
    }
  }

  getData(collection) {
    return JSON.parse(localStorage.getItem(`author_db_${collection}`)) || [];
  }

  saveData(collection, data) {
    localStorage.setItem(`author_db_${collection}`, JSON.stringify(data));
  }

  // Generic CRUD helpers
  get(collection, id) {
    const list = this.getData(collection);
    return list.find((item) => item.id === id);
  }

  list(collection) {
    return this.getData(collection);
  }

  create(collection, item) {
    const list = this.getData(collection);
    const newItem = {
      ...item,
      id: item.id || `${collection.substring(0, 3)}-${Date.now()}`,
    };
    list.push(newItem);
    this.saveData(collection, list);
    return newItem;
  }

  update(collection, id, updates) {
    const list = this.getData(collection);
    const index = list.findIndex((item) => item.id === id);
    if (index !== -1) {
      list[index] = { ...list[index], ...updates };
      this.saveData(collection, list);
      return list[index];
    }
    return null;
  }

  delete(collection, id) {
    const list = this.getData(collection);
    const filtered = list.filter((item) => item.id !== id);
    this.saveData(collection, filtered);
    return true;
  }
}

export const mockDBInstance = new LocalStorageDB();
