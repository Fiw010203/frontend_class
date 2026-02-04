<template>
  <div class="container">
    <h2>👩‍🏫 หน้าสำหรับอาจารย์</h2>

    <!-- Card : Generate Code -->
    <section class="card">
      <h3>🔑 สร้างรหัสเช็คชื่อ</h3>

      <button class="primary-btn" @click="generateCode">
        ➕ สร้างรหัส
      </button>

      <p v-if="code" class="code-box">
        รหัสเช็คชื่อ: <span>{{ code }}</span>
      </p>

      <p v-if="message" class="message">{{ message }}</p>
    </section>

    <!-- Card : Manage Data -->
    <section class="card">
      <h3>📊 จัดการข้อมูล</h3>

      <button class="secondary-btn" @click="goToAttendance">
        📋 ดูตารางรายชื่อนักเรียน
      </button>
    </section>

    <!-- Logout -->
    <button class="logout-btn" @click="logout">
      🚪 ออกจากระบบ
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { API_BASE } from "../api.js"

const router = useRouter()
const code = ref("")
const message = ref("")

const generateCode = async () => {
  message.value = ""
  code.value = ""

  try {
    const user = JSON.parse(localStorage.getItem("user"))

    if (!user || user.role !== "teacher") {
      message.value = "❌ กรุณาเข้าสู่ระบบอาจารย์"
      return
    }

    const res = await fetch(`${API_BASE}/attendance/generate-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        teacherId: user.id
      })
    })

    const data = await res.json()

    if (!res.ok || !data.success) {
      message.value = data.message || "❌ สร้างรหัสไม่สำเร็จ"
      return
    }

    code.value = data.code
    message.value = "✅ สร้างรหัสเช็คชื่อเรียบร้อย"
  } catch (err) {
    console.error("GENERATE CODE ERROR:", err)
    message.value = "❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้"
  }
}

const goToAttendance = () => {
  router.push("/attendance")
}

const logout = () => {
  localStorage.removeItem("user")
  router.push("/")
}
</script>

<style scoped>
/* ===== Layout ===== */
.container {
  max-width: 900px;
  margin: 40px auto;
  padding: 24px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.08);
  font-family: "Segoe UI", system-ui, sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #1f2937;
}

/* ===== Card ===== */
.card {
  background: #f9fafb;
  border-radius: 14px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: inset 0 0 0 1px #e5e7eb;
}

.card h3 {
  margin-bottom: 15px;
  color: #111827;
}

/* ===== Buttons ===== */
button {
  width: 100%;
  padding: 10px;
  font-size: 15px;
  font-weight: bold;
  border-radius: 10px;
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
