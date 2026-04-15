// ต้องประกาศฟังก์ชันไว้ข้างนอกเพื่อให้ HTML onclick="revealSecret(event)" มองเห็น
window.revealSecret = function (event) {
    const text = document.getElementById('secret-text');
    const card = document.getElementById('secret-card');
    const btn = event.target;

    if (btn.dataset.running === "true") return;
    btn.dataset.running = "true";
    btn.disabled = true;
    btn.innerText = "BYPASSING...";

    const secrets = [
        "Initializing Decryption...",
        "Bypassing Samut Prakan Firewall...",
        "Decrypting 'wvgvJv' Root Files...",
        "Accessing Satellite Orbit...",
        "Decryption Complete! 🔥"
    ];

    let i = 0;
    card.style.animation = "glitch 0.2s infinite";

    const interval = setInterval(() => {
        text.innerText = ">> " + secrets[i];
        // สุ่มเขย่าการ์ดสะท้อนความดีด 67 องศา
        card.style.transform = `translate(${Math.random() * 4 - 2}px, ${Math.random() * 4 - 2}px)`;

        i++;
        if (i >= secrets.length) {
            clearInterval(interval);
            card.style.animation = "none";
            card.classList.add('revealed');
            card.style.boxShadow = "0 0 30px #f43f5e";
            card.style.borderColor = "#f43f5e";
            card.style.transform = "scale(1.05)";

            text.innerHTML = `
                <span style="color: #f43f5e; font-weight: bold;">ACCESS LEVEL: ROOT</span><br>
                <span style="font-size: 0.8em;">PROJECT: SATELLITE KILLER V.1</span><br>
                <b>PASSCODE: !E7Z_PR_SAMUT_10290</b>
            `;
            btn.innerText = "SYSTEM CRACKED";
        }
    }, 500);
};

document.addEventListener('DOMContentLoaded', () => {
    console.log("Above Team System: Online 🛰️");

    // 1. จัดการระบบ Clickable Card (ทั้ง External Link และ Internal Scroll)
    const cards = document.querySelectorAll('.card[data-href], .team-member');

    cards.forEach(card => {
        card.style.cursor = 'pointer';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');

        const handleNavigation = (e) => {
            // ป้องกันการทำงานซ้ำซ้อนถ้ากดโดนปุ่มหรือลิงก์ข้างใน
            if (e.target.closest('a, button')) return;

            const targetId = card.getAttribute('data-href') || card.id;

            // ถ้าเป็นลิงก์ภายใน (#) ให้ Scroll
            if (targetId && targetId.startsWith('#')) {
                const element = document.querySelector(targetId);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                    // Effect สั่นตอนวาร์ป
                    card.style.background = "rgba(56, 189, 248, 0.2)";
                    setTimeout(() => card.style.background = "", 300);
                }
            } else if (card.dataset.href) {
                // ถ้าเป็นลิงก์ภายนอกให้วาร์ปหน้า
                window.location.href = card.dataset.href;
            }
        };

        card.addEventListener('click', handleNavigation);
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNavigation(e);
            }
        });
    });

    // 2. ระบบสลับโหมด Dark/Light
    const themeBtn = document.createElement('button');
    themeBtn.innerText = "🌓 SWITCH MODE";
    themeBtn.id = "theme-toggle";

    const asideApp = document.querySelector('aside .app');
    if (asideApp) {
        asideApp.appendChild(themeBtn);
        Object.assign(themeBtn.style, {
            marginTop: '20px', padding: '10px', width: '100%',
            cursor: 'pointer', background: 'var(--accent)',
            color: '#fff', border: 'none', borderRadius: '5px', fontWeight: 'bold'
        });

        themeBtn.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            document.documentElement.setAttribute('data-theme', newTheme);
            console.log(`System: Mode set to ${newTheme} 🌑🌞`);
        });
    } else {
        console.warn("Above Team System: Failed to initialize theme toggle button.");
    }
});

const syncBtn = document.getElementById('sync-audio-btn');
const audio = document.getElementById('myAudio');
const grid = document.querySelector('.team-grid');

let audioCtx;
let analyser;
let source; // ประกาศไว้ข้างนอกเพื่อไม่ให้สร้างซ้ำ

syncBtn.addEventListener('click', function () {
    // 1. สร้าง AudioContext แค่ครั้งเดียว
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioCtx.createAnalyser();

        // เชื่อมต่อครั้งแรกและครั้งเดียวป้องกัน Error "already connected"
        source = audioCtx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(audioCtx.destination);
    }

    // 2. ปลุก AudioContext (ถ้ามันหลับอยู่)
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    audio.play();
    syncBtn.innerText = "🔊 SYNCING WITH STATIC...";

    function updatePulse() {
        analyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
            sum += dataArray[i];
        }
        // ปรับค่า Average ให้ไวขึ้น (คูณ 2 หรือ 3 เพื่อให้เห็นการเต้นชัดๆ)
        let average = (sum / bufferLength / 255) //* 3; // ปรับความไวของพัลส์
        average = Math.min(average, 1); // จำกัดค่าไม่ให้เกิน 1

        // ส่งค่าไปที่ CSS Variable --audio-pulse
        grid.style.setProperty('--audio-pulse', average);

        requestAnimationFrame(updatePulse);
    }
    updatePulse();
});

// ฟังก์ชันควบคุมพื้นฐาน (ใช้ตัวแปรเดียวกับด้านบน)
function playMusic() {
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    audio.play();
}

function pauseMusic() {
    audio.pause();
}

function stopMusic() {
    audio.pause();
    audio.currentTime = 0;
}
