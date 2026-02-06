<template>
  <div class="container">
    <!-- ===== Header ===== -->
    <div class="header">
      <h2>👩‍🏫 หน้าสำหรับอาจารย์</h2>
      <p class="teacher-name">
        👨‍🏫 อาจารย์ผู้สอน: <strong>{{ teacherName }}</strong>
      </p>
    </div>

    <!-- ===== Generate Code ===== -->
    <section class="card">
      <h3>🔑 สร้างรหัสเช็คชื่อ</h3>

      <button class="primary-btn" @click="generateCode">
        ➕ สร้างรหัสเช็คชื่อ
      </button>

      <div v-if="code" class="code-box">
        <p>รหัสเช็คชื่อ</p>
        <span>{{ code }}</span>
      </div>

      <p v-if="timeLeft > 0" class="timer">
        ⏳ เหลือเวลา
        {{ Math.floor(timeLeft / 60) }}:
        {{ String(timeLeft % 60).padStart(2, "0") }} นาที
      </p>

      <p v-if="message" class="message">{{ message }}</p>
    </section>

    <!-- ===== Manage ===== -->
    <section class="card">
      <h3>📊 จัดการข้อมูล</h3>
      <button class="secondary-btn" @click="goToAttendance">
        📋 ดูตารางรายชื่อนักเรียน
      </button>
    </section>

    <!-- ===== Logout ===== -->
    <button class="logout-btn" @click="logout">
      🚪 ออกจากระบบ
    </button>
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
const teacherName = ref("")

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

    if (!res.ok && data.active) {
      code.value = data.code
      startCountdown(data.expiresAt)
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
onMounted(() => {
  const user = JSON.parse(localStorage.getItem("user"))
  if (user?.role === "teacher") {
    teacherName.value = user.fullname || user.username
  }
  loadActiveCode()
})

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
  max-width: 900px;
  margin: 40px auto;
  padding: 28px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  font-family: "Segoe UI", system-ui, sans-serif;
}

/* ===== Header ===== */
.header {
  text-align: center;
  margin-bottom: 32px;
}

.header h2 {
  margin-bottom: 6px;
  color: #1f2937;
}

.teacher-name {
  color: #4b5563;
  font-size: 15px;
}

/* ===== Card ===== */
.card {
  background: #f9fafb;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 22px;
  box-shadow: inset 0 0 0 1px #e5e7eb;
}

.card h3 {
  margin-bottom: 14px;
  color: #111827;
}

/* ===== Buttons ===== */
button {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  font-weight: bold;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
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
}
.logout-btn:hover {
  background: #dc2626;
}

/* ===== Code ===== */
.code-box {
  margin-top: 16px;
  padding: 16px;
  background: #eef2ff;
  border-radius: 12px;
  text-align: center;
}

.code-box span {
  display: block;
  font-size: 28px;
  font-weight: bold;
  color: #1d4ed8;
  letter-spacing: 3px;
}

/* ===== Timer & Message ===== */
.timer {
  margin-top: 10px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #ff6b00;
}

.message {
  margin-top: 10px;
  text-align: center;
  font-size: 14px;
  color: #374151;
}

/* ===== Responsive ===== */
/* ===== Responsive ===== */
@media (max-width: 768px) {
  .container {
    padding: 20px;
  }
}
</style>
