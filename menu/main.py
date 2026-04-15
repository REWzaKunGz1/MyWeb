import asyncio
import random
from pyscript import document, window
from pyodide.ffi import create_proxy

# --- ส่วนดึงรูปภาพจาก HTML (ต้องมี <img id="shipImage" ...> ใน HTML) ---
ship_img = document.getElementById("shipImage")

# ==========================================
# 🐍 1. SNAKE GAME (เกมงูฉบับสมบูรณ์)
# ==========================================
canvas_snk = document.getElementById("snakeCanvas")
ctx_snk = canvas_snk.getContext("2d") if canvas_snk else None
TILE_SIZE = 20
GRID_COUNT = 20

snake = [{"x": 10, "y": 10}]
food = {"x": 15, "y": 15}
dir_snk = {"x": 1, "y": 0}
new_dir_snk = {"x": 1, "y": 0}
score_snk = 0
running_snk = False

async def snake_loop():
    global snake, food, dir_snk, new_dir_snk, score_snk, running_snk
    while running_snk:
        dir_snk = new_dir_snk
        head = snake[0]
        nx, ny = (head["x"] + dir_snk["x"]) % GRID_COUNT, (head["y"] + dir_snk["y"]) % GRID_COUNT
        new_head = {"x": nx, "y": ny}

        if any(s["x"] == nx and s["y"] == ny for s in snake):
            running_snk = False
            window.alert(f"Snake Over! Score: {score_snk}")
            break

        snake.insert(0, new_head)
        if nx == food["x"] and ny == food["y"]:
            score_snk += 10
            document.getElementById("score-board").innerText = f"Score: {score_snk}"
            food = {"x": random.randint(0, 19), "y": random.randint(0, 19)}
        else: snake.pop()

        ctx_snk.fillStyle = "black"
        ctx_snk.fillRect(0, 0, 400, 400)
        ctx_snk.strokeStyle = "#1e293b"
        for i in range(GRID_COUNT + 1):
            ctx_snk.beginPath()
            ctx_snk.moveTo(i*20, 0); ctx_snk.lineTo(i*20, 400); ctx_snk.stroke()
            ctx_snk.beginPath()
            ctx_snk.moveTo(0, i*20); ctx_snk.lineTo(400, i*20); ctx_snk.stroke()

        ctx_snk.fillStyle = "#f87171"; ctx_snk.fillRect(food["x"]*20+1, food["y"]*20+1, 18, 18)
        ctx_snk.fillStyle = "#4ade80"
        for s in snake: ctx_snk.fillRect(s["x"]*20+1, s["y"]*20+1, 18, 18)
        await asyncio.sleep(0.12)

# --- ดึงรูปจาก HTML ---
ship_img = document.getElementById("shipImage")
enemy_img = document.getElementById("enemyImage")

# ==========================================
# 🚀 SPACE SHOOTER (Super Chill Mode)
# ==========================================
canvas_spc = document.getElementById("spaceCanvas")
ctx_spc = canvas_spc.getContext("2d") if canvas_spc else None

# --- ตัวแปรสำหรับจัดการความยาก (เพิ่ม/วางทับ ของเดิม) ---
stars = [{"x": random.randint(0, 400), "y": random.randint(0, 500), "s": random.random() * 2} for _ in range(30)]
player = {"x": 180, "y": 440, "w": 40, "h": 40} 
bullets, enemies = [], []
score_spc, running_spc, is_shooting, shoot_delay = 0, False, False, 0
move_dir_spc = 0

# เพิ่ม 3 บรรทัดนี้
spawn_chance = 0.01   
max_spawn_chance = 0.05 
difficulty_level = 1

async def space_loop():
    global score_spc, running_spc, bullets, enemies, shoot_delay, spawn_chance, difficulty_level
    
    while running_spc:
        # 1. คำนวณความยาก
        difficulty_level = 1 + (score_spc // 100)
        current_spawn_chance = min(max_spawn_chance, 0.01 + (difficulty_level * 0.005))

        # พื้นหลังดาว
# --- 1. พื้นหลังดาว (ความเร็วแปรผันตามเลเวล) ---
        # ดาวจะวิ่งเร็วขึ้นเรื่อยๆ: เลเวล 1 วิ่งเร็ว 1.5 | เลเวล 10 วิ่งเร็ว 6.0
        star_speed_base = 1 + (difficulty_level * 0.5)
        
        for s in stars:
            # ใช้ s["s"] (ขนาดดาว) มาคูณเพื่อให้ดาวดวงใหญ่ดูวิ่งเร็วกว่าดวงเล็ก (Parallax Effect)
            s["y"] += star_speed_base * s["s"]
            
            # ถ้าหลุดขอบล่าง ให้ไปเกิดใหม่ด้านบน
            if s["y"] > 500: 
                s["y"] = 0
                s["x"] = random.randint(0, 400)

        # --- 2. ขยับยาน (คงเดิม) ---
        player["x"] = max(0, min(360, player["x"] + move_dir_spc * 7))
        
# --- ระบบยิงรัวอัตโนมัติ ---
        if is_shooting:
            if shoot_delay <= 0:
                # 1. สร้างกระสุน
                bullets.append({"x": player["x"] + player["w"]//2 - 2, "y": player["y"]})
                
                # 2. 🔊 สั่งเล่นเสียงยิง
                sound = document.getElementById("shootSound")
                if sound:
                    sound.currentTime = 0  # รีเซ็ตเสียงไปที่จุดเริ่มต้น (เพื่อให้กดยิงรัวๆ แล้วเสียงออกทุกนัด)
                    sound.play()
                
                shoot_delay = 7 # หน่วงเวลาการยิง
            else: 
                shoot_delay -= 1
                
        for b in bullets[:]:
            b["y"] -= 12
            if b["y"] < 0: bullets.remove(b)

# สุ่มเกิดศัตรูตัวใหญ่
        if random.random() < current_spawn_chance: 
            # คำนวณความเร็ว: เริ่มต้น 1 + (เลเวล * 0.3) 
            # เลเวล 1 = เร็ว 1.3 | เลเวล 5 = เร็ว 2.5
            big_speed = 1 + (difficulty_level * 0.3) 
            
            enemies.append({
                "x": random.randint(20, 340), 
                "y": -60, 
                "w": 55, 
                "h": 55, 
                "hp": random.randint(2, 5) + difficulty_level, 
                "type": "big", 
                "speed": big_speed  # ✅ ใช้ความเร็วที่คำนวณตามเลเวล
            })

# --- ตรวจสอบศัตรู (ขยับ, ลบตัวที่หลุดจอ, และเช็คชนผู้เล่น) ---
        for e in enemies[:]:
            e["y"] += e["speed"]
            
            # 1. ถ้าหลุดขอบล่างให้ลบทิ้ง (ไม่แพ้ตามที่คุณต้องการ)
            if e["y"] > 500:
                if e in enemies: enemies.remove(e)
                continue

            # 2. 🎯 เช็คการชนยานผู้เล่น (สำคัญมาก!)
            # หด Hitbox ตามขนาด: ก้อนใหญ่หด 15, ก้อนเล็กหดแค่ 5
            p = 15 if e["type"] == "big" else 5
            
            # สร้าง Hitbox ของศัตรูตัวนี้
            e_hit_x = e["x"] + p
            e_hit_y = e["y"] + p
            e_hit_w = e["w"] - (p * 2)
            e_hit_h = e["h"] - (p * 2)

            # สร้าง Hitbox ของยานเรา (หดเข้า 10)
            p_hit_x = player["x"] + 10
            p_hit_y = player["y"] + 10
            p_hit_w = player["w"] - 20
            p_hit_h = player["h"] - 20

            # ตรวจสอบการชน (AABB)
            if (e_hit_x < p_hit_x + p_hit_w and 
                e_hit_x + e_hit_w > p_hit_x and 
                e_hit_y < p_hit_y + p_hit_h and 
                e_hit_y + e_hit_h > p_hit_y):
                
                running_spc = False # จบเกมทันที
                window.alert(f"พินาศ! 💥 ชนศัตรูเข้าอย่างจัง\nScore: {score_spc}")
                break
            
        if not running_spc: break

# --- ระบบตรวจจับการชน (Collision) ---
        for b in bullets[:]:
            bullet_hit = False  # เช็คว่ากระสุนนัดนี้ชนไปหรือยัง
            
            for e in enemies[:]:
                # 🎯 ปรับ Hitbox ให้เล็กลง (หดเข้าจากขอบรูปภาพ)
                # สำหรับศัตรูตัวใหญ่ (w=55) หดเข้าด้านละ 12 จะเหลือพื้นที่จริงประมาณ 31
                padding = 12 if e["type"] == "big" else 5
                
                e_hit_x = e['x'] + padding
                e_hit_y = e['y'] + padding
                e_hit_w = e['w'] - (padding * 2)
                e_hit_h = e['h'] - (padding * 2)

                # ตรวจสอบการชน (AABB Collision)
                if (b['x'] < e_hit_x + e_hit_w and 
                    b['x'] + 5 > e_hit_x and 
                    b['y'] < e_hit_y + e_hit_h and 
                    b['y'] + 10 > e_hit_y):
                    
                    # 1. ลดเลือดศัตรู
                    e["hp"] -= 1
                    bullet_hit = True # มาร์คว่าชนแล้ว
                    
                    if e["hp"] <= 0:
                        if e["type"] == "big":
                            score_spc += 20
                            # ✅ ตัวเล็กจะวิ่งเร็วกว่าตัวใหญ่เสมอ และเร็วขึ้นตามเลเวล
                            # เลเวล 1 = เร็ว 3.2 | เลเวล 5 = เร็ว 4.0
                            mini_speed = 3 + (difficulty_level * 0.2)
                            
                            enemies.append({"x": e["x"], "y": e["y"], "w": 25, "h": 25, "hp": 1, "type": "mini", "speed": mini_speed})
                            enemies.append({"x": e["x"]+30, "y": e["y"], "w": 25, "h": 25, "hp": 1, "type": "mini", "speed": mini_speed})
                        else: 
                            score_spc += 5
                        
                        if e in enemies: enemies.remove(e)
                        
                        # อัปเดตคะแนนบนหน้าจอ
                        document.getElementById("space-score").innerText = f"Level: {difficulty_level} | Score: {score_spc}"
                    
                    break # ออกจาก Loop ศัตรู (เพราะกระสุนนัดนี้ใช้ไปแล้ว)

            # 3. ลบกระสุนนัดที่ชนแล้วออกจากจอ
            if bullet_hit and b in bullets:
                bullets.remove(b)
                
        # วาดภาพ (Render)
        # 1. วาดพื้นหลังสีเข้ม
        ctx_spc.fillStyle = "#020617"
        ctx_spc.fillRect(0, 0, 400, 500)
        
        # 2. วาดดาวระยิบระยับ
        ctx_spc.fillStyle = "white"
        for s in stars: 
            ctx_spc.beginPath()
            ctx_spc.arc(s["x"], s["y"], s["s"], 0, 6.28)
            ctx_spc.fill()
        
        # 3. วาดผู้เล่น (ยานเรา)
        if ship_img.complete: 
            ctx_spc.drawImage(ship_img, player["x"], player["y"], player["w"], player["h"])
            
        # 4. วาดศัตรู (เอาส่วน if e["type"] == "big" ที่วาดแถบเลือดออกไปแล้ว)
        if enemy_img.complete:
            for e in enemies:
                ctx_spc.drawImage(enemy_img, e["x"], e["y"], e["w"], e["h"])
                # ✅ แถบเลือดถูกลบออกเรียบร้อย หน้าจอจะสะอาดขึ้น

        # 5. วาดกระสุน
        ctx_spc.fillStyle = "#fbbf24"
        for b in bullets: 
            ctx_spc.fillRect(b["x"], b["y"], 5, 10)
        await asyncio.sleep(0.02)

# --- ระบบควบคุม (อัปเดตให้คุมได้ทั้ง 2 เกม) ---
def handle_keys(event):
    global move_dir_spc, is_shooting, new_dir_snk
    key = event.code
    
    if event.type == "keydown":
        # --- สำหรับเกมยิงยาน (Space Shooter) ---
        if key == "ArrowLeft": move_dir_spc = -1
        elif key == "ArrowRight": move_dir_spc = 1
        elif key == "Space": is_shooting = True
        
        # --- สำหรับเกมงู (Snake Game) ---
        # ป้องกันไม่ให้งูเลี้ยวกลับตัว 180 องศา (ชนตัวเอง)
        if (key == "ArrowUp" or key == "KeyW") and dir_snk["y"] == 0:
            new_dir_snk = {"x": 0, "y": -1}
        elif (key == "ArrowDown" or key == "KeyS") and dir_snk["y"] == 0:
            new_dir_snk = {"x": 0, "y": 1}
        elif (key == "ArrowLeft" or key == "KeyA") and dir_snk["x"] == 0:
            new_dir_snk = {"x": -1, "y": 0}
        elif (key == "ArrowRight" or key == "KeyD") and dir_snk["x"] == 0:
            new_dir_snk = {"x": 1, "y": 0}

        # ป้องกันหน้าจอเลื่อนเวลาเล่นเกม
        if key in ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "KeyW", "KeyS", "KeyA", "KeyD"]:
            event.preventDefault()

    elif event.type == "keyup":
        if key in ["ArrowLeft", "ArrowRight"]: move_dir_spc = 0
        elif key == "Space": is_shooting = False
        
# --- ฟังก์ชันจัดการทิศทางงู (ป้องกันการเลี้ยวกลับลำ 180 องศา) ---
def set_snk_dir(x, y):
    global new_dir_snk, dir_snk
    # ถ้ากำลังไปแนวนอน ห้ามเลี้ยวแนวนอน (ต้องเลี้ยวขึ้น/ลงเท่านั้น)
    # ถ้ากำลังไปแนวตั้ง ห้ามเลี้ยวแนวตั้ง (ต้องเลี้ยวซ้าย/ขวาเท่านั้น)
    if (x != 0 and dir_snk["y"] != 0) or (y != 0 and dir_snk["x"] != 0):
        new_dir_snk = {"x": x, "y": y}

# --- ฟังก์ชันจัดการยาน (Space Shooter) ---
def set_spc_move(val):
    global move_dir_spc
    move_dir_spc = val

def set_spc_shoot(state):
    global is_shooting
    is_shooting = state

# --- ผูกเหตุการณ์กับปุ่มบนหน้าจอ (Mobile & Click) ---
def setup_mobile_events():
    # ปุ่มควบคุมเกมงู
    btn_up = document.getElementById("btn-up")
    btn_down = document.getElementById("btn-down")
    btn_left = document.getElementById("btn-left")
    btn_right = document.getElementById("btn-right")

    if btn_up: btn_up.onclick = lambda e: set_snk_dir(0, -1)
    if btn_down: btn_down.onclick = lambda e: set_snk_dir(0, 1)
    if btn_left: btn_left.onclick = lambda e: set_snk_dir(-1, 0)
    if btn_right: btn_right.onclick = lambda e: set_snk_dir(1, 0)

    # ปุ่มควบคุมเกมยาน (ดักจับกดค้างและปล่อย)
    m_l = document.getElementById("m-left")
    m_r = document.getElementById("m-right")
    m_f = document.getElementById("m-fire")

    if m_l and m_r and m_f:
        # ปุ่มซ้าย
        m_l.onmousedown = m_l.ontouchstart = lambda e: (e.preventDefault(), set_spc_move(-1))
        m_l.onmouseup = m_l.ontouchend = lambda e: set_spc_move(0)
        # ปุ่มขวา
        m_r.onmousedown = m_r.ontouchstart = lambda e: (e.preventDefault(), set_spc_move(1))
        m_r.onmouseup = m_r.ontouchend = lambda e: set_spc_move(0)
        # ปุ่มยิง
        m_f.onmousedown = m_f.ontouchstart = lambda e: (e.preventDefault(), set_spc_shoot(True))
        m_f.onmouseup = m_f.ontouchend = lambda e: set_spc_shoot(False)

# เรียกใช้ฟังก์ชันเซตอัพ
setup_mobile_events()

def start_space(e):
    global player, bullets, enemies, score_spc, running_spc
    player["x"] = 180; bullets.clear(); enemies.clear(); score_spc = 0
    document.getElementById("space-score").innerText = "Score: 0"
    if not running_spc:
        running_spc = True
        asyncio.ensure_future(space_loop())

def start_snake(e):
    global snake, score_snk, running_snk, dir_snk, new_dir_snk
    snake = [{"x": 10, "y": 10}]; score_snk = 0; dir_snk = {"x": 1, "y": 0}; new_dir_snk = {"x": 1, "y": 0}
    document.getElementById("score-board").innerText = "Score: 0"
    if not running_snk: running_snk = True; asyncio.ensure_future(snake_loop())

proxy = create_proxy(handle_keys)
window.addEventListener("keydown", proxy)
window.addEventListener("keyup", proxy)
document.getElementById("start-btn").onclick = start_snake
document.getElementById("start-space-btn").onclick = start_space
