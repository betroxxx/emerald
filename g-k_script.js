// --- 1. GENEL GÖRSEL ETKİLEŞİMLER (Linkler ve CapsLock) ---
document.addEventListener('click', function(e) {
    if (e.target.tagName === 'A' && e.target.getAttribute('href') === 'giris.html') {
        e.preventDefault();
        window.location.assign('giris.html');
    }
}, true);

window.addEventListener('keydown', (e) => {
    const capsNotice = document.getElementById('capsNotice');
    if (capsNotice) {
        if (e.getModifierState('CapsLock')) capsNotice.style.display = 'block';
        else capsNotice.style.display = 'none';
    }
});

document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        const input = document.getElementById(targetId);
        if (input.type === 'password') {
            input.type = 'text';
            this.classList.add('active');
        } else {
            input.type = 'password';
            this.classList.remove('active');
        }
    });
});

// --- 2. GÖRSEL ANİMASYON FONKSİYONLARI ---
function showErrorAnimation(message) {
    const oldAnim = document.getElementById("errorAnim");
    if (oldAnim) oldAnim.remove();

    const overlay = document.createElement("div");
    overlay.id = "errorAnim";
    overlay.className = "error-full-overlay"; 
    
    // SVG yapısını "Başarılı" ikonuyla aynı sadelikte tutuyoruz
    overlay.innerHTML = `
        <div class="error-modal-card">
            <svg class="error-icon-svg" viewBox="0 0 52 52">
                <circle class="error-circle" cx="26" cy="26" r="25" fill="none"/>
                <path class="error-x-mark" fill="none" d="M16 16 36 36 M36 16 16 36" stroke-linecap="round" stroke-width="4"/>
            </svg>
            <h2 class="modal-title-error">Hata!</h2>
            <p class="modal-text-error">${message}</p>
            <button onclick="closeErrorAnim()" class="modal-close-btn">Anladım</button>
        </div>
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
        overlay.style.opacity = "1";
        const card = overlay.querySelector('.error-modal-card');
        if(card) card.style.transform = "scale(1)";
    }, 10);
}

window.closeErrorAnim = function() {
    const overlay = document.getElementById("errorAnim");
    if (overlay) {
        overlay.style.opacity = "0";
        const card = overlay.querySelector('.error-modal-card');
        if(card) card.style.transform = "scale(0.9)";
        setTimeout(() => overlay.remove(), 300);
    }
};

// Fonksiyon artık 2 metin alıyor: title (Başlık) ve message (Alt Yazı)
function showSuccessAnimation(title, message, redirectUrl, autoRedirect = true) {
    const oldAnim = document.getElementById("successAnim");
    if (oldAnim) oldAnim.remove();

    const overlay = document.createElement("div");
    overlay.id = "successAnim"; 
    overlay.className = "success-full-overlay";
    
    overlay.innerHTML = `
        <div class="success-modal-card">
            <div class="success-animation">
                <svg viewBox="0 0 52 52">
                    <circle cx="26" cy="26" r="25" fill="none" stroke="#57e32a" stroke-width="2" class="circle-anim"/>
                    <path fill="none" stroke="#57e32a" stroke-width="4" stroke-linecap="round" d="M14.1 27.2l7.1 7.2 16.7-16.8" class="check-anim"/>
                </svg>
            </div>
            <h2 class="modal-title">${title}</h2>
            <p class="modal-text">${message}</p>
        </div>
    `;

    document.body.appendChild(overlay);

    // Animasyonlu Giriş
    setTimeout(() => {
        overlay.style.opacity = "1";
        const card = overlay.querySelector('.success-modal-card');
        if(card) card.style.transform = "scale(1)";
    }, 10);

    // Otomatik Kapanma Zamanlayıcısı (Her durumda çalışsın)
    setTimeout(() => {
        // Çıkış animasyonu
        overlay.style.opacity = "0";
        const card = overlay.querySelector('.success-modal-card');
        if(card) card.style.transform = "scale(0.9)";
        
        setTimeout(() => {
            if(overlay.parentNode) overlay.remove(); // Tabloyu sil
            
            // Eğer yönlendirme istenmişse sayfayı değiştir
            if (autoRedirect && redirectUrl && redirectUrl !== "#") {
                window.location.href = redirectUrl;
            }
        }, 300);
    }, 2500); // 2.5 saniye ekranda kalır
}

// --- 3. KAYIT FORMU VE ANALİZ SİSTEMİ ---
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    const uInput = document.getElementById("username"),
          eInput = document.getElementById("email"),
          eHint = document.getElementById("emailHint"),
          pInput = document.getElementById("password"),
          cpInput = document.getElementById("confirmPassword"),
          uStatus = document.getElementById("usernameStatus"),
          uErrorMsg = document.getElementById("usernameErrorMsg"),
          topError = document.getElementById("topErrorMessage");

    eInput.addEventListener("input", () => {
        const val = eInput.value;
        const targetDomain = "gmail.com";
        
        if (!val.includes("@")) {
            eHint.style.display = "none";
            eInput.classList.remove("error-border");
            return;
        }

        const parts = val.split("@");
        const domainPart = parts[1];

        if (domainPart === "") {
            eHint.style.display = "none";
            eInput.classList.remove("error-border");
            return;
        }

        if (targetDomain.startsWith(domainPart)) {
            eHint.style.display = "none";
            eInput.classList.remove("error-border");
            
            if (domainPart.length > targetDomain.length) {
                showEmailError();
            }
        } else {
            showEmailError();
        }

        function showEmailError() {
            eHint.textContent = "Lütfen sadece @gmail.com kullanın!";
            eHint.style.display = "block";
            eHint.style.color = "#ff5555";
            eInput.classList.add("error-border");
        }
    });

    uInput.addEventListener("input", () => {
        uInput.value = uInput.value.replace(/[^a-zA-Z0-9_]/g, '');
        uInput.classList.remove("error-border");
    });

    [eInput, pInput, cpInput].forEach(el => {
        if(el) {
            el.addEventListener("input", () => {
                el.classList.remove("error-border");
            });
        }
    });

    uInput.addEventListener("blur", async () => {
        let val = uInput.value.trim();
        let lowVal = val.toLowerCase();
        if(uStatus) uStatus.innerHTML = "";
        if(uErrorMsg) uErrorMsg.style.display = "none";

        if (val.length > 0 && val.length < 4) {
            uErrorMsg.textContent = "Kullanıcı adı çok kısa!";
            uErrorMsg.style.display = "block";
            uStatus.innerHTML = '<i class="fa-solid fa-circle-xmark status-error"></i>';
            return;
        }
        if (val.length > 20) {
            uErrorMsg.textContent = "Kullanıcı adınız çok uzun!";
            uErrorMsg.style.display = "block";
            uStatus.innerHTML = '<i class="fa-solid fa-circle-xmark status-error"></i>';
            return;
        }

        if (val.length >= 4) {
            const upperCaseChars = val.match(/[A-Z]/g) || [];
            const tooManyConsecutiveUpper = /[A-Z]{3,}/.test(val);
            const vowels = lowVal.match(/[aeıioöuü]/g) || [];
            const vowelRatio = vowels.length / val.length;
            const longConsonants = /[^aeıioöuü0-9_]{5,}/.test(lowVal);
            const uniqueChars = new Set(lowVal).size;
            const lowDiversity = (uniqueChars / val.length) < 0.45 && val.length > 8;
            const digits = val.replace(/\D/g, "");
            const excessiveDigits = digits.length > (val.length * 0.4);
            const sequentialDigits = /\d{5,}/.test(val);

            if (upperCaseChars.length > 6 || tooManyConsecutiveUpper || (vowelRatio < 0.12 && digits.length < 2) || longConsonants || lowDiversity || excessiveDigits || sequentialDigits) {
                uErrorMsg.textContent = "Kullanıcı adı uygun değil!";
                uErrorMsg.style.display = "block";
                uStatus.innerHTML = '<i class="fa-solid fa-circle-xmark status-error"></i>';
                return;
            }

            try {
                const res = await fetch("/api/check-username", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username: lowVal })
                });
                const data = await res.json();
                if (data.exists) {
                    uStatus.innerHTML = '<i class="fa-solid fa-circle-xmark status-error"></i>';
                    uErrorMsg.textContent = "Bu kullanıcı adı zaten alınmış!";
                    uErrorMsg.style.display = "block";
                } else {
                    uStatus.innerHTML = '<i class="fa-solid fa-circle-check status-success"></i>';
                    uErrorMsg.style.display = "none";
                }
            } catch (err) { console.log("Kontrol hatası"); }
        }
    });

    pInput.addEventListener("input", () => {
        const val = pInput.value;
        const hasUpper = /[A-Z]/.test(val);
        const hasLower = /[a-z]/.test(val);
        const hasNumber = /\d/.test(val);
        
        const lReq = document.getElementById("lengthReq");
        const nReq = document.getElementById("numberReq");
        const uReq = document.getElementById("upperReq");
        const lwReq = document.getElementById("lowerReq");
        const cReq = document.getElementById("caseReq");

        if(lReq) lReq.classList.toggle("valid-line", val.length >= 8);
        if(nReq) nReq.classList.toggle("valid-line", hasNumber);
        if(uReq) uReq.classList.toggle("valid-text", hasUpper);
        if(lwReq) lwReq.classList.toggle("valid-text", hasLower);
        if(cReq) cReq.classList.toggle("valid-line", hasUpper && hasLower);
        
        let strength = 0;
        if (val.length >= 8) strength += 25;
        if (hasNumber) strength += 25;
        if (hasUpper) strength += 25;
        if (hasLower) strength += 25;
        const sBar = document.getElementById("strengthBar");
        if (sBar) {
            sBar.style.width = strength + "%";
            if (strength <= 25) sBar.style.backgroundColor = "#ff5555";
            else if (strength <= 50) sBar.style.backgroundColor = "#ffb86c";
            else if (strength <= 75) sBar.style.backgroundColor = "#f1fa8c";
            else sBar.style.backgroundColor = "#57e32a";
        }
        checkConfirmMatch();
    });

    function checkConfirmMatch() {
        if (cpInput && pInput && cpInput.value.length > 0 && !pInput.value.startsWith(cpInput.value)) cpInput.classList.add("error-border");
        else if(cpInput) cpInput.classList.remove("error-border");
    }
    if(cpInput) cpInput.addEventListener("input", checkConfirmMatch);

    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const captchaToken = typeof grecaptcha !== 'undefined' ? grecaptcha.getResponse() : "mock_token";
        
        if (topError) { topError.style.display = "none"; topError.textContent = ""; }
        const inputs = [uInput, eInput, pInput, cpInput];

        let hasEmpty = false;
        inputs.forEach(input => {
            if (input && !input.value.trim()) {
                input.classList.add("error-border");
                hasEmpty = true;
            }
        });

        if (hasEmpty) {
            if (topError) { topError.textContent = "Lütfen gerekli alanları doldurun!"; topError.style.display = "block"; }
            return;
        }

        if (!eInput.value.trim().endsWith("@gmail.com")) {
            eInput.classList.add("error-border");
            if(eHint) {
                eHint.textContent = "Lütfen geçerli bir @gmail.com adresi giriniz!";
                eHint.style.display = "block";
            }
            return;
        }

        if (uStatus && uStatus.innerHTML.includes("status-error")) {
            if (topError) {
                topError.textContent = uErrorMsg.textContent || "Kullanıcı adı geçersiz veya alınmış!";
                topError.style.display = "block";
            }
            uInput.classList.add("error-border");
            return;
        }

        if (pInput.value !== cpInput.value) {
            cpInput.classList.add("error-border");
            return;
        }
        if (!captchaToken && typeof grecaptcha !== 'undefined') { if (topError) { topError.textContent = "Lütfen robot olmadığınızı doğrulayın!"; topError.style.display = "block"; } return; }

        btn.classList.add('loading');
       // ... fetch kodunun olduğu kısım ...
        try {
    const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: uInput.value, email: eInput.value, password: pInput.value, captchaToken })
    });
    
    const data = await res.json();
    
    if (res.ok && data.success) {
        localStorage.setItem("pendingEmail", eInput.value);
        showSuccessAnimation("Kayıt Başarılı!", "Doğrulama sayfasına yönlendiriliyorsunuz...", "dogrulama.html");
    } else {
        const msg = data.message || "Hata oluştu!";
        
        // --- BURASI GÜNCELLENDİ ---
        if (msg.toLowerCase().includes("e-posta") || msg.toLowerCase().includes("kayıtlı")) {
            eInput.classList.add("error-border");
            // Sadece kutuya yazmak yerine, blurlu tabloyu çağırıyoruz:
            showErrorAnimation("Bu e-posta adresi zaten sisteme kayıtlı!"); 
        } else {
            // Diğer tüm hatalar için de blurlu tabloyu göster
            showErrorAnimation(msg);
        }
    }
}   
    catch (err) { 
    showErrorAnimation("Sunucuyla bağlantı kurulamadı!"); 
    }
        finally { btn.classList.remove('loading'); }
    });
}

// --- 4. LOGIN FORMU ---
document.addEventListener("DOMContentLoaded", () => {
    const uField = document.getElementById("loginUser");
    const rememberMe = document.getElementById("rememberMe");
    
    if (uField && rememberMe) {
        const savedUser = localStorage.getItem("rememberedUser");
        if (savedUser) {
            uField.value = savedUser;
            rememberMe.checked = true;
        }
    }
});

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const uField = document.getElementById("loginUser");
        const pField = document.getElementById("loginPass");
        const loginError = document.getElementById("loginError");
        const rememberMe = document.getElementById("rememberMe");
        const btn = e.target.querySelector('button');

        if (loginError) loginError.style.display = "none";
        uField.classList.remove("error-border");
        pField.classList.remove("error-border");

        if(!uField.value.trim() || !pField.value.trim()){
            if(!uField.value.trim()) uField.classList.add("error-border");
            if(!pField.value.trim()) pField.classList.add("error-border");
            if(loginError) {
                loginError.textContent = "Lütfen gerekli alanları doldurunuz!";
                loginError.style.display = "block";
            }
            return;
        }

        btn.classList.add('loading');
        try {
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem("rememberedUser", uField.value);
            } else {
                localStorage.removeItem("rememberedUser");
            }

            const res = await fetch("/api/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    loginUser: uField.value,
                    loginPass: pField.value,
                    remember: rememberMe ? rememberMe.checked : false
                })
            });
            const data = await res.json();
            if (res.ok && data.success) {
                localStorage.setItem("username", data.username);
                if(data.token) localStorage.setItem("token", data.token);
                showSuccessAnimation("Giriş Başarılı!", "Ana sayfaya yönlendiriliyorsunuz...", "ana-sayfa.html");
            } else {
                if(loginError) {
                    loginError.textContent = "Kullanıcı adı veya şifre hatalı!";
                    loginError.style.display = "block";
                }
                uField.classList.add("error-border");
                pField.classList.add("error-border");
            }
        } catch (err) {
            if(loginError) {
                loginError.textContent = "Bir hata oluştu!";
                loginError.style.display = "block";
            }
        }
        finally { btn.classList.remove('loading'); }
    });
}

// --- 5. DOĞRULAMA SİSTEMİ ---
const verifyForm = document.getElementById("verifyForm");
if (verifyForm) {
    const vInput = document.getElementById("verifyCode");
    const vError = document.getElementById("verifyError");

    vInput.addEventListener("input", (e) => {
        vInput.value = vInput.value.replace(/[^0-9]/g, '');
        vInput.classList.remove("shake-error", "error-border");
        if (vError) vError.style.display = "none";
    });

    verifyForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        const code = vInput.value.trim();

        if (vError) vError.style.display = "none";
        vInput.classList.remove("shake-error", "error-border");

        if (code.length !== 6) {
            triggerShakeError("Lütfen 6 haneli kodu eksiksiz giriniz!");
            return;
        }

        btn.classList.add('loading');
        try {
            const pendingEmail = localStorage.getItem("pendingEmail");
            const response = await fetch("/api/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: pendingEmail, code: code })
            });
            
            let result;
            try {
                result = await response.json();
            } catch (jsonErr) {
                triggerShakeError("Doğrulama kodunuz yanlış!");
                return;
            }

            if (response.ok && result.success) {
                showSuccessAnimation("Doğrulama Başarılı!", "Giriş sayfasına yönlendiriliyorsunuz...", "giris.html");
                localStorage.removeItem("pendingEmail");
            } else {
                triggerShakeError("Doğrulama kodunuz yanlış!");
            }
        } catch (err) {
            triggerShakeError("Doğrulama kodunuz yanlış!");
        } finally {
            btn.classList.remove('loading');
        }
    });

    function triggerShakeError(msg) {
        vInput.classList.add("shake-error", "error-border");
        if (vError) {
            vError.textContent = msg;
            vError.style.display = "block";
        }
        setTimeout(() => vInput.classList.remove("shake-error"), 400);
    }

// --- AKILLI SAYAÇ SİSTEMİ (SAYFA YENİLENSE DE KORUNUR) ---
// --- AKILLI SAYAÇ SİSTEMİ (ANLIK TEPKİLİ) ---
    const resendBtn = document.getElementById("resendCode");
    
    if (resendBtn) {
        checkExistingTimer(); 

        resendBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            
            // Buton pasifse veya zaten işlem yapılıyorsa dur
            if (resendBtn.style.cursor === "not-allowed" || resendBtn.textContent === "Gönderiliyor...") return;

            // --- 1. ANLIK TEPKİ (Hemen çalışır) ---
            // Kullanıcı tıkladığı an yazıyı değiştiriyoruz ki donmuş sanmasın
            const originalText = resendBtn.textContent; 
            resendBtn.textContent = "Gönderiliyor..."; 
            resendBtn.style.opacity = "0.7";
            // -------------------------------------

            const pendingEmail = localStorage.getItem("pendingEmail");
            
            try {
                // Burası 2 saniye sürse bile kullanıcı yukarıda "Gönderiliyor..." yazısını görüyor
                const res = await fetch("/api/resend-code", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: pendingEmail })
                });
                const data = await res.json();
                
                if (data.success) {
                    showSuccessAnimation("Yeni Kod Gönderildi!", "Lütfen e-posta kutunuzu kontrol edin!", false);
                    
                    const expiryTime = Date.now() + (60 * 1000);
                    localStorage.setItem("resendExpiry", expiryTime);
                    
                    startCooldownTimer(60); 
                } else {
                    // Hata olursa butonu eski haline getir
                    resendBtn.textContent = "Tekrar Gönder";
                    resendBtn.style.opacity = "1";
                    showErrorAnimation(data.message || "Kod gönderilemedi!");
                }
            } catch (err) { 
                // Hata olursa butonu eski haline getir
                resendBtn.textContent = "Tekrar Gönder";
                resendBtn.style.opacity = "1";
                showErrorAnimation("Bağlantı hatası oluştu!"); 
            }
        });
    }

    function checkExistingTimer() {
        const expiryTime = localStorage.getItem("resendExpiry");
        if (expiryTime) {
            const now = Date.now();
            const timeLeft = Math.ceil((expiryTime - now) / 1000);

            if (timeLeft > 0) {
                // Süre bitmemiş, sayacı kaldığı yerden başlat
                startCooldownTimer(timeLeft);
            } else {
                // Süre dolmuş, hafızayı temizle
                localStorage.removeItem("resendExpiry");
            }
        }
    }

    function startCooldownTimer(duration) {
        const btn = document.getElementById("resendCode");
        if (!btn) return;

        let timer = duration;
        const originalText = "Tekrar Gönder"; 

        // Butonu pasif yap
        btn.style.opacity = "0.5";
        btn.style.cursor = "not-allowed";
        btn.style.pointerEvents = "none"; // Tıklamayı tamamen engeller

        // Varsa eski sayacı temizle (Çakışmayı önler)
        if (window.resendInterval) clearInterval(window.resendInterval);

        // İlk saniyeyi hemen yaz
        btn.textContent = `Tekrar Gönder (${timer}s)`;

        window.resendInterval = setInterval(() => {
            timer--;
            btn.textContent = `Tekrar Gönder (${timer}s)`;

            if (timer <= 0) {
                clearInterval(window.resendInterval);
                localStorage.removeItem("resendExpiry"); // Hafızadan sil
                
                // Butonu aktif et
                btn.textContent = originalText;
                btn.style.opacity = "1";
                btn.style.cursor = "pointer";
                btn.style.pointerEvents = "auto";
            }
        }, 1000);
    }
    }

// --- 6. DASHBOARD YÖNETİMİ ---
if (window.location.pathname.includes("ana-sayfa.html")) {
    const storedUser = localStorage.getItem("username");
    if (!storedUser) {
        window.location.href = "giris.html";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname.includes("ana-sayfa.html")) {
        const userDisplay = document.getElementById("welcomeUser");
        const storedUser = localStorage.getItem("username");
        const logoutBtn = document.getElementById("logoutBtn");

        if (userDisplay && storedUser) {
            userDisplay.textContent = storedUser;
        }

        if (logoutBtn) {
            logoutBtn.addEventListener("click", (e) => {
                e.preventDefault();
                localStorage.removeItem("username");
                localStorage.removeItem("token");
                showSuccessAnimation("Oturum Kapatıldı!", "", "giris.html");
            });
        }
        loadProfileData();
    }
});

async function loadProfileData() {
    try {
        const res = await fetch("/api/user-profile", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token")
            }
        });
        if(res.ok) {
            const data = await res.json();
            console.log("Profil verileri alındı:", data);
        }
    } catch (err) { console.log("Profil çekme hatası."); }
}
// --- 7. ŞİFRE SIFIRLAMA İŞLEMLERİ (YENİ EKLENDİ) ---

// A) Şifremi Unuttum Formu (Mail Gönderme)
const forgotForm = document.getElementById("forgotForm");
if (forgotForm) {
    forgotForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const emailInput = document.getElementById("forgotEmail");
        const btn = e.target.querySelector('button');
        const errBox = document.getElementById("forgotError");

        if(errBox) errBox.style.display = "none";

        if (!emailInput.value.trim()) {
             if(errBox) { errBox.textContent = "Lütfen e-posta adresinizi girin."; errBox.style.display="block"; }
             return;
        }

        btn.classList.add('loading');
        
        try {
            const res = await fetch("/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailInput.value.trim() })
            });
            const data = await res.json();

            if (data.success) {
                // E-postayı hafızaya al ki bir sonraki sayfada tekrar sormayalım
                localStorage.setItem("resetEmail", emailInput.value.trim());
                showSuccessAnimation("Kod Gönderildi!", "Lütfen e-posta kutunuzu kontrol edin!", "sifre-yenileme.html");
            } else {
                if(errBox) { errBox.textContent = data.message; errBox.style.display="block"; }
                showErrorAnimation(data.message);
            }
        } catch (err) {
            showErrorAnimation("Sunucu hatası oluştu.");
        } finally {
            btn.classList.remove('loading');
        }
    });
}

// --- 6. ŞİFRE YENİLEME (KAYIT SAYFASI TASARIMLI UYARI) ---
const resetForm = document.getElementById("resetPasswordForm");

if (resetForm) {
    // 1. SAYAÇ KURULUMU
    const timerDisplay = document.getElementById("codeTimer");
    const TIMER_DURATION =120; 
    let isCodeExpired = false;

    if (timerDisplay) {
        let expiryTime = localStorage.getItem("resetTimerExpiry");
        if (!expiryTime) {
            expiryTime = Date.now() + (TIMER_DURATION * 1000);
            localStorage.setItem("resetTimerExpiry", expiryTime);
        }

        const updateTimer = () => {
            const now = Date.now();
            const timeLeft = Math.ceil((expiryTime - now) / 1000);

            if (timeLeft <= 0) {
                timerDisplay.textContent = "0s"; 
                timerDisplay.style.color = "#888"; 
                isCodeExpired = true;
                localStorage.removeItem("resetTimerExpiry"); 
                return; 
            }
            timerDisplay.textContent = `${timeLeft}s`;
            requestAnimationFrame(updateTimer); 
        };
        updateTimer(); 
    }

    // --- DEĞİŞKENLER VE YARDIMCI FONKSİYONLAR ---
    const codeInput = document.getElementById("resetCode");
    const newPassInput = document.getElementById("newPassword");
    const confirmPassInput = document.getElementById("confirmNewPassword");
    const reqBox = document.getElementById("passwordDynamicRequirements");
    const topErrorBox = document.getElementById("topErrorMessage");
    let validationActive = false; 

    // --- YENİLENEN UYARI TASARIMI (KAYIT SAYFASI İLE AYNI) ---
    function showInlineError(msg) {
        if (topErrorBox) {
            topErrorBox.textContent = msg;
            topErrorBox.style.display = "block";
            
            // Kayıt Sayfası Stilini Burada Kodluyoruz:
            topErrorBox.style.background = "rgba(220, 53, 69, 0.15)"; // Hafif transparan kırmızı
            topErrorBox.style.borderLeft = "4px solid #ff4757";        // Soldaki kalın çizgi
            topErrorBox.style.color = "#ff6b81";                       // Yazı rengi
            topErrorBox.style.padding = "15px";                        // Geniş iç boşluk
            topErrorBox.style.borderRadius = "4px";
            topErrorBox.style.fontSize = "14px";                       // Okunaklı font boyutu
            topErrorBox.style.fontWeight = "500";
            topErrorBox.style.marginBottom = "20px";
            topErrorBox.style.textAlign = "left";                      // Sola hizalı
            topErrorBox.style.width = "100%";
            topErrorBox.style.boxSizing = "border-box";
        }
    }

    function clearInlineError() {
        if (topErrorBox) {
            topErrorBox.style.display = "none";
            topErrorBox.textContent = "";
        }
    }

    // Şifre Gereksinim Kontrolü
    function checkPasswordRequirements() {
        const val = newPassInput.value;
        const errors = [];
        if (val.length < 8) errors.push("Şifrenizde en az 8 karakter bulunmalıdır!");
        if (!/[0-9]/.test(val)) errors.push("Şifrenizde en az 1 rakam bulunmalıdır!");
        if (!/[a-z]/.test(val)) errors.push("Şifrenizde en az 1 küçük harf olmalıdır!");
        if (!/[A-Z]/.test(val)) errors.push("Şifrenizde en az 1 büyük harf olmalıdır!");
        return errors;
    }

    // Hata Listesini Ekrana Bas
    function renderErrors(errors) {
        reqBox.innerHTML = ""; 
        if (errors.length > 0) {
            errors.forEach(err => {
                const div = document.createElement("div");
                div.className = "req-item-error";
                div.innerText = err;
                reqBox.appendChild(div);
            });
        }
    }

    // 2. INPUT DİNLEYİCİSİ (CANLI TAKİP)
    newPassInput.addEventListener("input", () => {
        clearInlineError();
        if (validationActive) {
            const currentErrors = checkPasswordRequirements();
            renderErrors(currentErrors);
        }
    });

    confirmPassInput.addEventListener("input", clearInlineError);
    codeInput.addEventListener("input", clearInlineError);


    // 3. FORM GÖNDERME
    resetForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btn = resetForm.querySelector('button');
        const email = localStorage.getItem("resetEmail");

        clearInlineError(); 

        // SÜRE KONTROLÜ
        if (isCodeExpired) {
            showInlineError("Doğrulama kodunun süresi dolmuş!");
            return;
        }

        // OTURUM KONTROLÜ
        if (!email) {
            showInlineError("Oturum süresi dolmuş. Giriş sayfasına yönlendiriliyorsunuz...");
            setTimeout(() => window.location.href = "sifremi-unuttum.html", 2000);
            return;
        }

        // BOŞ ALAN KONTROLÜ
        if (!codeInput.value.trim() || !newPassInput.value || !confirmPassInput.value) {
            showInlineError("Lütfen tüm alanları doldurunuz."); // Artık büyük kutuda çıkacak
            return;
        }

        // ŞİFRE EŞLEŞME KONTROLÜ
        if (newPassInput.value !== confirmPassInput.value) {
            showInlineError("Şifreler birbiriyle uyuşmuyor!");
            return;
        }

        // GEREKSİNİM KONTROLÜ
        const errors = checkPasswordRequirements();
        if (errors.length > 0) {
            validationActive = true; 
            renderErrors(errors);    
            reqBox.style.animation = "shake 0.3s ease-in-out";
            setTimeout(() => reqBox.style.animation = "", 300);
            return; 
        }

        // SUNUCU İŞLEMİ
        if(btn) { btn.innerHTML = "Güncelleniyor..."; btn.disabled = true; }

        try {
            const res = await fetch("/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    email: email,
                    code: codeInput.value.trim(),
                    newPassword: newPassInput.value
                })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.removeItem("resetEmail");
                localStorage.removeItem("resetTimerExpiry");
                showSuccessAnimation("Şifreniz Değiştirildi!", "Giriş sayfasına yönlendiriliyorsunuz...", "giris.html");
            } else {
                showInlineError(data.message || "Kod hatalı!");
                if(btn) { btn.innerHTML = "Şifreyi Güncelle"; btn.disabled = false; }
            }
        } catch (err) {
            showInlineError("Sunucu hatası oluştu.");
            if(btn) { btn.innerHTML = "Şifreyi Güncelle"; btn.disabled = false; }
        }
    });
}