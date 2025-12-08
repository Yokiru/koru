import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const LanguageContext = createContext();

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};

const translations = {
    en: {
        // Sidebar
        'nav.home': 'Home',
        'nav.history': 'History',
        'nav.recents': 'Recents',
        'nav.no_chats': 'No recent chats',
        'nav.favorites': 'Favorites',
        'nav.settings': 'Settings',
        'nav.mindmap': 'Mindmap',
        'nav.quizzes': 'Quizzes',
        'nav.soon': 'Soon',

        // Profile Menu
        'menu.settings': 'Settings',
        'menu.language': 'Language',
        'menu.help': 'Get help',
        'menu.upgrade': 'Upgrade plan',
        'menu.download': 'Download app',
        'menu.logout': 'Log out',

        // Settings Modal
        'settings.title': 'Settings',
        'settings.profile': 'Profile',
        'settings.security': 'Security',
        'settings.danger': 'Danger Zone',
        'settings.save': 'Save Changes',
        'settings.saved': 'Saved successfully',
        'settings.error': 'An error occurred',

        // Auth
        'auth.signin': 'Sign In',
        'auth.signup': 'Sign Up',
        'auth.email': 'Email',
        'auth.password': 'Password',
        'auth.welcome': 'Welcome to Koru',
        'auth.subtitle': 'Sign in to continue your learning journey',
        'auth.placeholder_email': 'Enter your email',
        'auth.placeholder_password': 'Enter your password',
        'auth.continue': 'Continue with email',
        'auth.signing_in': 'Signing in...',
        'auth.no_account': "Don't have an account?",
        'auth.signup_link': 'Sign up',

        // Home
        'home.welcome': 'Welcome to Koru',
        'home.subtitle': 'What do you want to learn today?',
        'home.placeholder': 'Ask anything...',
        'home.search': 'Search',
        'home.quiz_mode': 'Quiz Mode',
        'home.greetings': [
            "Hey {name}, what's on your mind?",
            "Hi {name}, ready to learn?",
            "{name}, let's explore today!",
            "Welcome back, {name}!",
            "Hey {name}, curious about something?"
        ],
        'home.suggestions': [
            "Explain Quantum Physics",
            "How does photosynthesis work?",
            "What is the theory of relativity?",
            "How do black holes work?",
            "Why is the sky blue?",
            "How do vaccines work?",
            "What causes earthquakes?",
            "Explain DNA and genetics",
            "How does the human brain work?",
            "What is dark matter?",
            "What is Artificial Intelligence?",
            "Explain blockchain like I'm 5",
            "How does the internet work?",
            "What is quantum computing?",
            "How do electric cars work?",
            "What is machine learning?",
            "Explain cryptocurrency",
            "How does 5G technology work?",
            "What is virtual reality?",
            "How do solar panels work?",
            "History of the Roman Empire",
            "What caused World War II?",
            "The Renaissance explained",
            "Ancient Egyptian civilization",
            "The Industrial Revolution",
            "History of the Internet",
            "The French Revolution",
            "Ancient Greek philosophy",
            "The Cold War explained",
            "Origins of democracy",
            "How do airplanes fly?",
            "What is the Big Bang Theory?",
            "How are stars formed?",
            "Can we live on Mars?",
            "What are exoplanets?",
            "How does gravity work?",
            "What is a supernova?",
            "The solar system explained",
            "What is consciousness?",
            "Explain existentialism",
            "What is critical thinking?",
            "The meaning of happiness",
            "What is ethics?",
            "Explain climate change",
            "What is sustainable living?",
            "How does the economy work?",
            "What is inflation?",
            "Explain supply and demand"
        ],
        'home.topic_map': {
            // Science
            "physics": ["Newton's Laws", "Gravity explained", "Thermodynamics basics", "Speed of Light", "Energy and matter"],
            "quantum": ["Schrödinger's Cat", "Quantum Entanglement", "Wave-Particle Duality", "Quantum tunneling"],
            "biology": ["Cell Structure", "DNA vs RNA", "Evolution theory", "Ecosystems", "Human anatomy"],
            "chemistry": ["Periodic Table", "Chemical reactions", "Atoms and molecules", "pH and acids"],
            "plant": ["Photosynthesis process", "Plant reproduction", "Pollination", "Plant cells"],
            "animal": ["Animal behavior", "Food chains", "Adaptation", "Endangered species"],

            // Technology
            "tech": ["How the Internet works", "Coding basics", "Cybersecurity", "Cloud computing"],
            "ai": ["Machine Learning explained", "Neural Networks", "Robotics", "Deep Learning", "AI ethics"],
            "computer": ["How computers work", "Binary code", "Algorithms", "Data structures"],
            "blockchain": ["Cryptocurrency basics", "Smart contracts", "Decentralization", "NFTs explained"],
            "programming": ["Python basics", "JavaScript fundamentals", "Web development", "Mobile apps"],

            // Space & Astronomy
            "space": ["Black Holes explained", "The Solar System", "Mars exploration", "Big Bang Theory"],
            "star": ["How stars form", "Supernovas", "Constellations", "Star life cycle"],
            "planet": ["Exoplanets", "Planetary formation", "Gas giants", "Rocky planets"],
            "universe": ["Dark matter", "Dark energy", "Galaxies", "Cosmic expansion"],

            // History
            "history": ["World War II", "Ancient Egypt", "Industrial Revolution", "The Cold War"],
            "ancient": ["Roman Empire", "Greek civilization", "Mesopotamia", "Ancient China"],
            "war": ["World War I", "Vietnam War", "Napoleonic Wars", "Civil wars"],
            "revolution": ["French Revolution", "American Revolution", "Russian Revolution", "Cultural revolutions"],

            // Economics & Business
            "money": ["Inflation explained", "Stock Market basics", "Cryptocurrency", "Supply and Demand"],
            "economy": ["GDP explained", "Economic systems", "Trade and commerce", "Banking systems"],
            "business": ["Entrepreneurship", "Marketing basics", "Business models", "Startups"],

            // Arts & Culture
            "art": ["Renaissance art", "Impressionism", "Color Theory", "Famous Painters", "Modern art"],
            "music": ["Music theory", "Classical composers", "Musical instruments", "Genres of music"],
            "literature": ["Literary movements", "Famous authors", "Poetry forms", "Storytelling"],

            // Philosophy & Psychology
            "philosophy": ["Existentialism", "Stoicism", "Ethics", "Logic and reasoning"],
            "psychology": ["Human behavior", "Cognitive biases", "Memory", "Emotions"],
            "mind": ["Consciousness", "Critical thinking", "Creativity", "Intelligence"],

            // Environment & Nature
            "climate": ["Climate change", "Global warming", "Carbon cycle", "Renewable energy"],
            "environment": ["Ecosystems", "Biodiversity", "Conservation", "Pollution"],
            "earth": ["Plate tectonics", "Earthquakes", "Volcanoes", "Rock cycle"],
            "ocean": ["Ocean currents", "Marine life", "Coral reefs", "Deep sea"],

            // Health & Medicine
            "health": ["Immune system", "Nutrition", "Exercise science", "Mental health"],
            "medicine": ["Vaccines", "Antibiotics", "Medical technology", "Disease prevention"],
            "body": ["Human anatomy", "Organ systems", "Metabolism", "Genetics"],

            // Mathematics
            "math": ["Algebra basics", "Geometry", "Calculus intro", "Statistics"],
            "number": ["Prime numbers", "Fibonacci sequence", "Pi explained", "Number theory"],

            // Social Sciences
            "society": ["Democracy", "Government systems", "Social movements", "Human rights"],
            "culture": ["Cultural diversity", "Traditions", "Languages", "Anthropology"],
            "politics": ["Political systems", "Elections", "International relations", "Diplomacy"]
        },
    },
    id: {
        // Sidebar
        'nav.home': 'Beranda',
        'nav.history': 'Riwayat',
        'nav.recents': 'Terkini',
        'nav.no_chats': 'Belum ada obrolan',
        'nav.favorites': 'Favorit',
        'nav.settings': 'Pengaturan',
        'nav.mindmap': 'Mindmap',
        'nav.quizzes': 'Quizzes',
        'nav.soon': 'Segera',

        // Profile Menu
        'menu.settings': 'Pengaturan',
        'menu.language': 'Bahasa',
        'menu.help': 'Bantuan',
        'menu.upgrade': 'Tingkatkan paket',
        'menu.download': 'Unduh aplikasi',
        'menu.logout': 'Keluar',

        // Settings Modal
        'settings.title': 'Pengaturan',
        'settings.profile': 'Profil',
        'settings.security': 'Keamanan',
        'settings.danger': 'Area Berbahaya',
        'settings.save': 'Simpan Perubahan',
        'settings.saved': 'Berhasil disimpan',
        'settings.error': 'Terjadi kesalahan',

        // Auth
        'auth.signin': 'Masuk',
        'auth.signup': 'Daftar',
        'auth.email': 'Email',
        'auth.password': 'Kata Sandi',
        'auth.welcome': 'Selamat Datang di Koru',
        'auth.subtitle': 'Masuk untuk melanjutkan perjalanan belajarmu',
        'auth.placeholder_email': 'Masukkan email kamu',
        'auth.placeholder_password': 'Masukkan kata sandi',
        'auth.continue': 'Lanjutkan dengan email',
        'auth.signing_in': 'Sedang masuk...',
        'auth.no_account': 'Belum punya akun?',
        'auth.signup_link': 'Daftar',

        // Home
        'home.welcome': 'Selamat Datang di Koru',
        'home.subtitle': 'Apa yang ingin kamu pelajari hari ini?',
        'home.placeholder': 'Tanyakan apa saja...',
        'home.search': 'Cari',
        'home.quiz_mode': 'Mode Kuis',
        'home.greetings': [
            "Hei {name}, mau belajar apa?",
            "Hai {name}, siap eksplorasi?",
            "{name}, ayo mulai belajar!",
            "Selamat datang, {name}!",
            "Hei {name}, penasaran sesuatu?"
        ],
        'home.suggestions': [
            "Jelaskan Fisika Kuantum",
            "Bagaimana cara kerja fotosintesis?",
            "Apa itu teori relativitas?",
            "Bagaimana cara kerja lubang hitam?",
            "Mengapa langit berwarna biru?",
            "Bagaimana cara kerja vaksin?",
            "Apa penyebab gempa bumi?",
            "Jelaskan DNA dan genetika",
            "Bagaimana cara kerja otak manusia?",
            "Apa itu materi gelap?",
            "Apa itu Kecerdasan Buatan?",
            "Jelaskan blockchain seperti saya berusia 5 tahun",
            "Bagaimana cara kerja internet?",
            "Apa itu komputasi kuantum?",
            "Bagaimana cara kerja mobil listrik?",
            "Apa itu machine learning?",
            "Jelaskan cryptocurrency",
            "Bagaimana cara kerja teknologi 5G?",
            "Apa itu realitas virtual?",
            "Bagaimana cara kerja panel surya?",
            "Sejarah Kekaisaran Romawi",
            "Apa penyebab Perang Dunia II?",
            "Penjelasan Renaisans",
            "Peradaban Mesir Kuno",
            "Revolusi Industri",
            "Sejarah Internet",
            "Revolusi Prancis",
            "Filsafat Yunani Kuno",
            "Penjelasan Perang Dingin",
            "Asal-usul demokrasi",
            "Bagaimana pesawat terbang?",
            "Apa itu Teori Big Bang?",
            "Bagaimana bintang terbentuk?",
            "Bisakah kita tinggal di Mars?",
            "Apa itu eksoplanet?",
            "Bagaimana cara kerja gravitasi?",
            "Apa itu supernova?",
            "Penjelasan tata surya",
            "Apa itu kesadaran?",
            "Jelaskan eksistensialisme",
            "Apa itu berpikir kritis?",
            "Arti kebahagiaan",
            "Apa itu etika?",
            "Jelaskan perubahan iklim",
            "Apa itu hidup berkelanjutan?",
            "Bagaimana cara kerja ekonomi?",
            "Apa itu inflasi?",
            "Jelaskan penawaran dan permintaan"
        ],
        'home.topic_map': {
            // Science
            "physics": ["Hukum Newton", "Penjelasan Gravitasi", "Dasar Termodinamika", "Kecepatan Cahaya", "Energi dan materi"],
            "quantum": ["Kucing Schrödinger", "Keterikatan Kuantum", "Dualitas Gelombang-Partikel", "Terowongan Kuantum"],
            "biology": ["Struktur Sel", "DNA vs RNA", "Teori Evolusi", "Ekosistem", "Anatomi Manusia"],
            "chemistry": ["Tabel Periodik", "Reaksi Kimia", "Atom dan Molekul", "pH dan Asam"],
            "plant": ["Proses Fotosintesis", "Reproduksi Tumbuhan", "Penyerbukan", "Sel Tumbuhan"],
            "animal": ["Perilaku Hewan", "Rantai Makanan", "Adaptasi", "Spesies Terancam Punah"],

            // Technology
            "tech": ["Cara Kerja Internet", "Dasar Coding", "Keamanan Siber", "Komputasi Awan"],
            "ai": ["Penjelasan Machine Learning", "Jaringan Saraf Tiruan", "Robotika", "Deep Learning", "Etika AI"],
            "computer": ["Cara Kerja Komputer", "Kode Biner", "Algoritma", "Struktur Data"],
            "blockchain": ["Dasar Cryptocurrency", "Smart Contracts", "Desentralisasi", "Penjelasan NFT"],
            "programming": ["Dasar Python", "Fundamental JavaScript", "Pengembangan Web", "Aplikasi Mobile"],

            // Space & Astronomy
            "space": ["Penjelasan Lubang Hitam", "Tata Surya", "Eksplorasi Mars", "Teori Big Bang"],
            "star": ["Bagaimana Bintang Terbentuk", "Supernova", "Rasi Bintang", "Siklus Hidup Bintang"],
            "planet": ["Eksoplanet", "Pembentukan Planet", "Planet Gas Raksasa", "Planet Batuan"],
            "universe": ["Materi Gelap", "Energi Gelap", "Galaksi", "Ekspansi Kosmik"],

            // History
            "history": ["Perang Dunia II", "Mesir Kuno", "Revolusi Industri", "Perang Dingin"],
            "ancient": ["Kekaisaran Romawi", "Peradaban Yunani", "Mesopotamia", "Cina Kuno"],
            "war": ["Perang Dunia I", "Perang Vietnam", "Perang Napoleon", "Perang Saudara"],
            "revolution": ["Revolusi Prancis", "Revolusi Amerika", "Revolusi Rusia", "Revolusi Budaya"],

            // Economics & Business
            "money": ["Penjelasan Inflasi", "Dasar Pasar Saham", "Cryptocurrency", "Penawaran dan Permintaan"],
            "economy": ["Penjelasan PDB", "Sistem Ekonomi", "Perdagangan", "Sistem Perbankan"],
            "business": ["Kewirausahaan", "Dasar Pemasaran", "Model Bisnis", "Startup"],

            // Arts & Culture
            "art": ["Seni Renaisans", "Impresionisme", "Teori Warna", "Pelukis Terkenal", "Seni Modern"],
            "music": ["Teori Musik", "Komposer Klasik", "Alat Musik", "Genre Musik"],
            "literature": ["Gerakan Sastra", "Penulis Terkenal", "Bentuk Puisi", "Bercerita"],

            // Philosophy & Psychology
            "philosophy": ["Eksistensialisme", "Stoikisme", "Etika", "Logika dan Penalaran"],
            "psychology": ["Perilaku Manusia", "Bias Kognitif", "Memori", "Emosi"],
            "mind": ["Kesadaran", "Berpikir Kritis", "Kreativitas", "Kecerdasan"],

            // Environment & Nature
            "climate": ["Perubahan Iklim", "Pemanasan Global", "Siklus Karbon", "Energi Terbarukan"],
            "environment": ["Ekosistem", "Keanekaragaman Hayati", "Konservasi", "Polusi"],
            "earth": ["Tektonik Lempeng", "Gempa Bumi", "Gunung Berapi", "Siklus Batuan"],
            "ocean": ["Arus Laut", "Kehidupan Laut", "Terumbu Karang", "Laut Dalam"],

            // Health & Medicine
            "health": ["Sistem Kekebalan Tubuh", "Nutrisi", "Ilmu Olahraga", "Kesehatan Mental"],
            "medicine": ["Vaksin", "Antibiotik", "Teknologi Medis", "Pencegahan Penyakit"],
            "body": ["Anatomi Manusia", "Sistem Organ", "Metabolisme", "Genetika"],

            // Mathematics
            "math": ["Dasar Aljabar", "Geometri", "Pengantar Kalkulus", "Statistik"],
            "number": ["Bilangan Prima", "Deret Fibonacci", "Penjelasan Pi", "Teori Bilangan"],

            // Social Sciences
            "society": ["Demokrasi", "Sistem Pemerintahan", "Gerakan Sosial", "Hak Asasi Manusia"],
            "culture": ["Keragaman Budaya", "Tradisi", "Bahasa", "Antropologi"],
            "politics": ["Sistem Politik", "Pemilihan Umum", "Hubungan Internasional", "Diplomasi"]
        },
    }
};

export const LanguageProvider = ({ children }) => {
    const { profile, updateProfile } = useAuth();
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('language') || 'en';
    });

    // Sync with profile preference
    useEffect(() => {
        if (profile?.language_preference) {
            const pref = profile.language_preference === 'id' ? 'id' : 'en';
            setLanguage(pref);
            localStorage.setItem('language', pref);
        }
    }, [profile]);

    const changeLanguage = async (lang) => {
        setLanguage(lang);
        localStorage.setItem('language', lang);
        if (profile) {
            await updateProfile({ language_preference: lang });
        }
    };

    const t = (key) => {
        return translations[language][key] || key;
    };

    const value = {
        language,
        changeLanguage,
        t
    };

    return (
        <LanguageContext.Provider value={value}>
            {children}
        </LanguageContext.Provider>
    );
};
