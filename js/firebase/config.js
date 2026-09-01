import { mockDBInstance } from './mockdb.js';

// --- FIREBASE CONFIGURATION COAT ---
// If you want to use a real Firebase project, fill in these keys:
export const firebaseConfig = {
  apiKey: "AIzaSyDBmylwAKXzx9YfDtNhEyZ6293GRjs4QNs",
  authDomain: "yazar-portali.firebaseapp.com",
  projectId: "yazar-portali",
  storageBucket: "yazar-portali.firebasestorage.app",
  messagingSenderId: "532764976906",
  appId: "1:532764976906:web:07b710bc013e8f74a9bcf3",
  measurementId: "G-1KFKQVB17G"
};

// Detect if Firebase configuration is provided
export const isUsingMock = !firebaseConfig.apiKey || firebaseConfig.apiKey.trim() === "";

let firebaseLoaded = false;
let realApp, realAuth, realDb, realStorage;

// Dynamic imports if real Firebase is configured
if (!isUsingMock) {
  try {
    const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js");
    const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
    const { getFirestore } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
    const { getStorage } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js");

    realApp = initializeApp(firebaseConfig);
    realAuth = getAuth(realApp);
    realDb = getFirestore(realApp);
    realStorage = getStorage(realApp);
    firebaseLoaded = true;
    console.log("Firebase initialized successfully in production Mode.");
  } catch (error) {
    console.error("Failed to initialize Firebase SDK. Falling back to local storage environment.", error);
  }
} else {
  console.log("Running in Smart Local Fallback mode using localStorage Database.");
}

// --- AUTHENTICATION SERVICE WRAPPER ---
export const authService = {
  getCurrentUser: () => {
    if (isUsingMock || !firebaseLoaded) {
      const activeUser = sessionStorage.getItem("active_admin_session");
      return activeUser ? JSON.parse(activeUser) : null;
    }
    return realAuth.currentUser;
  },

  login: async (email, password) => {
    if (isUsingMock || !firebaseLoaded) {
      const users = mockDBInstance.list("users");
      const matched = users.find(u => u.email === email && u.password === password);
      if (matched) {
        const sessionUser = { email: matched.email, avatar: matched.avatar };
        sessionStorage.setItem("active_admin_session", JSON.stringify(sessionUser));
        return sessionUser;
      }
      throw new Error("Invalid username or password.");
    } else {
      const { signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
      const userCredential = await signInWithEmailAndPassword(realAuth, email, password);
      return userCredential.user;
    }
  },

  logout: async () => {
    if (isUsingMock || !firebaseLoaded) {
      sessionStorage.removeItem("active_admin_session");
      return true;
    } else {
      const { signOut } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js");
      await signOut(realAuth);
      return true;
    }
  },

  onStateChange: (callback) => {
    if (isUsingMock || !firebaseLoaded) {
      // Check immediately and trigger callback
      const user = authService.getCurrentUser();
      callback(user);
      // To simulate listener, verify in interval or custom events if needed
      window.addEventListener("storage", () => {
        callback(authService.getCurrentUser());
      });
    } else {
      realAuth.onAuthStateChanged(callback);
    }
  }
};

// --- FIRESTORE DATABASE SERVICE WRAPPER ---
export const dbService = {
  // Articles CRUD
  getArticles: async () => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.list("articles");
      }
      // Real Firestore collection query
      const { collection, getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const q = query(collection(realDb, "articles"), orderBy("publishedAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn("Firestore getArticles failed, falling back to mock database:", err);
      return mockDBInstance.list("articles");
    }
  },

  getArticle: async (id) => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.get("articles", id);
      }
      const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = doc(realDb, "articles", id);
      const snap = await getDoc(docRef);
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    } catch (err) {
      console.warn("Firestore getArticle failed, falling back to mock:", err);
      return mockDBInstance.get("articles", id);
    }
  },

  getArticleBySlug: async (slug) => {
    try {
      const list = await dbService.getArticles();
      return list.find(a => a.slug === slug) || null;
    } catch (err) {
      console.warn("getArticleBySlug failed:", err);
      return null;
    }
  },

  createArticle: async (data) => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.create("articles", { ...data, views: 0 });
      }
      const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = await addDoc(collection(realDb, "articles"), { ...data, views: 0 });
      return { id: docRef.id, ...data };
    } catch (err) {
      console.warn("Firestore createArticle failed, falling back to local:", err);
      return mockDBInstance.create("articles", { ...data, views: 0 });
    }
  },

  updateArticle: async (id, data) => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.update("articles", id, data);
      }
      const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = doc(realDb, "articles", id);
      await updateDoc(docRef, data);
      return { id, ...data };
    } catch (err) {
      console.warn("Firestore updateArticle failed, falling back to local:", err);
      return mockDBInstance.update("articles", id, data);
    }
  },

  deleteArticle: async (id) => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.delete("articles", id);
      }
      const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = doc(realDb, "articles", id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.warn("Firestore deleteArticle failed, falling back to local:", err);
      return mockDBInstance.delete("articles", id);
    }
  },

  incrementArticleViews: async (id) => {
    try {
      const art = await dbService.getArticle(id);
      if (art) {
        const views = (art.views || 0) + 1;
        await dbService.updateArticle(id, { views });
        return views;
      }
    } catch (err) {
      console.warn("incrementArticleViews failed:", err);
    }
    return 0;
  },

  // Books CRUD
  getBooks: async () => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.list("books").sort((a,b) => (a.order || 0) - (b.order || 0));
      }
      const { collection, getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const q = query(collection(realDb, "books"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn("Firestore getBooks failed, falling back to mock:", err);
      return mockDBInstance.list("books").sort((a,b) => (a.order || 0) - (b.order || 0));
    }
  },

  createBook: async (data) => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.create("books", { ...data, downloads: 0 });
      }
      const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = await addDoc(collection(realDb, "books"), { ...data, downloads: 0 });
      return { id: docRef.id, ...data };
    } catch (err) {
      console.warn("Firestore createBook failed, falling back to local:", err);
      return mockDBInstance.create("books", { ...data, downloads: 0 });
    }
  },

  updateBook: async (id, data) => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.update("books", id, data);
      }
      const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = doc(realDb, "books", id);
      await updateDoc(docRef, data);
      return { id, ...data };
    } catch (err) {
      console.warn("Firestore updateBook failed, falling back to local:", err);
      return mockDBInstance.update("books", id, data);
    }
  },

  deleteBook: async (id) => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.delete("books", id);
      }
      const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = doc(realDb, "books", id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.warn("Firestore deleteBook failed, falling back to local:", err);
      return mockDBInstance.delete("books", id);
    }
  },

  // Categories CRUD
  getCategories: async () => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.list("categories").sort((a,b) => (a.order || 0) - (b.order || 0));
      }
      const { collection, getDocs, query, orderBy } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const q = query(collection(realDb, "categories"), orderBy("order", "asc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn("Firestore getCategories failed, falling back to mock:", err);
      return mockDBInstance.list("categories").sort((a,b) => (a.order || 0) - (b.order || 0));
    }
  },

  createCategory: async (data) => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.create("categories", data);
      }
      const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = await addDoc(collection(realDb, "categories"), data);
      return { id: docRef.id, ...data };
    } catch (err) {
      console.warn("Firestore createCategory failed, falling back to local:", err);
      return mockDBInstance.create("categories", data);
    }
  },

  updateCategory: async (id, data) => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.update("categories", id, data);
      }
      const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = doc(realDb, "categories", id);
      await updateDoc(docRef, data);
      return { id, ...data };
    } catch (err) {
      console.warn("Firestore updateCategory failed, falling back to local:", err);
      return mockDBInstance.update("categories", id, data);
    }
  },

  deleteCategory: async (id) => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.delete("categories", id);
      }
      const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = doc(realDb, "categories", id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.warn("Firestore deleteCategory failed, falling back to local:", err);
      return mockDBInstance.delete("categories", id);
    }
  },

  // Comments CRUD
  getComments: async (articleId) => {
    try {
      const list = await dbService.getCommentsAll();
      return list.filter(c => c.articleId === articleId && c.status === "approved").sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    } catch (err) {
      console.warn("getComments failed:", err);
      return [];
    }
  },

  getCommentsAll: async () => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.list("comments");
      }
      const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const snapshot = await getDocs(collection(realDb, "comments"));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn("Firestore getCommentsAll failed, falling back to mock:", err);
      return mockDBInstance.list("comments");
    }
  },

  createComment: async (data) => {
    const newComment = {
      ...data,
      status: "pending", // Workflow: Visitor -> Pending Review -> Admin Approval -> Visible
      createdAt: new Date().toISOString()
    };
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.create("comments", newComment);
      }
      const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = await addDoc(collection(realDb, "comments"), newComment);
      return { id: docRef.id, ...newComment };
    } catch (err) {
      console.warn("Firestore createComment failed, falling back to local:", err);
      return mockDBInstance.create("comments", newComment);
    }
  },

  updateCommentStatus: async (id, status) => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.update("comments", id, { status });
      }
      const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = doc(realDb, "comments", id);
      await updateDoc(docRef, { status });
      return { id, status };
    } catch (err) {
      console.warn("Firestore updateCommentStatus failed, falling back to local:", err);
      return mockDBInstance.update("comments", id, { status });
    }
  },

  deleteComment: async (id) => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.delete("comments", id);
      }
      const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = doc(realDb, "comments", id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.warn("Firestore deleteComment failed, falling back to local:", err);
      return mockDBInstance.delete("comments", id);
    }
  },

  // Settings
  getSettings: async () => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.list("settings");
      }
      const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = doc(realDb, "settings", "global");
      const snap = await getDoc(docRef);
      return snap.exists() ? snap.data() : mockDBInstance.list("settings");
    } catch (err) {
      console.warn("Firestore getSettings failed, falling back to mock:", err);
      return mockDBInstance.list("settings");
    }
  },

  saveSettings: async (data) => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        mockDBInstance.saveList("settings", data);
        return data;
      }
      const { doc, setDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = doc(realDb, "settings", "global");
      await setDoc(docRef, data, { merge: true });
      return data;
    } catch (err) {
      console.warn("Firestore saveSettings failed, falling back to local:", err);
      mockDBInstance.saveList("settings", data);
      throw err; // Throw the error so the UI knows Firebase write actually failed!
    }
  },

  updateSettings: async (data) => {
    return dbService.saveSettings(data);
  },

  // News Core API
  getNews: async (limitCount = 100) => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.list("news").slice(0, limitCount);
      }
      const { collection, getDocs, query, orderBy, limit } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const q = query(collection(realDb, "news"), orderBy("dateString", "desc"), limit(limitCount));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn("Firestore getNews failed, falling back to mock:", err);
      return mockDBInstance.list("news").slice(0, limitCount);
    }
  },

  createNews: async (data) => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.create("news", data);
      }
      const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = await addDoc(collection(realDb, "news"), data);
      return { id: docRef.id, ...data };
    } catch (err) {
      console.warn("Firestore createNews failed, falling back to local:", err);
      return mockDBInstance.create("news", data);
    }
  },

  updateNews: async (id, data) => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.update("news", id, data);
      }
      const { doc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = doc(realDb, "news", id);
      await updateDoc(docRef, data);
      return { id, ...data };
    } catch (err) {
      console.warn("Firestore updateNews failed, falling back to local:", err);
      return mockDBInstance.update("news", id, data);
    }
  },

  deleteNews: async (id) => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.delete("news", id);
      }
      const { doc, deleteDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = doc(realDb, "news", id);
      await deleteDoc(docRef);
      return true;
    } catch (err) {
      console.warn("Firestore deleteNews failed, falling back to local:", err);
      return mockDBInstance.delete("news", id);
    }
  },

  // Newsletter Subscriptions
  getNewsletterSubs: async () => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.list("newsletter");
      }
      const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const snapshot = await getDocs(collection(realDb, "newsletter"));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn("Firestore getNewsletterSubs failed, falling back to mock:", err);
      return mockDBInstance.list("newsletter");
    }
  },

  addNewsletterSub: async (email) => {
    try {
      const list = await dbService.getNewsletterSubs();
      if (list.find(s => s.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("This email is already subscribed.");
      }
      const item = { email, subscribedAt: new Date().toISOString() };
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.create("newsletter", item);
      }
      const { collection, addDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const docRef = await addDoc(collection(realDb, "newsletter"), item);
      return { id: docRef.id, ...item };
    } catch (err) {
      console.warn("Firestore addNewsletterSub failed, falling back to local:", err);
      // Ensure we still raise the conflict error or add to mock database
      const list = mockDBInstance.list("newsletter");
      if (list.find(s => s.email.toLowerCase() === email.toLowerCase())) {
        throw new Error("This email is already subscribed.");
      }
      return mockDBInstance.create("newsletter", { email, subscribedAt: new Date().toISOString() });
    }
  },

  // Missing PDFs CRUD
  getPdfs: async () => {
    try {
      if (isUsingMock || !firebaseLoaded) {
        return mockDBInstance.list("pdfs").sort((a,b) => (b.downloads || 0) - (a.downloads || 0));
      }
      const { collection, getDocs } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
      const snapshot = await getDocs(collection(realDb, "pdfs"));
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err) {
      console.warn("Firestore getPdfs failed, falling back to mock:", err);
      return mockDBInstance.list("pdfs");
    }
  },
  
  incrementPdfDownloads: async (id) => {
    try {
      // First try to check if it's a book (books have pdf samples)
      const books = await dbService.getBooks();
      const book = books.find(b => b.id === id);
      if (book) {
        const downloads = (book.downloads || 0) + 1;
        await dbService.updateBook(id, { downloads });
        return downloads;
      }
      
      // If not a book, check pdfs collection
      if (isUsingMock || !firebaseLoaded) {
        const pdf = mockDBInstance.get("pdfs", id);
        if (pdf) {
          const downloads = (pdf.downloads || 0) + 1;
          mockDBInstance.update("pdfs", id, { downloads });
          return downloads;
        }
      } else {
        const { doc, getDoc, updateDoc } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js");
        const docRef = doc(realDb, "pdfs", id);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const downloads = (snap.data().downloads || 0) + 1;
          await updateDoc(docRef, { downloads });
          return downloads;
        }
      }
    } catch (err) {
      console.warn("incrementPdfDownloads failed:", err);
    }
    return 0;
  }
};

// --- FILE STORAGE SERVICE WRAPPER ---
export const storageService = {
  uploadFile: async (file, folderPath) => {
    if (isUsingMock || !firebaseLoaded) {
      // Mock File Upload: Converts to Base64 dataURL for instant local presentation
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }
    const { ref, uploadBytes, getDownloadURL } = await import("https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js");
    const uniqueName = `${Date.now()}_${file.name}`;
    const storageRef = ref(realStorage, `${folderPath}/${uniqueName}`);
    const snapshot = await uploadBytes(storageRef, file);
    return await getDownloadURL(snapshot.ref);
  }
};
