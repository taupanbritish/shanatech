import pg from "pg";

const connectionString =
  process.env.DATABASE_URL ?? "postgres://shanatech:shanatech@127.0.0.1:5433/shanatech";

const courses = [
  {
    slug: "web-development-fundamental",
    name: "Web Development Fundamental",
    category: "Komputer",
    level: "Pemula",
    summary: "Bangun website modern dari nol dengan HTML, CSS, JavaScript, dan React.",
    description:
      "Program intensif untuk pemula yang ingin memulai karier sebagai front-end developer. Peserta belajar logika pemrograman, membangun antarmuka responsif, hingga men-deploy proyek portofolio ke internet.",
    highlights: ["HTML, CSS & JavaScript modern", "React + Tailwind CSS", "2 proyek portofolio siap deploy"],
    durationLabel: "8 minggu · 24 sesi",
    sessions: 24,
    price: 1850000,
    mode: "Hybrid",
    featured: true,
    sort: 1,
  },
  {
    slug: "desain-grafis-branding",
    name: "Desain Grafis & Branding",
    category: "Komputer",
    level: "Pemula",
    summary: "Kuasai Photoshop, Illustrator, dan Canva untuk kebutuhan brand visual.",
    description:
      "Belajar prinsip desain, tipografi, warna, dan identitas visual. Setiap peserta menyelesaikan paket branding lengkap: logo, palet warna, template sosial media, dan panduan brand.",
    highlights: ["Photoshop, Illustrator & Canva", "Studi kasus brand lokal", "Review portofolio bersama mentor"],
    durationLabel: "6 minggu · 18 sesi",
    sessions: 18,
    price: 1500000,
    mode: "Offline",
    featured: false,
    sort: 2,
  },
  {
    slug: "digital-marketing-content",
    name: "Digital Marketing & Content",
    category: "Komputer",
    level: "Pemula",
    summary: "Rancang kampanye digital yang terukur, dari konten sampai iklan berbayar.",
    description:
      "Membahas riset audiens, content planning, copywriting, SEO dasar, Meta Ads, dan analisis performa. Peserta mempraktikkan langsung kampanye untuk studi kasus usaha nyata.",
    highlights: ["Strategi konten & copywriting", "Meta Ads dan Google Ads dasar", "Laporan performa kampanye"],
    durationLabel: "8 minggu · 24 sesi",
    sessions: 24,
    price: 1750000,
    mode: "Hybrid",
    featured: false,
    sort: 3,
  },
  {
    slug: "administrasi-perkantoran",
    name: "Administrasi Perkantoran",
    category: "Komputer",
    level: "Pemula",
    summary: "Kuasai Microsoft Office dan keterampilan administrasi siap kerja.",
    description:
      "Program praktis untuk calon staf administrasi: pengelolaan dokumen, spreadsheet, presentasi profesional, korespondensi, dan tata kelola arsip digital.",
    highlights: ["Word, Excel & PowerPoint", "Surat resmi dan pengarsipan digital", "Simulasi pekerjaan kantor"],
    durationLabel: "6 minggu · 18 sesi",
    sessions: 18,
    price: 1250000,
    mode: "Offline",
    featured: false,
    sort: 4,
  },
  {
    slug: "python-untuk-pemula",
    name: "Python untuk Pemula",
    category: "Komputer",
    level: "Pemula",
    summary: "Fondasi pemrograman Python untuk otomasi, analisis data, dan pengembangan aplikasi.",
    description:
      "Mulai dari sintaks dasar hingga membangun aplikasi sederhana dan mengolah data dengan Pandas. Kelas dirancang untuk peserta tanpa latar belakang teknis.",
    highlights: ["Logika & sintaks Python", "Otomasi tugas harian", "Pengantar analisis data"],
    durationLabel: "8 minggu · 24 sesi",
    sessions: 24,
    price: 1650000,
    mode: "Online",
    featured: true,
    sort: 5,
  },
  {
    slug: "ui-ux-design-fundamental",
    name: "UI/UX Design Fundamental",
    category: "Komputer",
    level: "Pemula",
    summary: "Rancang pengalaman digital yang intuitif dengan pendekatan design thinking.",
    description:
      "Peserta mempelajari riset pengguna, wireframe, prototyping di Figma, hingga usability testing. Diakhiri dengan studi kasus aplikasi lengkap untuk portofolio.",
    highlights: ["Design thinking & user research", "Prototyping dengan Figma", "Usability testing"],
    durationLabel: "8 minggu · 24 sesi",
    sessions: 24,
    price: 1850000,
    mode: "Hybrid",
    featured: false,
    sort: 6,
  },
  {
    slug: "teknisi-komputer-jaringan",
    name: "Teknisi Komputer & Jaringan",
    category: "Komputer",
    level: "Menengah",
    summary: "Servis perangkat keras, instalasi jaringan, dan troubleshooting tingkat dasar.",
    description:
      "Kelas berbasis praktik di laboratorium: perakitan komputer, instalasi sistem operasi, konfigurasi router, keamanan dasar jaringan, dan prosedur perawatan perangkat.",
    highlights: ["Praktik perakitan & servis", "Konfigurasi jaringan lokal", "Sertifikasi internal"],
    durationLabel: "12 minggu · 32 sesi",
    sessions: 32,
    price: 2250000,
    mode: "Offline",
    featured: false,
    sort: 7,
  },
  {
    slug: "english-for-kids",
    name: "English for Kids",
    category: "Bahasa Inggris",
    level: "Usia 7–12 tahun",
    summary: "Belajar bahasa Inggris lewat cerita, lagu, dan aktivitas yang menyenangkan.",
    description:
      "Kelas interaktif dengan pendekatan communicative language teaching. Anak berlatih mendengar, berbicara, membaca, dan menulis dalam suasana yang santai dan suportif.",
    highlights: ["Maksimal 12 anak per kelas", "Metode belajar berbasis cerita", "Laporan perkembangan bulanan"],
    durationLabel: "16 minggu · 16 sesi",
    sessions: 16,
    price: 1200000,
    mode: "Offline",
    featured: false,
    sort: 8,
  },
  {
    slug: "english-conversation",
    name: "English Conversation",
    category: "Bahasa Inggris",
    level: "Beginner–Intermediate",
    summary: "Lebih percaya diri berbicara bahasa Inggris untuk kerja dan kehidupan sehari-hari.",
    description:
      "Fokus pada kelancaran berbicara melalui simulasi percakapan, presentasi singkat, dan diskusi topik aktual. Kelas kecil dengan koreksi langsung dari pengajar.",
    highlights: ["Kelas maksimal 16 siswa", "Latihan speaking setiap sesi", "Mock interview & presentasi"],
    durationLabel: "12 minggu · 24 sesi",
    sessions: 24,
    price: 1500000,
    mode: "Hybrid",
    featured: true,
    sort: 9,
  },
  {
    slug: "ielts-preparation",
    name: "IELTS Preparation",
    category: "Bahasa Inggris",
    level: "Intermediate+",
    summary: "Strategi dan latihan intensif untuk target band score 6.5–7.5.",
    description:
      "Membahas keempat komponen IELTS: listening, reading, writing, dan speaking. Setiap peserta mengerjakan simulasi tes dan menerima umpan balik tertulis dari pengajar.",
    highlights: ["4 simulasi tes penuh", "Umpan balik writing & speaking", "Strategi manajemen waktu"],
    durationLabel: "10 minggu · 30 sesi",
    sessions: 30,
    price: 2750000,
    mode: "Hybrid",
    featured: false,
    sort: 10,
  },
  {
    slug: "toefl-itp-preparation",
    name: "TOEFL iTP Preparation",
    category: "Bahasa Inggris",
    level: "Intermediate+",
    summary: "Pahami pola tes TOEFL dan tingkatkan skor dengan latihan terarah.",
    description:
      "Program persiapan TOEFL iTP untuk kebutuhan studi dan pekerjaan. Latihan structure, listening comprehension, dan reading dengan pembahasan soal per tipe.",
    highlights: ["Pembahasan soal per tipe", "Simulasi tes terjadwal", "Akses bank soal digital"],
    durationLabel: "8 minggu · 24 sesi",
    sessions: 24,
    price: 2100000,
    mode: "Online",
    featured: false,
    sort: 11,
  },
  {
    slug: "business-english",
    name: "Business English",
    category: "Bahasa Inggris",
    level: "Intermediate",
    summary: "Komunikasi profesional untuk email, rapat, dan presentasi bisnis.",
    description:
      "Dirancang untuk profesional yang membutuhkan bahasa Inggris di tempat kerja: menulis email yang jelas, memimpin rapat, negosiasi, dan presentasi di depan klien.",
    highlights: ["Email & laporan bisnis", "Rapat dan negosiasi", "Presentasi profesional"],
    durationLabel: "8 minggu · 16 sesi",
    sessions: 16,
    price: 1950000,
    mode: "Online",
    featured: false,
    sort: 12,
  },
];

const schedules = [
  {
    courseSlug: "english-conversation",
    batch: "Batch 14",
    startDate: "2026-11-10",
    endDate: "2027-01-28",
    label: "Senin & Kamis, 18.30–20.00 WIB",
    instructor: "Dinda Prameswari, M.Pd.",
    room: "Room English 2",
    mode: "Hybrid",
    quota: 16,
    status: "Dibuka",
  },
  {
    courseSlug: "web-development-fundamental",
    batch: "Batch 9",
    startDate: "2026-11-16",
    endDate: "2027-01-11",
    label: "Selasa & Jumat, 19.00–21.00 WIB",
    instructor: "Raka Adiputra, S.Kom.",
    room: "Lab Komputer 1",
    mode: "Hybrid",
    quota: 14,
    status: "Dibuka",
  },
  {
    courseSlug: "desain-grafis-branding",
    batch: "Batch 7",
    startDate: "2026-11-14",
    endDate: "2026-12-26",
    label: "Sabtu, 09.00–12.00 WIB",
    instructor: "Nadia Kusuma, S.Ds.",
    room: "Studio Kreatif",
    mode: "Offline",
    quota: 12,
    status: "Dibuka",
  },
  {
    courseSlug: "ielts-preparation",
    batch: "Batch 5",
    startDate: "2026-11-21",
    endDate: "2027-01-30",
    label: "Sabtu, 13.00–15.30 WIB",
    instructor: "Adrian Foster, B.A.",
    room: "Room English 1",
    mode: "Hybrid",
    quota: 10,
    status: "Dibuka",
  },
  {
    courseSlug: "python-untuk-pemula",
    batch: "Batch 6",
    startDate: "2026-12-01",
    endDate: "2027-02-16",
    label: "Senin & Rabu, 19.00–21.00 WIB",
    instructor: "Bima Saputra, S.Kom.",
    room: "Live Zoom",
    mode: "Online",
    quota: 20,
    status: "Dibuka",
  },
  {
    courseSlug: "administrasi-perkantoran",
    batch: "Batch 11",
    startDate: "2026-11-09",
    endDate: "2026-12-18",
    label: "Senin & Kamis, 09.00–11.30 WIB",
    instructor: "Rina Marlina, S.E.",
    room: "Lab Komputer 2",
    mode: "Offline",
    quota: 15,
    status: "Dibuka",
  },
  {
    courseSlug: "english-for-kids",
    batch: "Batch 8",
    startDate: "2026-11-14",
    endDate: "2027-03-06",
    label: "Sabtu, 10.00–11.30 WIB",
    instructor: "Clara Wijaya, S.Pd.",
    room: "Room English 2",
    mode: "Offline",
    quota: 12,
    status: "Dibuka",
  },
  {
    courseSlug: "ui-ux-design-fundamental",
    batch: "Batch 4",
    startDate: "2027-01-12",
    endDate: "2027-03-09",
    label: "Selasa & Kamis, 19.00–21.00 WIB",
    instructor: "Salsa Ardhana, M.Ds.",
    room: "Studio Kreatif",
    mode: "Hybrid",
    quota: 14,
    status: "Dibuka",
  },
  {
    courseSlug: "toefl-itp-preparation",
    batch: "Batch 4",
    startDate: "2027-01-09",
    endDate: "2027-02-27",
    label: "Sabtu, 09.00–11.30 WIB",
    instructor: "Adrian Foster, B.A.",
    room: "Live Zoom",
    mode: "Online",
    quota: 12,
    status: "Dibuka",
  },
];

const registrations = [
  ["Nadia Putri Anjani", "nadia.putri@example.com", "081234567801", "english-conversation", "Batch 14", "SMA", "Ingin lebih percaya diri untuk wawancara kerja."],
  ["Fajar Ramadhan", "fajar.ramadhan@example.com", "081234567802", "english-conversation", "Batch 14", "S1", "Jadwal malam cocok dengan pekerjaan."],
  ["Siti Aisyah", "siti.aisyah@example.com", "081234567803", "english-conversation", "Batch 14", "D3", null],
  ["Yoga Pratama", "yoga.pratama@example.com", "081234567804", "english-conversation", "Batch 14", "S1", null],
  ["Kevin Wijaya", "kevin.wijaya@example.com", "081234567805", "english-conversation", "Batch 14", "SMA", "Tertarik kelas hybrid."],
  ["Rani Oktaviani", "rani.okta@example.com", "081234567806", "web-development-fundamental", "Batch 9", "S1", "Ingin beralih karier ke front-end."],
  ["Dimas Prakoso", "dimas.prakoso@example.com", "081234567807", "web-development-fundamental", "Batch 9", "SMA", null],
  ["Ayu Lestari", "ayu.lestari@example.com", "081234567808", "web-development-fundamental", "Batch 9", "D3", "Sudah punya dasar HTML."],
  ["Bella Anggraini", "bella.anggraini@example.com", "081234567809", "ielts-preparation", "Batch 5", "S1", "Target band 7.0 untuk beasiswa."],
  ["Muhammad Iqbal", "m.iqbal@example.com", "081234567810", "ielts-preparation", "Batch 5", "S1", null],
  ["Citra Dewi", "citra.dewi@example.com", "081234567811", "desain-grafis-branding", "Batch 7", "SMA", "Ingin memperkuat portofolio."],
  ["Arif Setiawan", "arif.setiawan@example.com", "081234567812", "python-untuk-pemula", "Batch 6", "S1", null],
  ["Maya Sari", "maya.sari@example.com", "081234567813", "administrasi-perkantoran", "Batch 11", "SMA", null],
];

const messages = [
  {
    name: "Hendra Gunawan",
    email: "hendra@nusantararetail.co.id",
    phone: "081298765401",
    company: "Nusantara Retail",
    service: "Web & Application Development",
    message:
      "Kami sedang mencari mitra untuk membangun portal internal karyawan. Mohon informasi estimasi waktu dan biaya untuk tahap discovery.",
  },
  {
    name: "Larasati",
    email: "larasati@kedaikopi.id",
    phone: "081298765402",
    company: "Kedai Kopi Laras",
    service: "UI/UX Design",
    message:
      "Kami ingin merombak tampilan aplikasi pemesanan dan meningkatkan konversi. Apakah bisa dijadwalkan sesi konsultasi minggu ini?",
  },
];

// Produk nyata yang sudah dibangun SHANATECH. Studi kasus, dampak, harga, dan
// kredensial demo sengaja dikosongkan: isi dari panel admin dengan data asli.
const products = [
  {
    slug: "shanatech-school",
    title: "ShanaTech School",
    tagline: "Menghubungkan sekolah, guru, siswa, dan orang tua dalam satu sistem.",
    category: "Sistem Informasi Sekolah",
    description:
      "Sistem informasi sekolah yang terdiri dari website profil sekolah, panel administrasi, dan aplikasi Android untuk guru, siswa, serta orang tua.\n\nSatu aplikasi mobile dapat dipakai banyak sekolah: pengguna cukup memilih Hubungkan ke sekolah, lalu identitas, logo, dan tema mengikuti sekolah yang terhubung.",
    features: [
      "Website profil sekolah: berita, prestasi, kurikulum, kalender akademik, dan alumni",
      "Aplikasi Android untuk guru, siswa, dan orang tua",
      "Satu aplikasi untuk banyak sekolah lewat fitur Hubungkan ke sekolah",
      "Modul PKL & BKK khusus SMK",
      "Layanan BK untuk konseling siswa",
      "Akun Pengawas Sekolah dengan rekap dan laporan bulanan",
      "Backup database terjadwal dari panel admin",
    ],
    techStack: ["Laravel 13", "Flutter 3.41", "PostgreSQL 18"],
    pricingModels: ["SaaS", "Beli Putus"],
    pricingNote: "Penawaran disesuaikan dengan jumlah siswa dan kebutuhan modul.",
    demoNote: "Akun demo per peran disiapkan sesuai permintaan. Hubungi kami via WhatsApp.",
    featured: true,
    sort: 1,
  },
  {
    slug: "shanatech-cbt",
    title: "ShanaTech CBT",
    tagline: "Ujian berbasis komputer dengan token, timer, dan pengumpulan otomatis.",
    category: "Sistem Informasi Sekolah",
    description:
      "Aplikasi ujian berbasis komputer (CBT) untuk sekolah. Guru menyusun bank soal dan ujian, siswa mengerjakan dari browser dengan token ujian, dan jawaban terkumpul otomatis saat waktu habis.",
    features: [
      "Peran admin, guru, dan siswa",
      "Bank soal per mata pelajaran",
      "Ujian per kelas dengan token akses",
      "Timer ujian dan pengumpulan jawaban otomatis",
    ],
    techStack: ["React 18", "Vite 6", "Tailwind CSS 4", "Express 4", "PostgreSQL"],
    pricingModels: ["SaaS", "Beli Putus"],
    pricingNote: "Penawaran disesuaikan dengan jumlah peserta ujian.",
    demoNote: "Akun demo disiapkan sesuai permintaan. Hubungi kami via WhatsApp.",
    featured: false,
    sort: 2,
  },
];

const client = new pg.Client({ connectionString });
await client.connect();

try {
  await client.query(
    "TRUNCATE registrations, contact_messages, schedules, courses, products, users RESTART IDENTITY CASCADE",
  );

  for (const product of products) {
    await client.query(
      `INSERT INTO products
        (slug, title, tagline, category, description, features, tech_stack,
         pricing_models, pricing_note, demo_note, is_featured, status, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'Terbit',$12)`,
      [
        product.slug,
        product.title,
        product.tagline,
        product.category,
        product.description,
        product.features,
        product.techStack,
        product.pricingModels,
        product.pricingNote,
        product.demoNote,
        product.featured,
        product.sort,
      ],
    );
  }

  const courseIds = new Map();
  for (const course of courses) {
    const result = await client.query(
      `INSERT INTO courses
        (slug, name, category, level, summary, description, highlights,
         duration_label, sessions, price, mode, is_featured, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
       RETURNING id`,
      [
        course.slug,
        course.name,
        course.category,
        course.level,
        course.summary,
        course.description,
        course.highlights,
        course.durationLabel,
        course.sessions,
        course.price,
        course.mode,
        course.featured,
        course.sort,
      ],
    );
    courseIds.set(course.slug, result.rows[0].id);
  }

  const scheduleIds = new Map();
  for (const schedule of schedules) {
    const result = await client.query(
      `INSERT INTO schedules
        (course_id, batch, start_date, end_date, schedule_label, instructor,
         room, mode, quota, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING id`,
      [
        courseIds.get(schedule.courseSlug),
        schedule.batch,
        schedule.startDate,
        schedule.endDate,
        schedule.label,
        schedule.instructor,
        schedule.room,
        schedule.mode,
        schedule.quota,
        schedule.status,
      ],
    );
    scheduleIds.set(`${schedule.courseSlug}:${schedule.batch}`, result.rows[0].id);
  }

  for (const [fullName, email, phone, courseSlug, batch, education, note] of registrations) {
    await client.query(
      `INSERT INTO registrations
        (course_id, schedule_id, full_name, email, phone, education, note)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [
        courseIds.get(courseSlug),
        scheduleIds.get(`${courseSlug}:${batch}`),
        fullName,
        email,
        phone,
        education,
        note,
      ],
    );
  }

  for (const message of messages) {
    await client.query(
      `INSERT INTO contact_messages
        (name, email, phone, company, service, message, status, email_sent)
       VALUES ($1,$2,$3,$4,$5,$6,'Selesai',TRUE)`,
      [message.name, message.email, message.phone, message.company, message.service, message.message],
    );
  }

  const counts = await client.query(`
    SELECT
      (SELECT COUNT(*) FROM courses) AS courses,
      (SELECT COUNT(*) FROM schedules) AS schedules,
      (SELECT COUNT(*) FROM registrations) AS registrations,
      (SELECT COUNT(*) FROM contact_messages) AS messages,
      (SELECT COUNT(*) FROM products) AS products
  `);
  console.log("✓ Seed selesai:", counts.rows[0]);
} finally {
  await client.end();
}
