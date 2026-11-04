export type ServiceIcon =
  | "code"
  | "smartphone"
  | "pen-tool"
  | "cloud"
  | "database"
  | "shield-check";

type ServiceShape = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  deliverables: string[];
  icon: ServiceIcon;
};

export const services = [
  {
    slug: "web-development",
    title: "Web & Application Development",
    tagline: "Produk digital yang cepat, aman, dan siap tumbuh.",
    description:
      "Kami merancang dan membangun website perusahaan, portal internal, dashboard, hingga platform e-commerce dengan fondasi teknis yang rapi dan mudah dikembangkan.",
    deliverables: ["Next.js & React", "API dan integrasi sistem", "Optimasi performa & SEO"],
    icon: "code",
  },
  {
    slug: "mobile-development",
    title: "Mobile App Development",
    tagline: "Aplikasi Android & iOS dari satu basis kode.",
    description:
      "Aplikasi mobile yang terasa native, terhubung ke backend Anda, dan siap dirilis ke Play Store maupun App Store dengan proses pengujian yang disiplin.",
    deliverables: ["Flutter / React Native", "Integrasi pembayaran & notifikasi", "Rilis ke app store"],
    icon: "smartphone",
  },
  {
    slug: "ui-ux-design",
    title: "UI/UX Design",
    tagline: "Antarmuka yang jelas, alur yang masuk akal.",
    description:
      "Kami memulai dari riset pengguna dan tujuan bisnis, lalu menerjemahkannya menjadi wireframe, prototipe, dan design system yang konsisten di semua layar.",
    deliverables: ["Riset pengguna & alur", "Prototipe interaktif", "Design system siap pakai"],
    icon: "pen-tool",
  },
  {
    slug: "cloud-devops",
    title: "Cloud & DevOps",
    tagline: "Infrastruktur yang andal tanpa drama rilis.",
    description:
      "Otomatisasi deployment, pantau kesehatan sistem, dan siapkan arsitektur cloud yang efisien biaya. Tim Anda bisa fokus pada produk, bukan server.",
    deliverables: ["CI/CD otomatis", "Monitoring & alerting", "Audit biaya cloud"],
    icon: "cloud",
  },
  {
    slug: "data-ai",
    title: "Data & AI Solutions",
    tagline: "Ubah data menjadi keputusan yang lebih baik.",
    description:
      "Dari perapian data dan dashboard operasional sampai implementasi AI generatif untuk membantu tim bekerja lebih cepat dengan tata kelola yang jelas.",
    deliverables: ["Dashboard & pelaporan", "Otomasi proses", "Asisten AI internal"],
    icon: "database",
  },
  {
    slug: "consulting-maintenance",
    title: "IT Consulting & Maintenance",
    tagline: "Pendamping teknis jangka panjang untuk tim Anda.",
    description:
      "Audit sistem, penyusunan roadmap teknologi, dan dukungan pemeliharaan berkelanjutan dengan SLA yang transparan dan dokumentasi yang lengkap.",
    deliverables: ["Audit & roadmap teknologi", "SLA pemeliharaan", "Pelatihan tim internal"],
    icon: "shield-check",
  },
] satisfies ServiceShape[];

export type Service = (typeof services)[number];

export const serviceOptions = [
  "Web & Application Development",
  "Mobile App Development",
  "UI/UX Design",
  "Cloud & DevOps",
  "Data & AI Solutions",
  "IT Consulting & Maintenance",
  "Shanatech Academy",
  "Lainnya",
] as const;

export const whyUs = [
  {
    id: "tim",
    eyebrow: "01 · Tim",
    title: "Tim kecil yang benar-benar membangun",
    lead: "Tidak ada hand-over ke pihak lain setelah kontrak ditandatangani.",
    description:
      "Proyek Anda ditangani langsung oleh orang yang menulis kode dan merancang antarmukanya. Anda berbicara dengan tim yang sama dari discovery sampai rilis.",
    proof: { value: "1 lead", label: "pendamping tetap dari discovery sampai rilis" },
    points: ["Lead yang sama dari discovery sampai rilis", "Review kode sebelum setiap rilis", "Dokumentasi serah terima lengkap"],
  },
  {
    id: "proses",
    eyebrow: "02 · Proses",
    title: "Proses transparan, tanpa kejutan",
    lead: "Anda tahu apa yang sedang dikerjakan, kapan, dan mengapa.",
    description:
      "Kami bekerja dalam siklus dua minggu dengan demo yang bisa Anda lihat langsung. Akses repository, board, dan lingkungan staging terbuka untuk tim Anda sejak hari pertama.",
    proof: { value: "2 pekan", label: "siklus demo & evaluasi bersama klien" },
    points: ["Sprint review dua mingguan", "Akses repository & staging", "Estimasi dan perubahan scope tertulis"],
  },
  {
    id: "hasil",
    eyebrow: "03 · Hasil",
    title: "Ukuran keberhasilan yang disepakati",
    lead: "Bukan sekadar “websitenya sudah jadi”, tapi dampaknya ke bisnis.",
    description:
      "Di awal proyek kami bersama Anda menetapkan indikator yang ingin digerakkan: konversi, waktu layanan, biaya operasional, atau jumlah pengguna aktif. Setiap keputusan diarahkan ke sana.",
    proof: { value: "2 klien", label: "kembali untuk proyek berikutnya" },
    points: ["KPI disepakati sebelum eksekusi", "Dashboard performa pasca-rilis", "Rekomendasi iterasi berbasis data"],
  },
  {
    id: "dukungan",
    eyebrow: "04 · Dukungan",
    title: "Hadir setelah produk diluncurkan",
    lead: "Rilis bukan garis akhir. Kami menjaga produk tetap sehat.",
    description:
      "Semua proyek mendapat masa garansi dan opsi pemeliharaan dengan SLA. Tim support kami merespons tiket dengan prioritas yang jelas dan laporan bulanan yang mudah dibaca.",
    proof: { value: "90 hari", label: "garansi perbaikan bug setelah rilis" },
    points: ["SLA respons maksimal 1×24 jam", "Laporan kesehatan sistem bulanan", "Jalur eskalasi langsung ke lead"],
  },
  {
    id: "talenta",
    eyebrow: "05 · Talenta",
    title: "Ekosistem yang terus belajar",
    lead: "Kami membangun produk sekaligus membina talenta.",
    description:
      "Shanatech Academy membuat kami selalu dekat dengan kebutuhan nyata dunia kerja. Materi pelatihan terus diperbarui dari proyek yang kami kerjakan, dan lulusan terbaik punya jalur magang di tim kami.",
    proof: { value: "40+", label: "peserta Academy dari 3 angkatan" },
    points: ["Kurikulum dari studi kasus nyata", "Jalur magang bagi lulusan terbaik", "Mentor adalah praktisi aktif"],
  },
  {
    id: "keamanan",
    eyebrow: "06 · Keamanan",
    title: "Keamanan dipikirkan sejak baris pertama",
    lead: "Bukan fitur tambahan di akhir proyek.",
    description:
      "Kami menerapkan prinsip least privilege, validasi input di sisi server, dan pemeriksaan dependensi. Untuk data sensitif, kami menyusun kontrol akses dan prosedur penanganan insiden bersama tim Anda.",
    proof: { value: "OWASP", label: "praktik keamanan mengacu pada standar industri" },
    points: ["Validasi & otorisasi server-side", "Audit dependensi terjadwal", "Rencana penanganan insiden"],
  },
];

export const vision =
  "Menjadi mitra teknologi dan pendidikan digital yang paling dipercaya di Indonesia — tempat bisnis bertumbuh dan talenta muda menemukan masa depan.";

export const missions = [
  {
    title: "Membangun produk yang berdampak",
    text: "Menghadirkan solusi digital yang tepat guna, terukur, dan mudah dirawat oleh tim klien.",
  },
  {
    title: "Membuka akses keterampilan digital",
    text: "Menyediakan pelatihan komputer dan bahasa Inggris yang praktis, terjangkau, dan relevan dengan dunia kerja.",
  },
  {
    title: "Menumbuhkan talenta lokal",
    text: "Menjembatani lulusan dengan kebutuhan industri melalui mentoring, proyek nyata, dan jalur magang.",
  },
  {
    title: "Menjaga kepercayaan lewat transparansi",
    text: "Bekerja dengan proses yang jelas, komunikasi terbuka, dan tanggung jawab penuh atas hasil.",
  },
];

export const values = [
  {
    title: "Jelas sebelum canggih",
    text: "Solusi sederhana yang dipahami tim klien lebih bernilai daripada arsitektur rumit yang tidak terawat.",
  },
  {
    title: "Tumbuh bersama",
    text: "Kami mengukur keberhasilan dari seberapa mandiri klien dan lulusan kami setelah bekerja bersama.",
  },
  {
    title: "Teliti pada detail",
    text: "Kualitas terlihat pada hal-hal kecil: pesan error yang manusiawi, performa, dan aksesibilitas.",
  },
  {
    title: "Jujur soal batas",
    text: "Jika sesuatu tidak layak dikerjakan sekarang, kami akan mengatakannya — beserta alternatifnya.",
  },
];

export const timeline = [
  {
    year: "2025",
    title: "Menyiapkan fondasi",
    text: "SHANATECH dimulai sebagai studio pengembangan web kecil: tiga orang, satu meja, dan satu prinsip — kerja rapi, komunikasi terbuka.",
  },
  {
    year: "2026",
    title: "Proyek pertama selesai",
    text: "Proyek web pertama untuk usaha lokal diluncurkan. Dari situ kami belajar pentingnya ruang lingkup yang jelas dan kabar rutin ke klien.",
  },
  {
    year: "2026 · Academy",
    title: "Kelas pertama dibuka",
    text: "Shanatech Academy membuka kelas komputer dan bahasa Inggris pertamanya untuk kelompok kecil, disusun dari kebutuhan nyata peserta.",
  },
  {
    year: "Sekarang",
    title: "Dua misi, satu arah",
    text: "Jasa teknologi dan pelatihan tumbuh bersama. Kami menampilkan angka apa adanya dan mengejar hasil yang bisa dipertanggungjawabkan.",
  },
];

export const testimonials = [
  {
    quote:
      "Kami datang dengan ide yang masih kasar. Tim membantu memangkas fitur sampai rilis pertama benar-benar selesai, bukan menambah fitur yang belum perlu.",
    name: "Rendra Mahesa",
    role: "Founder, Tumbuh Craft",
  },
  {
    quote:
      "Saya peserta batch pertama. Kelasnya kecil, jadi saya berani bertanya dan latihan speaking setiap sesi. Belum fasih, tapi sekarang berani memulai percakapan kerja.",
    name: "Nadia Putri Anjani",
    role: "Peserta English Conversation, Batch 1",
  },
  {
    quote:
      "Proyek pertama selesai sesuai anggaran. Beberapa bulan kemudian kami kembali untuk perawatan dan penambahan fitur.",
    name: "Larasati",
    role: "Founder, Kedai Kopi Laras",
  },
];

export const academyPrograms = [
  {
    name: "English Conversation",
    category: "Bahasa Inggris",
    level: "Beginner–Intermediate",
    duration: "12 minggu · 24 sesi",
    price: "Rp1.500.000",
    slug: "english-conversation",
  },
  {
    name: "Web Development Fundamental",
    category: "Komputer",
    level: "Pemula",
    duration: "8 minggu · 24 sesi",
    price: "Rp1.850.000",
    slug: "web-development-fundamental",
  },
  {
    name: "IELTS Preparation",
    category: "Bahasa Inggris",
    level: "Intermediate+",
    duration: "10 minggu · 30 sesi",
    price: "Rp2.750.000",
    slug: "ielts-preparation",
  },
];

export const academyBenefits = [
  {
    title: "Kelas kecil, perhatian nyata",
    text: "Maksimal 16 peserta per kelas agar mentor sempat memberi umpan balik personal.",
  },
  {
    title: "Mentor praktisi",
    text: "Pengajar adalah praktisi aktif yang membawa studi kasus dari proyek dan industri nyata.",
  },
  {
    title: "Belajar dengan proyek",
    text: "Setiap program diakhiri dengan proyek atau simulasi yang bisa masuk ke portofolio.",
  },
  {
    title: "Jadwal ramah pekerja",
    text: "Tersedia kelas sore, malam, akhir pekan, serta opsi hybrid untuk peserta luar kota.",
  },
];

export const faqs = [
  {
    q: "Apakah ada biaya konsultasi awal?",
    a: "Tidak. Sesi konsultasi awal selama 30 menit untuk memahami kebutuhan dan ruang lingkup proyek tidak dikenakan biaya. Jika diperlukan, kami akan mengirimkan proposal dan estimasi tertulis setelahnya.",
  },
  {
    q: "Bagaimana cara mendaftar kelas Shanatech Academy?",
    a: "Isi formulir pendaftaran di halaman Academy. Tim kami akan menghubungi Anda maksimal 1×24 jam pada hari kerja untuk konfirmasi ketersediaan kursi, jadwal, dan proses pembayaran.",
  },
  {
    q: "Apakah kelas tersedia secara online?",
    a: "Ya. Beberapa program tersedia penuh secara online, sementara program lain menggunakan format hybrid: sesi teori bisa daring dan praktik dilakukan di lab. Format tersedia tertera di setiap kelas.",
  },
  {
    q: "Bisakah kelas disesuaikan untuk perusahaan?",
    a: "Bisa. Kami menyusun program pelatihan in-house untuk tim perusahaan, mulai dari asesmen kebutuhan, silabus khusus, hingga laporan hasil pelatihan.",
  },
  {
    q: "Apakah SHANATECH menerima proyek dari luar kota?",
    a: "Ya. Sebagian besar kolaborasi berjalan remote dengan ritual komunikasi yang jelas. Untuk kebutuhan tertentu, kami dapat melakukan kunjungan dan sesi kerja bersama di lokasi Anda.",
  },
];
