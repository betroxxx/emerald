// Sayfa yenilendiğinde en başa dön (Özellikle oyunlar sayfası için)
if (window.location.pathname.includes('oyunlar.html')) {
    if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);
}

// Sayfa kaydırıldığında Navbar stilini değiştir
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});


// Kartlara yumuşak bir giriş efekti eklemek için (Opsiyonel - Intersection Observer)
const observerOptions = {
    threshold: 0.1
};


const canvas = document.getElementById('galaxyCanvas');
const ctx = canvas.getContext('2d');

let stars = [];
const starCount = 650; // Daha yoğun bir görünüm için sayı artırıldı

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

class Star {
    constructor() {
        this.reset();
    }

    reset() {
        // Ekranın merkezini baz alıyoruz
        this.centerX = canvas.width / 2;
        this.centerY = canvas.height / 2;

        // MERKEZDE TOPLANMAYI ENGELLEYEN AYAR:
        // Math.random() yanına eklediğimiz "+ 100", merkezde 100px'lik temiz bir daire bırakır.
        this.radius = (Math.random() * (canvas.width > canvas.height ? canvas.width : canvas.height)) + 100;

        // Başlangıç açısı (0 - 360 derece arası)
        this.angle = Math.random() * Math.PI * 2;

        // Dönüş hızı (Senin sevdiğin ilk hız değerleri)
        this.speed = (Math.random() * 0.002 + 0.0005);

        // Yıldız boyutu
        this.size = Math.random() * 1.5;

        // Parlama değişkenleri
        this.opacity = Math.random();
        this.glowSpeed = Math.random() * 0.02 + 0.01;
    }

    update() {
        // Açı sürekli artarak dairesel hareket sağlar
        this.angle += this.speed;

        // Parlama efekti (Nefes alma gibi sönüp yanma)
        this.opacity += this.glowSpeed;
        if (this.opacity > 1 || this.opacity < 0.2) {
            this.glowSpeed *= -1;
        }
    }

    draw() {
        // Kutupsal koordinatları (r, theta) Kartezyen koordinatlara (x, y) çeviriyoruz
        const x = this.centerX + Math.cos(this.angle) * this.radius;
        const y = this.centerY + Math.sin(this.angle) * this.radius;

        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);

        // Parlayan yıldızlar için shadow (gölge) efekti
        ctx.shadowBlur = this.size * 4;
        ctx.shadowColor = "white";

        // Yeşil temaya uygun çok hafif yeşilimsi beyaz
        ctx.fillStyle = `rgba(220, 255, 230, ${Math.abs(this.opacity)})`;
        ctx.fill();

        // Diğer çizimleri etkilememesi için gölgeyi sıfırlıyoruz
        ctx.shadowBlur = 0;
    }
}

function createStars() {
    stars = [];
    for (let i = 0; i < starCount; i++) {
        stars.push(new Star());
    }
}

function animate() {
    // Arka planı temizle ama hafif bir iz bırak (motion blur istersen temizleme rengini opacity ile ver)
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    stars.forEach(star => {
        star.update();
        star.draw();
    });
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    initCanvas();
    // Yeniden boyutlandırmada yıldızların merkezini güncelle
    stars.forEach(star => {
        star.centerX = canvas.width / 2;
        star.centerY = canvas.height / 2;
    });
});

initCanvas();
createStars();
animate();

// --- İstatistik Sayaç Animasyonu ---
function animateCounter(el) {
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1800;
    const start = performance.now();

    function step(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) requestAnimationFrame(step);
        else el.textContent = target;
    }
    requestAnimationFrame(step);
}

const globalObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('process-stepper')) {
                setTimeout(() => {
                    entry.target.classList.add('animate-start');
                }, 1000);
                // unobserve satırını sildik, döngü için izlemeye devam
            }
            if (entry.target.classList.contains('stats-counter')) {
                setTimeout(() => {
                    animateCounter(entry.target);
                }, 500);
                globalObserver.unobserve(entry.target);
            }
        }
    });
}, { threshold: 0.8 });

document.querySelectorAll('.stats-counter').forEach(el => globalObserver.observe(el));
document.querySelectorAll('.process-stepper').forEach(el => globalObserver.observe(el));

// --- Advantage Card 3D Tilt Efekti ---
(function () {
    const MAX_TILT = 12;   // maksimum eğim (derece)
    const PERSPECTIVE = 900; // perspektif derinliği (px)

    document.querySelectorAll('.advantage-card').forEach(card => {

        // Fare karta girince: hızlı geçiş (cevap verir gibi)
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.08s ease, border-color 0.35s ease, box-shadow 0.35s ease, background 0.35s ease';
        });

        // Fare kart üzerindeyken: imlecin bulunduğu köşeye doğru eğil
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;          // 0 → kart genişliği
            const y = e.clientY - rect.top;           // 0 → kart yüksekliği
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const deltaX = (x - cx) / cx;  // -1 (sol) … +1 (sağ)
            const deltaY = (y - cy) / cy;  // -1 (üst) … +1 (alt)

            // deltaX > 0 → sağda → sağ taraf ileri gelsin (rotateY negatif)
            // deltaY > 0 → altta → alt taraf ileri gelsin (rotateX pozitif)
            const rotateY = deltaX * MAX_TILT;
            const rotateX = -deltaY * MAX_TILT;

            card.style.transform =
                `perspective(${PERSPECTIVE}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
        });

        // Fare karttan çıkınca: yumuşak geri dönüş
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.35s ease, box-shadow 0.35s ease, background 0.35s ease';
            card.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
        });
    });
})();

// --- YUMUŞAK KAYDIRMA (HASSASİYET AYARLI) ---

let sy = 0; // Mevcut konum
let dy = 0; // Hedef konum

// AYARLAR: Buradaki rakamlarla oynayarak kendine göre optimize edebilirsin
const scrollSpeed = 0.085;   // Yumuşaklık (Değer küçüldükçe hareket daha "ağır" ve pürüzsüz olur)
const sensitivity = 0.7;    // HASSASİYET: 1'den küçükse daha az kayar, 1'den büyükse daha çok kayar. 
// 0.4 veya 0.5 genelde en doğal hissi verir.

window.addEventListener('wheel', (e) => {
    const isScrollable = e.target.closest('textarea') || e.target.closest('.scroll-box');
    if (isScrollable) return;

    if (Math.abs(e.deltaY) > 0) {
        if (e.ctrlKey) return;

        e.preventDefault();

        // e.deltaY değerini hassasiyet ile çarparak "ne kadar" gideceğini kontrol ediyoruz
        dy += e.deltaY * sensitivity;

        // Sayfa sınırlarını aşmasını engelle
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        dy = Math.max(0, Math.min(dy, maxScroll));
    }
}, { passive: false });

function smoothScrollRender() {
    if (Math.abs(dy - sy) > 0.1) {
        sy += (dy - sy) * scrollSpeed;
        window.scrollTo(0, sy);
    } else {
        sy = dy = window.scrollY;
    }
    requestAnimationFrame(smoothScrollRender);
}

smoothScrollRender();

// --- SSS TIKLAMA FONKSİYONU ---
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (!question) return;

        question.addEventListener('click', (e) => {
            const isActive = item.classList.contains('active');

            // Diğer açık olanları kapat
            faqItems.forEach(otherItem => {
                otherItem.classList.remove('active');
            });

            // Tıklanan zaten aktif değilse aç
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });

    // --- SCROLL REVEAL (KAYDIRMA EFEKTİ) ---
    const revealOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active-reveal');
                // Bir kere göründükten sonra izlemeyi bırakabiliriz
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        revealObserver.observe(el);
    });

    // --- OYUN KARTLARI TEK TEK ÇIKIŞ ANİMASYONU (oyunlar.html) ---
    const allGameCards = document.querySelectorAll('.games-grid .game-card');
    if (allGameCards.length > 0) {
        const CARDS_PER_ROW = 8;
        const CARD_DELAY = 70;    // Aynı satırdaki kartlar arası (ms)
        const ROW_DELAY = 600;    // Satırlar arası ek gecikme (ms)

        // Tüm kartları cascade şeklinde göster
        function revealAllCards() {
            allGameCards.forEach((card, i) => {
                const row = Math.floor(i / CARDS_PER_ROW);
                const col = i % CARDS_PER_ROW;
                const delay = (row * ROW_DELAY) + (col * CARD_DELAY);

                setTimeout(() => {
                    card.style.transitionDelay = '0s';
                    card.classList.add('card-visible');
                }, delay);
            });
        }

        // İlk kart ekrana girdiğinde tüm kartları tetikle
        const triggerObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    revealAllCards();
                    triggerObserver.disconnect(); // Tek seferlik
                }
            });
        }, { threshold: 0.05 });

        triggerObserver.observe(allGameCards[0]);
    }

    // --- OYUN ARA + PLATFORM FİLTRE FONKSİYONU (oyunlar.html) ---
    const searchInput = document.querySelector('.search-box-v2 input');
    const searchIcon = document.querySelector('.search-box-v2 i');
    const gameCards = document.querySelectorAll('.game-card');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Buton metni → platform-badge CSS class eşlemesi
    const platformMap = {
        'steam': 'steam',
        'epic games': 'epic-games',
        'ubisoft': 'ubisoft',
        'ea sports': 'ea-sports',
        'rockstar games': 'rockstar',
    };

    let activePlatform = null; // null = hepsi

    // Kart görünürlüğünü hem arama hem platforma göre güncelle
    const applyFilters = () => {
        const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

        gameCards.forEach(card => {
            const title = card.querySelector('.game-content h3');
            const titleText = title ? title.textContent.toLowerCase() : '';

            // Metin filtresi
            const matchesSearch = titleText.includes(query);

            // Platform filtresi
            let matchesPlatform = true;
            if (activePlatform) {
                matchesPlatform = card.querySelector(`.platform-badge.${activePlatform}`) !== null;
            }

            card.style.display = (matchesSearch && matchesPlatform) ? '' : 'none';
        });
    };

    // Platform buton tıklaması
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Aktif class'ı taşı
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const label = btn.textContent.trim().toLowerCase();
            activePlatform = platformMap[label] || null; // "Hepsi" için null

            applyFilters();
        });
    });

    // Arama kutusu
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
        if (searchIcon) {
            searchIcon.style.cursor = 'pointer';
            searchIcon.addEventListener('click', applyFilters);
        }
    }
});

// --- YORUMLAR (REVIEWS) İÇİN OTOMATİK SONSUZ DÖNGÜ (MARQUEE) ---
document.addEventListener('DOMContentLoaded', () => {
    const track = document.querySelector('.reviews-track');
    if (!track) return;

    const items = Array.from(track.children);
    if (items.length === 0) return;

    // Tek bir setin (orijinal yorumların) toplam genişliğini hesapla
    let trackWidth = 0;
    items.forEach(item => {
        // Elemanın genişliği + CSS'teki gap (30px)
        trackWidth += item.offsetWidth + 30;
    });

    if (trackWidth === 0) return;

    // Ekranın en az 2 katı genişliğe ulaşacak kadar set sayısını bul
    const minWidth = window.innerWidth * 2;
    let requiredSets = Math.ceil(minWidth / trackWidth);

    // CSS'teki "transform: translate3d(-50%, 0, 0)" mantığının kusursuz çalışması için
    // toplam set sayısının ÇİFT olması gerekir (en az 2).
    if (requiredSets < 2) requiredSets = 2;
    if (requiredSets % 2 !== 0) requiredSets++;

    // Orijinal 1 setimiz zaten var, geri kalanını klonla
    const cloneCount = requiredSets - 1;

    for (let i = 0; i < cloneCount; i++) {
        items.forEach(item => {
            const clone = item.cloneNode(true);
            track.appendChild(clone);
        });
    }

    // Sabit hız hesaplaması (Kutu sayısından bağımsız aynı hızda kayması için)
    // Saniyede 50 piksel kayma hızı (Yavaş ve akıcı)
    const speed = 50;
    const totalWidth = trackWidth * requiredSets;
    const distanceToScroll = totalWidth / 2; // CSS %50 kaydırıyor
    const duration = distanceToScroll / speed;

    // CSS animasyon süresini dinamik olarak ata
    track.style.animationDuration = `${duration}s`;
});

// --- DOĞRULAMA SAYFASI (dogrulama.html) ---
document.addEventListener('DOMContentLoaded', () => {
    const verifyInput = document.getElementById('verify-input');
    const verifyBtn   = document.getElementById('verify-btn');
    const verifyResult = document.getElementById('verify-result');
    const faqToggle   = document.getElementById('faqToggle');
    const faqList     = document.getElementById('faqList');

    // --- Anahtar Formatı: ES-XXXXXX-XXXXXX ---
    let previousValue = "";
    if (verifyInput) {
        verifyInput.addEventListener('input', () => {
            let val = verifyInput.value;
            let isDeleting = val.length < previousValue.length;
            
            // Sadece izin verilen karakterleri temizle ve formatla
            let cleaned = val.toUpperCase().replace(/[^A-Z0-9]/g, '');
            
            // Formatı oluştur
            let formatted = cleaned;
            if (cleaned.length > 2) {
                let first = cleaned.slice(0, 2);
                let middle = cleaned.slice(2, 8);
                formatted = first + '-' + middle;
                
                if (cleaned.length > 8 || (cleaned.length === 8 && !isDeleting)) {
                    let end = cleaned.slice(8, 14);
                    formatted += '-' + end;
                }
            } else if (cleaned.length === 2 && !isDeleting) {
                formatted = cleaned + '-';
            }
            
            // Cursor/Seçim pozisyonunu koru
            let selectionStart = verifyInput.selectionStart;
            let selectionEnd = verifyInput.selectionEnd;
            
            if (verifyInput.value !== formatted) {
                verifyInput.value = formatted;
                
                let diff = formatted.length - val.length;
                if (diff > 0) {
                    verifyInput.setSelectionRange(selectionStart + diff, selectionEnd + diff);
                } else {
                    verifyInput.setSelectionRange(selectionStart, selectionEnd);
                }
            }
            
            previousValue = formatted;

            // Butonu aktif/pasif yap
            const isValid = /^ES-[A-Z0-9]{6}-[A-Z0-9]{6}$/.test(formatted);
            verifyBtn.disabled = !isValid;
            verifyBtn.classList.toggle('active', isValid);

            // Önceki sonucu temizle
            if (verifyResult) {
                verifyResult.style.display = 'none';
                verifyResult.className = 'verify-result';
            }
        });
    }

    // --- Doğrula Butonu ---
    if (verifyBtn) {
        verifyBtn.addEventListener('click', async () => {
            if (verifyBtn.disabled) return;
            const key = verifyInput.value.trim();

            verifyBtn.disabled = true;
            verifyBtn.classList.remove('active');
            verifyBtn.textContent = 'Kontrol ediliyor...';

            // Simülasyon (gerçek API yokken test amaçlı)
            await new Promise(r => setTimeout(r, 1200));

            verifyResult.style.display = 'block';
            // Demo: her zaman geçersiz göster (gerçek backend bağlandığında değiştirilecek)
            verifyResult.className = 'verify-result error';
            verifyResult.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Anahtar geçersiz veya daha önce kullanılmış.';

            // Butonu sıfırla
            verifyBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg> Anahtarı Doğrula`;
            verifyBtn.disabled = false;
            verifyBtn.classList.add('active');
        });
    }

    // --- SSS Accordion ---
    if (faqToggle && faqList) {
        faqToggle.addEventListener('click', () => {
            const isOpen = faqList.classList.contains('open');
            faqList.classList.toggle('open', !isOpen);
            faqToggle.classList.toggle('open', !isOpen);
        });
    }
});

// --- CLOUDFLARE TURNSTILE GLOBAL CALLBAKLERİ ---
window.onTurnstileSuccess = function(token) {
    if (typeof window.setTurnstileVerified === 'function') {
        window.setTurnstileVerified(true);
    }
};

window.onTurnstileExpired = function() {
    if (typeof window.setTurnstileVerified === 'function') {
        window.setTurnstileVerified(false);
    }
};

window.onTurnstileError = function() {
    if (typeof window.setTurnstileVerified === 'function') {
        window.setTurnstileVerified(false);
    }
};

// --- GUARD KOD AL SAYFASI (kodal.html) ---
document.addEventListener('DOMContentLoaded', () => {
    const gameSelect = document.getElementById('game-select');
    if (!gameSelect) return; // Sadece kodal.html sayfasında çalışması için

    const guardBtn = document.getElementById('guard-btn');
    const guardForm = document.getElementById('guardForm');
    const guardResult = document.getElementById('guard-result');
    const generatedCode = document.getElementById('generated-code');
    const copyCodeBtn = document.getElementById('copy-code-btn');
    const countdownText = document.getElementById('countdown-text');
    const progressBar = document.getElementById('guard-progress-bar');
    const instructionsToggle = document.getElementById('instructionsToggle');
    const instructionsList = document.getElementById('instructionsList');

    let isTurnstileVerified = false;
    let countdownInterval = null;

    // Global turnstile doğrulama durumunu güncelleyen köprü
    window.setTurnstileVerified = (verified) => {
        isTurnstileVerified = verified;
        checkFormValidity();
    };

    // --- Form Doğrulama Kontrolü ---
    gameSelect.addEventListener('change', () => {
        checkFormValidity();
    });

    const checkFormValidity = () => {
        const isGameSelected = gameSelect.value !== '';
        const isValid = isGameSelected && isTurnstileVerified;
        guardBtn.disabled = !isValid;
    };

    // --- Guard Kodu Oluştur ve Zamanlayıcıyı Başlat ---
    guardBtn.addEventListener('click', () => {
        if (guardBtn.disabled) return;

        // 6 haneli rastgele kod üret (Örn: "293 841")
        const codePart1 = Math.floor(100 + Math.random() * 900);
        const codePart2 = Math.floor(100 + Math.random() * 900);
        const code = `${codePart1} ${codePart2}`;

        // Kod ekranını göster, formu gizle
        guardForm.style.display = 'none';
        guardResult.style.display = 'block';
        generatedCode.textContent = code;

        // 5 dakikalık (300 saniye) geri sayımı başlat
        startCountdown(300);
    });

    const startCountdown = (duration) => {
        clearInterval(countdownInterval);
        let timeRemaining = duration;

        const updateTimer = () => {
            const minutes = Math.floor(timeRemaining / 60);
            const seconds = timeRemaining % 60;
            const formattedMinutes = minutes.toString().padStart(2, '0');
            const formattedSeconds = seconds.toString().padStart(2, '0');
            
            countdownText.textContent = `${formattedMinutes}:${formattedSeconds}`;
            
            // Progress Bar genişlik yüzdesi
            const percentage = (timeRemaining / duration) * 100;
            progressBar.style.width = `${percentage}%`;

            if (timeRemaining <= 0) {
                clearInterval(countdownInterval);
                // Süre dolduğunda kodu geçersiz yap ve formu sıfırla
                generatedCode.innerHTML = '<span style="color: #ff7070; font-size: 20px; font-family: Montserrat;">Süre Doldu!</span>';
                copyCodeBtn.disabled = true;
                
                setTimeout(() => {
                    // Sayfayı eski haline getir
                    guardResult.style.display = 'none';
                    guardForm.style.display = 'flex';
                    gameSelect.value = '';
                    guardBtn.disabled = true;
                    copyCodeBtn.disabled = false;
                    
                    // Turnstile doğrulamasını sıfırla
                    isTurnstileVerified = false;
                    if (window.turnstile) {
                        window.turnstile.reset();
                    }
                }, 3000);
            }
            timeRemaining--;
        };

        updateTimer();
        countdownInterval = setInterval(updateTimer, 1000);
    };

    // --- Kodu Kopyala ---
    copyCodeBtn.addEventListener('click', () => {
        const textToCopy = generatedCode.textContent;
        navigator.clipboard.writeText(textToCopy).then(() => {
            // Buton ikonu ve başlığı başarılı bildirimiyle güncelle
            const originalHTML = copyCodeBtn.innerHTML;
            copyCodeBtn.innerHTML = '<i class="fa-solid fa-check" style="color: #5dcb87;"></i>';
            copyCodeBtn.title = 'Kopyalandı!';
            setTimeout(() => {
                copyCodeBtn.innerHTML = originalHTML;
                copyCodeBtn.title = 'Kodu Kopyala';
            }, 1500);
        }).catch(err => {
            console.error('Kopyalama hatası: ', err);
        });
    });

    // --- Kullanım Talimatları Accordion ---
    if (instructionsToggle && instructionsList) {
        instructionsToggle.addEventListener('click', () => {
            const isOpen = instructionsList.classList.contains('open');
            instructionsList.classList.toggle('open', !isOpen);
            instructionsToggle.classList.toggle('open', !isOpen);
        });
    }
});