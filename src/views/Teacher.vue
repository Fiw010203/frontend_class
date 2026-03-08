<template>
  <div class="container">
    <div class="card">
      <h2>👩‍🏫 หน้าสำหรับอาจารย์</h2>

      <section class="section-card">
        <h3>🔑 สร้างรหัสเช็คชื่อ</h3>

        <button class="primary-btn" @click="generateCode">
          ➕ สร้างรหัส
        </button>

        <p v-if="code" class="code-box">
          รหัสเช็คชื่อ: <span>{{ code }}</span>
        </p>

        <p v-if="timeLeft > 0" class="timer">
          ⏳ เหลือเวลา
          {{ Math.floor(timeLeft / 60) }}:
          {{ String(timeLeft % 60).padStart(2, "0") }} นาที
        </p>

        <p v-if="message" class="message">{{ message }}</p>
      </section>

      <section class="section-card">
        <h3>📊 จัดการข้อมูล</h3>
        <button class="secondary-btn" @click="goToAttendance">
          📋 ดูตารางรายชื่อนักเรียน
        </button>
      </section>

      <section class="section-card1">
      <button class="logout-btn" @click="logout">
        🚪 ออกจากระบบ
      </button>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import { useRouter } from "vue-router"
import { API_BASE } from "../api.js"

const router = useRouter()

const code = ref("")
const message = ref("")
const timeLeft = ref(0)
let timer = null

/* ================= COUNTDOWN ================= */
const startCountdown = (expiresAt) => {
  clearInterval(timer)

  const expireMs = new Date(expiresAt).getTime()

  const update = () => {
    const diff = Math.floor((expireMs - Date.now()) / 1000)
    timeLeft.value = diff > 0 ? diff : 0

    if (diff <= 0) {
      clearInterval(timer)
      code.value = ""
      message.value = "⏰ รหัสหมดอายุแล้ว"
    }
  }

  update()
  timer = setInterval(update, 1000)
}

/* ================= LOAD ACTIVE CODE ================= */
const loadActiveCode = async () => {
  const user = JSON.parse(localStorage.getItem("user"))
  if (!user) return

  const res = await fetch(
    `${API_BASE}/attendance/active-code/${user.id}`
  )
  const data = await res.json()

  if (data.active) {
    code.value = data.code
    message.value = "ℹ️ ใช้รหัสที่ยังไม่หมดอายุ"
    startCountdown(data.expiresAt)
  }
}

/* ================= GENERATE CODE ================= */
const generateCode = async () => {
  message.value = ""
  code.value = ""

  try {
    const user = JSON.parse(localStorage.getItem("user"))
    if (!user || user.role !== "teacher") {
      message.value = "❌ กรุณาเข้าสู่ระบบอาจารย์"
      return
    }

    const res = await fetch(
      `${API_BASE}/attendance/generate-code`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ teacherId: user.id })
      }
    )

    const data = await res.json()

    // ✅ กรณียังมีรหัสอยู่ (409)
    if (res.status === 409 && data.active) {
      code.value = data.code
      message.value = "ℹ️ ยังมีรหัสที่ใช้งานอยู่"
      startCountdown(data.expiresAt)
      return
    }

    if (!res.ok) {
      message.value = data.message || "❌ สร้างรหัสไม่สำเร็จ"
      return
    }

    code.value = data.code
    message.value = "✅ สร้างรหัสเช็คชื่อเรียบร้อย"
    startCountdown(data.expiresAt)

  } catch (err) {
    console.error(err)
    message.value = "❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้"
  }
}

/* ================= LIFECYCLE ================= */
onMounted(loadActiveCode)
onUnmounted(() => clearInterval(timer))

/* ================= NAV ================= */
const goToAttendance = () => {
  router.push("/attendance")
}

const logout = () => {
  localStorage.clear()
  router.push("/")
}
</script>


<style scoped>
/* ===== Layout ===== */
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #5f6de8, #b94cc6);
  font-family: "Segoe UI", system-ui, sans-serif;
}

.card {
  width: 100%;
  max-width: 500px;
  background: #ffffff;
  padding: 28px;
  border-radius: 18px;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.section-card {
  background: #f9fafb;
  padding: 20px;
  border-radius: 14px;
  margin-bottom: 20px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.05);
}

.section-card1 {
  background: #ffffff;
  padding: 20px;
  border-radius: 14px;
  margin-bottom: 20px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #1f2937;
}

/* ===== Card ===== */

.card h3 {
  margin-bottom: 15px;
  color: #111827;
}

/* ===== Buttons ===== */
button {
  width: 100%;
  padding: 12px;
  margin-top: 14px;
  border-radius: 25px;
  border: none;
  font-size: 14px;
  box-sizing: border-box;
  background: #e5e7eb;
}

.timer {
  margin-top: 8px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #ff6b00;
}

.message {
  margin-top: 8px;
}

.primary-btn,
.secondary-btn,
.logout-btn {
  width: 100%;
  padding: 10px;
  margin-top: 8px;
}

.code-box {
  font-size: 20px;
  font-weight: bold;
  margin-top: 10px;
}


.primary-btn {
  background: #2563eb;
  color: #ffffff;
}

.primary-btn:hover {
  background: #1d4ed8;
}

.secondary-btn {
  background: #10b981;
  color: #ffffff;
}

.secondary-btn:hover {
  background: #059669;
}

.logout-btn {
  background: #ef4444;
  color: #ffffff;
  margin-top: 10px;
}

.logout-btn:hover {
  background: #dc2626;
}

/* ===== Code Display ===== */
.code-box {
  margin-top: 15px;
  padding: 12px;
  background: #eef2ff;
  border-radius: 10px;
  font-size: 16px;
  text-align: center;
}

.code-box span {
  font-weight: bold;
  color: #1d4ed8;
  letter-spacing: 2px;
}

/* ===== Message ===== */
.message {
  margin-top: 10px;
  font-size: 14px;
  color: #374151;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .container {
    padding: 18px;
  }

  button {
    font-size: 14px;
  }
}
</style>
