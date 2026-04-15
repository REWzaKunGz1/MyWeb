function myFunction() {
    document.getElementById("demo").innerHTML = "Paragraph changed.";
}

const menuToggle = document.getElementById('menu-toggle');
const sideMenu = document.getElementById('side-menu');

menuToggle.addEventListener('click', () => {
    // สั่งให้ aside สไลด์เข้า-ออก
    sideMenu.classList.toggle('hidden');

    // สั่งให้เนื้อหาหลัก (main) ขยับตาม
    document.body.classList.toggle('menu-closed');
});

if (localStorage.getItem('isLoggedIn') !== 'true') {
    window.location.href = 'menu/login.html';
}

// 1. เช็คตอนโหลดหน้าเว็บ
window.addEventListener('load', function () {
    const savedTheme = localStorage.getItem('theme');
    const btn = document.getElementById('theme-btn'); // หาปุ่ม

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        // เช็คก่อนว่าหน้าเว็บนี้มีปุ่มไหม ถึงค่อยเปลี่ยนตัวหนังสือ
        if (btn) {
            btn.innerHTML = '☀️ Light Mode';
        }
    }
});

// 2. ฟังก์ชันสลับโหมด
function toggleTheme() {
    const body = document.body;
    const btn = document.getElementById('theme-btn'); // หาปุ่ม

    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('theme', 'dark');
        // ถ้าหน้าเว็บนี้มีปุ่ม ถึงค่อยสั่งเปลี่ยนตัวหนังสือ
        if (btn) btn.innerHTML = '☀️ Light Mode';
    } else {
        localStorage.setItem('theme', 'light');
        // ถ้าหน้าเว็บนี้มีปุ่ม ถึงค่อยสั่งเปลี่ยนตัวหนังสือ
        if (btn) btn.innerHTML = '🌙 Dark Mode';
    }
}

// ระบบลิงก์รูปโปรไฟล์
function sendToCloud() {
    const input = document.getElementById('chat-message');
    const msg = input.value.trim();
    const user = localStorage.getItem('currentUser') || 'User';

    // ดึงรูปโปรไฟล์ที่เราอัปโหลดไว้ในเครื่อง (ถ้าไม่มีใช้รูปเริ่มต้น)
    const myPic = localStorage.getItem('saved_pic') || "https://www.animationmagazine.net/wordpress/wp-content/uploads/Skibidi-Toilet.jpg";

    if (msg !== "") {
        db.ref('global_chat').push({
            username: user,
            message: msg,
            profilePic: myPic, // ส่ง "ข้อมูลรูป" ขึ้นไปด้วย
            timestamp: Date.now()
        });
        input.value = '';
    }
}

db.ref('global_chat').on('value', (snapshot) => {
    const display = document.getElementById('chat-display');
    display.innerHTML = '';

    const data = snapshot.val();
    for (let id in data) {
        const item = data[id];
        const isMe = item.username === localStorage.getItem('currentUser');

        // 3. ดึงรูปที่ติดมากับข้อความใน Cloud (ถ้าไม่มีให้ใช้รูปสำรอง)
        const userImg = item.profilePic || "https://www.animationmagazine.net/wordpress/wp-content/uploads/Skibidi-Toilet.jpg";

        display.innerHTML += `
            <div style="display: flex; flex-direction: ${isMe ? 'row-reverse' : 'row'}; align-items: flex-end; gap: 8px; margin-bottom: 10px;">
                <img src="${userImg}" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 2px solid #4466ff;">
                
                <div style="background: ${isMe ? '#4466ff' : '#333'}; color: white; padding: 8px 12px; border-radius: 12px; max-width: 70%;">
                    <small style="display: block; font-size: 10px; opacity: 0.6;">${item.username}</small>
                    ${item.message}
                </div>
            </div>
        `;
    }
    display.scrollTop = display.scrollHeight;
});

// ฟังก์ชันหลักที่สั่งให้เริ่มทำงานเมื่อเปิดหน้าเว็บ
document.addEventListener('DOMContentLoaded', () => {
    displayProfile();
});

function displayProfile() {
    const user = localStorage.getItem('currentUser') || 'User';
    let userPic = localStorage.getItem('saved_pic') || "https://www.animationmagazine.net/wordpress/wp-content/uploads/Skibidi-Toilet.jpg";

    const authSection = document.getElementById('authSection');

    // ตรวจสอบว่ามี element นี้อยู่ในหน้า HTML นั้นจริงๆ หรือไม่
    if (authSection) {
        authSection.innerHTML = `
            <div style="text-align: center; padding: 20px 10px; background: rgba(255,255,255,0.1); border-radius: 15px; border: 1px solid rgba(255,255,255,0.2); margin: 10px;">
                <div style="position: relative; display: inline-block; margin-bottom: 10px;">
                    <img id="profileImg" src="${userPic}" 
                        style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 3px solid #4466ff; box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                    
                    <label for="uploadInput" style="position: absolute; bottom: 0; right: 0; background: #4466ff; color: white; border: 2px solid #1a1a2e; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px;">
                        📷
                    </label>
                    <input type="file" id="uploadInput" accept="image/*" style="display: none;" onchange="uploadImage(this)">
                </div>
                <p style="color: white; margin: 5px 0;"><strong>${user}</strong></p>
                <button class="Btn" onclick="logout()">
                    <div class="sign">
                        <svg viewBox="0 0 512 512"><path d="M377.9 105.9L500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9c-18.7 0-33.9-15.2-33.9-33.9l0-62.1-128 0c-17.7 0-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32l128 0 0-62.1c0-18.7 15.2-33.9 33.9-33.9c9 0 17.6 3.6 24 9.9zM160 96L96 96c-17.7 0-32 14.3-32 32l0 256c0 17.7 14.3 32 32 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32l-64 0c-53 0-96-43-96-96L0 128C0 75 43 32 96 32l64 0c17.7 0 32 14.3 32 32s-14.3 32-32 32z"></path></svg>
                    </div>
                    <div class="text" style="right: 0px; " > Logout</div>
                </button>

        <label class="switch" style="display: block; margin-left: 0px; margin-top: 20px;">
            <input checked="true" id="checkbox" type="checkbox" onclick="toggleTheme()" />

            <span class="slider">
                <div class="star star_1" style="width: 20px; height: 20px; background: #f1c40f; border-radius: 50%; box-shadow: 0 0 10px #f1c40f;"></div>
                <svg viewBox="0 0 16 16" class="cloud_1 cloud">
                    <path transform="matrix(.77976 0 0 .78395-299.99-418.63)" fill="#fff"
                        d="m391.84 540.91c-.421-.329-.949-.524-1.523-.524-1.351 0-2.451 1.084-2.485 2.435-1.395.526-2.388 1.88-2.388 3.466 0 1.874 1.385 3.423 3.182 3.667v.034h12.73v-.006c1.775-.104 3.182-1.584 3.182-3.395 0-1.747-1.309-3.186-2.994-3.379.007-.106.011-.214.011-.322 0-2.707-2.271-4.901-5.072-4.901-2.073 0-3.856 1.202-4.643 2.925">
                    </path>
                </svg>
            </span>

        </label>
        
            </div>
        `;
    }
}

// ฟังก์ชันจัดการการอัปโหลดไฟล์
function uploadImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {
            const base64Image = e.target.result;

            // 1. แสดงผลบนหน้าจอทันที
            document.getElementById('profileImg').src = base64Image;

            // 2. บันทึกลง LocalStorage (เก็บเป็นข้อความ Base64)
            localStorage.setItem('saved_pic', base64Image);

            alert("Image uploaded successfully!");
        };

        // อ่านไฟล์ภาพและแปลงเป็น Base64
        reader.readAsDataURL(input.files[0]);
    }
}

// เรียกใช้งาน
displayProfile();
function logout() {
    // 1. ยืนยันกับผู้ใช้ก่อน (กันมือลั่น)
    if (confirm("Do you want to logout?")) {

        // 2. ลบสถานะการล็อกอินออก (แต่ข้อมูลที่สมัครไว้ยังอยู่)
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        // ถ้าคุณมีเก็บรูปโปรไฟล์ไว้ด้วย อย่าลืมลบ (ถ้าต้องการให้ Reset รูป)
        // localStorage.removeItem('saved_pic'); 

        // 3. ดีดกลับไปหน้า Login (ต้องระบุ path ไปที่โฟลเดอร์ menu)
        window.location.href = 'menu/login.html';
    }
}

function toggleChat() {
    const chatBox = document.getElementById('skibidi-chat-box');
    const toggleBtn = document.getElementById('chat-toggle-btn');

    if (chatBox.style.display === 'none') {
        // ถ้าซ่อนอยู่ -> ให้แสดงขึ้นมา
        chatBox.style.display = 'block';
        toggleBtn.innerHTML = '❌'; // เปลี่ยนปุ่มเป็นกากบาท

        // เลื่อนแชทลงไปล่างสุดทันทีที่เปิด
        const display = document.getElementById('chat-display');
        display.scrollTop = display.scrollHeight;
    } else {
        // ถ้าแสดงอยู่ -> ให้ซ่อนไป
        chatBox.style.display = 'none';
        toggleBtn.innerHTML = '💬'; // เปลี่ยนกลับเป็นรูปแชท
    }
}

// 1. วางฟังก์ชันนี้ไว้บนสุดของไฟล์ jv.js
function safeUpdate(id, content) {
    var element = document.getElementById(id);
    if (element) {
        element.innerHTML = content;
    }
}

// 2. ตรงบรรทัดที่ 10 (และบรรทัดอื่นๆ ที่ Error) 
// ให้เปลี่ยนจาก document.getElementById('...').innerHTML = ... 
// มาเป็นเรียกใช้ safeUpdate แทน แบบนี้:

safeUpdate('ชื่อไอดีที่เคย Error', 'ข้อมูลที่จะใส่');