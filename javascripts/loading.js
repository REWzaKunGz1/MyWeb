window.addEventListener('load', function() {
    const loader = document.getElementById('preloader');
    
    if (loader) {
        // --- ส่วนที่ปรับใหม่ ---
        // 2000 คือ 2 วินาที (ถ้าอยากให้นานกว่านี้ เช่น 3 วินาที ให้เปลี่ยนเป็น 3000)
        setTimeout(() => {
            // สั่งให้ค่อยๆ จางหาย (Fade Out)
            loader.style.opacity = '0';
            loader.style.visibility = 'hidden';
            
            // หลังจากจางหายไปแล้ว 0.5 วินาที ให้สั่ง display: none เพื่อให้กดปุ่มข้างหลังได้
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
            
            console.log("Loader จบการทำงานแล้ว!");
        }, 2000); 
    }
});