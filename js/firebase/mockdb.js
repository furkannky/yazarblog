// Local Mock Database for the Author Template (Development & Preview Mode)
// Simulates Firebase responses perfectly to decouple UI logic from backend

export const InitialData = {
  categories: [
    { id: "cat-1", name: "Edebiyat", slug: "edebiyat", order: 1 },
    { id: "cat-2", name: "Tarih", slug: "tarih", order: 2 },
    { id: "cat-3", name: "Sosyoloji", slug: "sosyoloji", order: 3 },
    { id: "cat-4", name: "Din", slug: "din", order: 4 },
    { id: "cat-5", name: "Eğitim", slug: "egitim", order: 5 },
    { id: "cat-6", name: "Sağlık", slug: "saglik", order: 6 }
  ],
  users: [
    { id: "u-1", email: "admin@adilyilmayan.com", password: "admin123", name: "Yönetici" }
  ],
  articles: [
    {
      id: "art-1",
      title: "Dijital Çağda Yazarlık Sanatı",
      slug: "dijital-cagda-yazarlik-sanati",
      summary: "Modern yazarın, kelime işlemcilerden doğrudan internet üzerinden yayıncılığa geçiş sürecinde yaşadığı araçsal değişimlerin edebiyatı nasıl desteklediğinin detaylı incelemesi.",
      content: `
<p>Yüzyıllar boyunca matbaa, yazılı ifadenin son kalesiydi. Bugün ise yazarlar, küresel okuyucularla anında ve doğrudan iletişim kurabilen kanallara sahip. Bu değişim sadece nasıl yayımladığımızı değil, ne yazdığımızı da değiştirdi.</p>
<h3>Geleneksel Sınırların Ötesi</h3>
<p>Daha önceleri kitaplar tamamlanmış eserler olarak, esnek olmayan yayın döngülerine sıkışmıştı. Şimdi dijital teknoloji sayesinde taslaklar çok daha akışkan. Çevrimiçi okurların doğrudan yoruma katılması, yazılara geri bildirim ve gerçek zamanlı iyileştirme alanı açıyor.</p>
<p>Geleneksel yayın takvimlerinin aksine bültenler ve okur platformları, eserin parçalar halinde yayınlanmasına, eleştirilerin toplanmasına olanak sağlar. Bu durum kitapların halka açık, dijital düzlemlerde yeşerip evrimleşmesini kolaylaştırır.</p>
<h3>Modern Yazarın Araç Kiti</h3>
<ul>
  <li>Sade görünümlü, modern formata duyarlı HTML metin editörleri.</li>
  <li>Okuyucu ile birebir bağ kurulmasını sağlayan e-posta ağları.</li>
  <li>Ulaşılamaz kabul edilen arşivlere, dünyanın her yerinden anında erişim.</li>
</ul>
<p>Kelime ve söz biçimleme araçlarındaki bu yalınlık sadece yüzeysel bir tercih değildir. Gerçek meseleye odaklanmamızı teşvik eder: Yazının kendisine.</p>
      `,
      cover: "/images/article_cover_1_1786476952914.png",
      status: "published",
      categoryId: "cat-1",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
      views: 145,
      seoTitle: "Dijital Çağda Yazarlık Sanatı | Profesyonel Yazar",
      seoDesc: "İnternet yayıncılığının evrimi, taslakların açık platformlardaki ilerleyişi ve modern yazar araçları üzerine akademik bir değerlendirme.",
      tags: ["yazarlık", "dijitalleştirme", "yayıncılık"]
    },
    {
      id: "art-2",
      title: "Kayıp Başkentler: Bizans Mimarisine Bir Yolculuk",
      slug: "kayip-baskentler-bizans-mimari",
      summary: "Tarihin tozlu yaprakları arasına karışmış Bizans imparatorluk izleri; İstanbul, Ravenna ve İznik üzerindeki silik mimari harikaları ve bunların modern kente etkileri.",
      content: `
<p>Şehirler, eski taş yapıların ve modern mimarinin üst üste bindirildiği devasa parşömenler gibidir. Roma'dan yeni bir merkeze taşınan güç, ardında devasa bir vizyon ve ihtişam bıraktı.</p>
<p>Özellikle başkent İstanbul'da olmak üzere pek çok eserde gördüğümüz kırmızı tuğla kullanımı, dairesel kubbe mimarisi dönemin sosyopolitik statüsünü temsil eden anıtlardı. Halka sadece ihtişamı göstermekle kalmıyor, inanç merkezlerini şekillendiriyordu.</p>
<blockquote>Mimari sadece binaları değil, o binaları yaptıran zihniyetin öfke ve inancını da taşır. - İmparatorluk Kayıtları.</blockquote>
<p>Bugün bile şehrin modern binalarına gizlenmiş olan o eski freskler, bizlere tarihin sürekliliğini kanıtlıyor...</p>
      `,
      cover: "/images/article_cover_2_1786476962370.png",
      status: "published",
      categoryId: "cat-2",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
      views: 98,
      seoTitle: "",
      seoDesc: "",
      tags: ["mimari", "tarih", "bizans"]
    },
    {
      id: "art-3",
      title: "Kuantum Dolanıklığını ve Sosyal Gerçekliği Anlamak",
      slug: "kuantum-dolanikligi-ve-sosyal-gerceklik",
      summary: "Fizikteki kuantum kuramlarının sosyal yapılardaki insan psikolojisiyle olan kavramsal benzerliklerini ele alan akademik inceleme serisi.",
      content: `
<p>İki parçacığın iletişim hızı ışık hızını aştığında, uzayın dokusundaki boşlukların aslında tamamen bilgi dolu olduğunu anlıyoruz. Aynı teorik model, toplum içerisindeki fikirlerin iletiminde de kullanılamaz mı?</p>
<p>Modern sosyolojide, tıpkı kuantum durumlarında gördüğümüz "gözlemcinin sonucu etkilemesi" kuralı vardır. Bir grubun sosyal davranışı, dışarıdan gözlemlendiğinde farklı reaksiyonlar geliştirir.</p>
<p>Bu makalede kuantum dolaşıklığı ile sosyal medya üzerindeki bilginin kitlelere anında yansımasını ve insan bağlarını inceleyeceğiz.</p>
      `,
      cover: "/images/article_cover_1_1786476952914.png",
      status: "draft",
      categoryId: "cat-3",
      createdAt: new Date().toISOString(),
      views: 220,
      seoTitle: "",
      seoDesc: "",
      tags: ["fizik", "sosyoloji", "teori"]
    }
  ],
  books: [
    {
      id: "bk-1",
      title: "Geçmişin Yankıları: Bizans Yankıları",
      slug: "gecmisin-yankilari-bizans",
      cover: "/images/book_cover_1_1786476971255.png",
      description: "Bizans mimarisi üzerine modern, derinlemesine ve göz dolduran bir değerlendirme.",
      isbn: "978-0-123456-47-2",
      pages: 342,
      publisher: "Tarih Akademi Yayınları",
      publishedDate: "2024-10-15",
      purchaseLinks: {
        amazon: "https://amazon.com",
        pub: "https://publisher.com",
        nubihar: "https://nubihar.com"
      },
      featured: true,
      price: "150.00 TL"
    },
    {
      id: "bk-2",
      title: "Sosyal Ufuk",
      slug: "sosyal-ufuk",
      cover: "/images/book_cover_1_1786476971255.png",
      description: "Sosyal gerçekliklerin modern yüzyılda fizikle birleşip yeni bir insanlık profili çizdiği bir başucu kitabı.",
      isbn: "978-1-987654-32-1",
      pages: 280,
      publisher: "Bilim ve Düşünce Serisi",
      publishedDate: "2025-02-20",
      purchaseLinks: {
        amazon: "https://amazon.com",
        nubihar: "https://nubihar.com"
      },
      featured: true,
      price: "185.00 TL"
    }
  ],
  news: [
    {
      id: "nw-1",
      title: "Yeni Kitabımın Basım Süreci Hakkında",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      summary: "Kayıp Başkentler serisinin ilk kitabı nihayet matbaaya gönderildi.",
      type: "update",
      link: "/article.html?slug=kayip-baskentler-bizans-mimari"
    },
    {
      id: "nw-2",
      title: "Uluslararası Sosyoloji Sempozyumu Konuşması",
      date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
      summary: "Tarihin sosyolojik değerlendirmesi ve modern etkilerine dair keyifli bir panel oldu.",
      type: "event",
      link: "#"
    }
  ],
  comments: [
    {
      id: "c-1",
      articleId: "art-1",
      authorName: "Ayşe Yılmaz",
      authorEmail: "ayse@example.com",
      body: "Bu, yayıncılıktaki değişimlerin harika bir özeti. Dijital mecraların okur-yazar ilişkisindeki o ulaşılmaz mesafeyi kısalttığına tamamen katılıyorum.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      status: "approved"
    },
    {
      id: "c-2",
      articleId: "art-1",
      authorName: "Mehmet Taş",
      authorEmail: "mehmet@example.com",
      body: "Çok akıcı bir üslup. Araçların gerçekten yazının merkezini mi yoksa yazarın ruhunu mu etkilediği kısmı üzerine düşünmek lazım.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      status: "approved"
    },
    {
      id: "c-3",
      articleId: "art-2",
      authorName: "Şüpheci Okur",
      authorEmail: "spammer@spam.com",
      body: "Para kazanmak için tıklayın! Bedava hediye kazandınız!!",
      createdAt: new Date().toISOString(),
      status: "pending"
    }
  ],
  settings: {
    logoText: "Dr. Adil Yılmayan",
    themePrimary: "#1f2937",
    themeAccent: "#e63946",
    bannerTitle: "Bilim, Tarih ve Sosyoloji Üzerine",
    bannerSubtitle: "Tarihin tozlu sayfalarından modern toplumun dinamiklerine, yazar tarafından kaleme alınan araştırmalar ve incelemeler.",
    footerText: "© 2026 Dr. Adil Yılmayan. Tüm hakları saklıdır. Temiz web teknolojileri kullanılarak oluşturulmuştur.",
    contactEmail: "iletisim@adilyilmayan.com"
  },
  pdfs: [
    {
      id: "pdf-1",
      title: "Bizans Yankıları (Dijital Alıntı)",
      description: "Yeni kitabın ilk iki bölümünü içeren yayın öncesi deneme metni.",
      fileUrl: "dummy-file.pdf",
      fileSize: "2.4 MB",
      uploadDate: "2025-06-15",
      visible: true
    },
    {
      id: "pdf-2",
      title: "Kuantum Hesaplamalarına Giriş (Taslak)",
      description: "Gelecek dönem üniversite eğitimlerinde işlenecek kuantum giriş notları.",
      fileUrl: "dummy-theory.pdf",
      fileSize: "1.1 MB",
      uploadDate: "2025-08-01",
      visible: true
    }
  ],
  dashboardStats: {
    viewsLast30Days: 12450,
    newsletterGrowth: 15,
    conversionRate: "4.2%"
  },
  newsletter: [
      { id: "sub-1", email: "okur_ali@example.com", subscribedAt: new Date(Date.now() - 10000000).toISOString() },
      { id: "sub-2", email: "ayse.y@mail.com", subscribedAt: new Date(Date.now() - 500000).toISOString() }
  ]
};

// ... REST OF THE FILE KEEPS THE LOGIC ...
// We need to keep the logic for mockDBInstance
class MockDatabase {
  constructor() {
    this.ensureInitialized();
  }
  ensureInitialized() {
    Object.keys(InitialData).forEach(key => {
      if (!localStorage.getItem(`yazar_db_v3_${key}`)) {
        localStorage.setItem(
          `yazar_db_v3_${key}`,
          JSON.stringify(InitialData[key])
        );
      }
    });
  }
  list(collection) {
    return JSON.parse(localStorage.getItem(`yazar_db_v3_${collection}`)) || [];
  }
  saveList(collection, data) {
    localStorage.setItem(`yazar_db_v3_${collection}`, JSON.stringify(data));
  }
  get(collection, id) {
    const list = this.list(collection);
    return list.find(l => l.id === id) || null;
  }
  create(collection, data) {
    const list = this.list(collection);
    const newEntry = { ...data, id: `gen-${Date.now()}` };
    list.push(newEntry);
    this.saveList(collection, list);
    return newEntry;
  }
  update(collection, id, data) {
    const list = this.list(collection);
    const index = list.findIndex(l => l.id === id);
    if (index > -1) {
      list[index] = { ...list[index], ...data };
      this.saveList(collection, list);
      return list[index];
    }
    throw new Error("Local DB Record not found");
  }
  delete(collection, id) {
    const list = this.list(collection);
    const filtered = list.filter(l => l.id !== id);
    this.saveList(collection, filtered);
    return true;
  }
  
  // Expose initial data structure so settings resets can grab original defaults 
  // (without resetting ALL user generated content if possible)
  resetSettingsToDefault() {
    this.saveList('settings', InitialData.settings);
    return InitialData.settings;
  }
}

export const mockDBInstance = new MockDatabase();
