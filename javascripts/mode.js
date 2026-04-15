// ==========================================
// 🔥 FIREBASE SETUP (ใส่ไว้บนสุดของไฟล์)
// ==========================================
const firebaseConfig = {
    apiKey: "AIzaSyBQh8jcYyAUtWZEA2bPljQktXmzg4D1DXQ",
    authDomain: "rewza-b263c.firebaseapp.com",
    databaseURL: "https://rewza-b263c-default-rtdb.firebaseio.com",
    projectId: "rewza-b263c",
    storageBucket: "rewza-b263c.firebasestorage.app",
    messagingSenderId: "75864064195",
    appId: "1:75864064195:web:f5bb8cd7b8cf64acede276",
    measurementId: "G-KY9Y4QQVMJ"
};

// ตรวจสอบและเริ่มการทำงาน
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// ประกาศตัวแปร db ให้เป็น Global (ใช้ var เพื่อให้ไฟล์ jv.js เรียกใช้ได้ด้วย)
var db = firebase.database();
window.db = db; 

// ==========================================
// 💬 ระบบ CHAT REAL-TIME
// ==========================================

// ฟังก์ชันส่งข้อความ
function sendToCloud() {
    const input = document.getElementById('chat-message');
    if (!input) return;

    const msg = input.value.trim();
    const user = localStorage.getItem('currentUser') || 'User';
    const myPic = localStorage.getItem('saved_pic') || "https://www.animationmagazine.net/wordpress/wp-content/uploads/Skibidi-Toilet.jpg";

    if (msg !== "") {
        db.ref('global_chat').push({
            username: user,
            message: msg,
            profilePic: myPic, 
            timestamp: Date.now()
        });
        input.value = ''; 
    }
}

// ดักจับปุ่ม Enter
window.handleKeyPress = function(e) {
    if (e.key === 'Enter') sendToCloud();
};

// แสดงผลข้อความ Real-time
db.ref('global_chat').limitToLast(50).on('value', (snapshot) => {
    const display = document.getElementById('chat-display');
    if(!display) return;
    
    let chatHTML = ''; 
    const data = snapshot.val();
    
    for (let id in data) {
        const item = data[id];
        const isMe = item.username === localStorage.getItem('currentUser');
        const userImg = item.profilePic || "https://www.animationmagazine.net/wordpress/wp-content/uploads/Skibidi-Toilet.jpg";
        
        chatHTML += `
            <div style="display: flex; flex-direction: ${isMe ? 'row-reverse' : 'row'}; align-items: flex-end; gap: 8px; margin-bottom: 12px;">
                <img src="${userImg}" style="width: 35px; height: 35px; border-radius: 50%; object-fit: cover; border: 2px solid #4466ff;">
                <div style="background: ${isMe ? '#4466ff' : '#333'}; color: white; padding: 10px 14px; border-radius: 15px; max-width: 75%;">
                    <small style="display: block; font-size: 10px; opacity: 0.7; margin-bottom: 3px;">${item.username}</small>
                    <span style="word-break: break-word;">${item.message}</span>
                </div>
            </div>
        `;
    }
    display.innerHTML = chatHTML;
    display.scrollTop = display.scrollHeight;
});