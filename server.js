const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const path = require("path");
const fs = require("fs");
const nodemailer = require("nodemailer");

const app = express();
const PORT = 3000;
const DB_FILE = path.join(__dirname, "kayitli_kullanicilar.json");
const SECRET_KEY = "BURAYA_GİZLİ_ANAHTARINIZ";

let pendingUsers = {};
let resetRequests = {};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'BURAYA_DOĞRULAMA_KODLARINI_GONDEREN_GMAIL',
        pass: 'BURAYA_GOOGLE_UYGULAMA_ŞİFRENİZ'
    }
});

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public'), { extensions: ['html'] }));

function getUsers() {
    if (!fs.existsSync(DB_FILE)) return [];
    try {
        const data = fs.readFileSync(DB_FILE, 'utf8');
        return data ? JSON.parse(data) : [];
    } catch (e) { return []; }
}

// Doğrulama sayfası güvenliği için bekleyen kayıt kontrolü
app.post("/api/check-pending", (req, res) => {
    const { email } = req.body;
    if (email && pendingUsers[email]) {
        res.json({ valid: true });
    } else {
        res.json({ valid: false });
    }
});

// Şifre yenileme sayfası güvenliği için kontrol
app.post("/api/check-reset-status", (req, res) => { // <--- DÜZELTİLDİ
    const { email } = req.body;
    // resetRequests içinde bu mailin kodu var mı?
    if (email && resetRequests[email]) {
        res.json({ valid: true });
    } else {
        res.json({ valid: false });
    }
});

// 1. KULLANICI ADI KONTROLÜ
app.post("/api/check-username", (req, res) => {
    const { username } = req.body;
    const users = getUsers();
    const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    res.json({ exists });
});

// 2. KAYIT OLMA
app.post("/api/register", async (req, res) => {
    const { username, email, password, captchaToken } = req.body;
    const users = getUsers();

    if (users.some(u => u.email === email)) {
        return res.status(400).json({ success: false, message: "Bu E-posta adresi zaten kayıtlı!" });
    }

    try {
        const gRes = await axios.post(`https://www.google.com/recaptcha/api/siteverify?secret=${SECRET_KEY}&response=${captchaToken}`);

        // Gerçek yayında burayı gRes.data.success yapmalısın
        const isHuman = true;

        const vCode = Math.floor(100000 + Math.random() * 900000).toString();
        pendingUsers[email] = { username, password, code: vCode };

        // --- YENİ E-POSTA TASARIMI ---
        await transporter.sendMail({
            from: '"Premium Panel" <BURAYA_DOĞRULAMA_KODLARINI_GONDEREN_GMAIL>',
            to: email,
            subject: 'Hoş Geldiniz! Doğrulama Kodunuz', // Başlık daha samimi oldu
            html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background-color: #12152f; border-radius: 15px; overflow: hidden; color: #ffffff; border: 1px solid rgba(87, 227, 42, 0.2);">
                <div style="background-color: #1c1f3a; padding: 25px; text-align: center; border-bottom: 2px solid #57e32a;">
                    <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Premium Panel</h2>
                </div>
                
                <div style="padding: 40px 20px; text-align: center;">
                    <p style="font-size: 16px; color: #d4d4e7; margin-bottom: 30px; line-height: 1.5;">
                        Aramıza hoş geldin, <b>${username}</b>!<br>
                        Hesabını doğrulamak için aşağıdaki kodu kullanabilirsin.
                    </p>
                    
                    <div style="background-color: #0d0e22; border: 1px solid #57e32a; color: #57e32a; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 12px; display: inline-block; margin-bottom: 30px; box-shadow: 0 0 15px rgba(87, 227, 42, 0.2);">
                        ${vCode}
                    </div>
                    
                    <p style="font-size: 13px; color: #8a8ca0;">Bu kodu kimseyle paylaşmayın.</p>
                </div>
                
                <div style="background-color: #1c1f3a; padding: 20px; text-align: center; font-size: 12px; color: #5c5e7e; border-top: 1px solid rgba(255,255,255,0.05);">
                    &copy; 2025 Premium Panel. Güvenliğiniz bizim için önemli.
                </div>
            </div>
            `
        });

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ success: false, message: "Sistem veya Mail Hatası!" });
    }
});

// 3. KOD DOĞRULAMA (ENDPOINT DÜZELTİLDİ)
// Hem /api/verify hem de /api/verify_email isteklerini karşılar
app.post(["/api/verify", "/api/verify_email"], (req, res) => {
    const { email, code } = req.body;

    if (pendingUsers[email] && pendingUsers[email].code === code) {
        const users = getUsers();
        users.push({
            username: pendingUsers[email].username,
            email: email,
            password: pendingUsers[email].password
        });

        fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));
        delete pendingUsers[email];

        res.json({ success: true });
    } else {
        // Mesajı script.js ile uyumlu hale getirdik
        res.status(400).json({ success: false, message: "Doğrulama kodunuz yanlış!" });
    }
});

// 4. YENİDEN KOD GÖNDERME (HTML MAIL ŞABLONU EKLENDİ)
app.post("/api/resend-code", async (req, res) => {
    const { email } = req.body;
    if (pendingUsers[email]) {
        const newCode = Math.floor(100000 + Math.random() * 900000).toString();
        pendingUsers[email].code = newCode;
        try {
            await transporter.sendMail({
                from: '"Premium Panel" <BURAYA_DOĞRULAMA_KODLARINI_GONDEREN_GMAIL>',
                to: email,
                subject: 'Yeni Doğrulama Kodunuz',
                html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 500px; margin: 0 auto; background-color: #12152f; border-radius: 15px; overflow: hidden; color: #ffffff; border: 1px solid rgba(87, 227, 42, 0.2);">
                    <div style="background-color: #1c1f3a; padding: 25px; text-align: center; border-bottom: 2px solid #57e32a;">
                        <h2 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">Kod İsteği</h2>
                    </div>
                    <div style="padding: 40px 20px; text-align: center;">
                        <p style="font-size: 16px; color: #d4d4e7; margin-bottom: 30px;">
                            Yeni bir doğrulama kodu istediniz.<br>
                            İşte yeni kodunuz:
                        </p>
                        <div style="background-color: #0d0e22; border: 1px solid #57e32a; color: #57e32a; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 12px; display: inline-block; margin-bottom: 30px; box-shadow: 0 0 15px rgba(87, 227, 42, 0.2);">
                            ${newCode}
                        </div>
                    </div>
                    <div style="background-color: #1c1f3a; padding: 20px; text-align: center; font-size: 12px; color: #5c5e7e; border-top: 1px solid rgba(255,255,255,0.05);">
                        &copy; 2025 Premium Panel Support
                    </div>
                </div>
                `
            });
            res.json({ success: true });
        } catch (e) {
            res.status(500).json({ success: false, message: "Kod gönderilemedi!" });
        }
    } else {
        res.status(400).json({ success: false, message: "Kayıt oturumu bulunamadı." });
    }
});

// 5. GİRİŞ YAPMA
app.post("/api/login", (req, res) => {
    const { loginUser, loginPass } = req.body;
    const users = getUsers();

    const user = users.find(u =>
        (u.username === loginUser || u.email === loginUser) && u.password === loginPass
    );

    if (user) {
        res.json({ success: true, username: user.username });
    } else {
        res.status(401).json({ success: false, message: "Hatalı kullanıcı adı veya şifre!" });
    }
});

// 6. ŞİFREMİ UNUTTUM (KOD GÖNDERME) - GÜNCELLENDİ
app.post("/api/forgot-password", async (req, res) => {
    const { email } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email === email);

    if (user) {
        // 6 Haneli kod üret
        const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
        // Hafızaya kaydet (E-posta -> Kod)
        resetRequests[email] = resetCode;

        try {
            await transporter.sendMail({
                from: '"Premium Panel" <BURAYA_DOĞRULAMA_KODLARINI_GONDEREN_GMAIL>',
                to: email,
                subject: 'Şifre Sıfırlama Kodu',
                html: `
                <div style="background:#1a1a2e; color:#d4d4e7; padding:20px; border-radius:10px; font-family:sans-serif;">
                    <h2 style="color:#57e32a;">Şifre Sıfırlama</h2>
                    <p>Hesabınızın şifresini sıfırlamak için aşağıdaki kodu kullanın:</p>
                    <div style="background:#0d0e22; padding:15px; text-align:center; font-size:24px; letter-spacing:5px; border:1px solid #57e32a; border-radius:5px; margin:20px 0;">
                        <b>${resetCode}</b>
                    </div>
                    <p style="font-size:12px; color:#888;">Bu işlemi siz yapmadıysanız bu maili görmezden gelin.</p>
                </div>`
            });
            res.json({ success: true });
        } catch (e) {
            console.log(e);
            res.status(500).json({ success: false, message: "Mail gönderilemedi!" });
        }
    } else {
        // Güvenlik gereği "Böyle bir mail yok" demek yerine başarılı gibi davranılabilir ama
        // şimdilik kullanıcıya dürüst olalım:
        res.status(404).json({ success: false, message: "Bu e-posta adresi sistemde kayıtlı değil!" });
    }
});

// 7. YENİ ŞİFREYİ KAYDETME (YENİ EKLENDİ)
app.post("/api/reset-password", (req, res) => {
    const { email, code, newPassword } = req.body;

    // Kod kontrolü
    if (resetRequests[email] && resetRequests[email] === code) {
        const users = getUsers();
        const userIndex = users.findIndex(u => u.email === email);

        if (userIndex !== -1) {
            // Şifreyi güncelle
            users[userIndex].password = newPassword;
            fs.writeFileSync(DB_FILE, JSON.stringify(users, null, 2));

            // Kullanılan kodu sil (Tek kullanımlık olsun)
            delete resetRequests[email];

            res.json({ success: true });
        } else {
            res.status(400).json({ success: false, message: "Kullanıcı bulunamadı." });
        }
    } else {
        res.status(400).json({ success: false, message: "Doğrulama kodu hatalı veya süresi dolmuş!" });
    }
});

// ... (app.listen kısmı aynı kalacak)
app.listen(PORT, () => console.log(`Sunucu http://localhost:${PORT} üzerinde hazır!`));