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
    const MAX_TILT   = 12;   // maksimum eğim (derece)
    const PERSPECTIVE = 900; // perspektif derinliği (px)

    document.querySelectorAll('.advantage-card').forEach(card => {

        // Fare karta girince: hızlı geçiş (cevap verir gibi)
        card.addEventListener('mouseenter', () => {
            card.style.transition = 'transform 0.08s ease, border-color 0.35s ease, box-shadow 0.35s ease, background 0.35s ease';
        });

        // Fare kart üzerindeyken: imlecin bulunduğu köşeye doğru eğil
        card.addEventListener('mousemove', (e) => {
            const rect    = card.getBoundingClientRect();
            const x       = e.clientX - rect.left;          // 0 → kart genişliği
            const y       = e.clientY - rect.top;           // 0 → kart yüksekliği
            const cx      = rect.width  / 2;
            const cy      = rect.height / 2;
            const deltaX  = (x - cx) / cx;  // -1 (sol) … +1 (sağ)
            const deltaY  = (y - cy) / cy;  // -1 (üst) … +1 (alt)

            // deltaX > 0 → sağda → sağ taraf ileri gelsin (rotateY negatif)
            // deltaY > 0 → altta → alt taraf ileri gelsin (rotateX pozitif)
            const rotateY =  deltaX * MAX_TILT;
            const rotateX = -deltaY * MAX_TILT;

            card.style.transform =
                `perspective(${PERSPECTIVE}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.04, 1.04, 1.04)`;
        });

        // Fare karttan çıkınca: yumuşak geri dönüş
        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.55s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.35s ease, box-shadow 0.35s ease, background 0.35s ease';
            card.style.transform  = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
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