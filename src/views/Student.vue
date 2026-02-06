<template>
  <div class="container">
    <div class="card">
      <!-- Student Info -->
      <div class="student-info">
        <div class="avatar">🎓</div>
        <p class="student-name">{{ studentName }}</p>
        <p class="student-role">นักศึกษา</p>
      </div>

      <h2>เช็คชื่อเข้าเรียน</h2>

      <p class="subtitle">
        กรุณากรอกรหัสเช็คชื่อจากอาจารย์
      </p>

      <input
        v-model="code"
        placeholder="กรอกรหัสเช็คชื่อ"
        class="code-input"
      />

      <button class="checkin-btn" @click="checkin">
        ✅ เช็คชื่อ
      </button>

      <p v-if="message" class="message">
        {{ message }}
      </p>

      <button class="logout-btn" @click="logout">
        🚪 ออกจากระบบ
      </button>
    </div>
  </div>
</template>


<script setup>
import { ref, computed } from "vue"
import { useRouter } from "vue-router"
import { API_BASE } from "../api.js"

const router = useRouter()
const code = ref("")
const message = ref("")

const user = JSON.parse(localStorage.getItem("user"))

// ✅ ใช้ computed (ปลอดภัยกว่า)
const studentName = computed(() => {
  if (!user) return "ไม่ทราบชื่อ"
  return user.fullname || user.username || "ไม่ทราบชื่อ"
})

const checkin = async () => {
  message.value = ""

  try {
    if (!user || user.role !== "student") {
      message.value = "❌ กรุณาเข้าสู่ระบบนักศึกษา"
      return
    }

    if (!code.value.trim()) {
      message.value = "⚠️ กรุณากรอกรหัสเช็คชื่อ"
      return
    }

    const res = await fetch(`${API_BASE}/attendance/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: user.student_id,
        code: code.value.trim()
      })
    })

    const data = await res.json()

    if (!res.ok) {
      message.value = data.message || "❌ เช็คชื่อไม่สำเร็จ"
      return
    }

    message.value = data.message || "✅ เช็คชื่อสำเร็จ"
    code.value = ""
  } catch (err) {
    console.error("CHECKIN ERROR:", err)
    message.value = "❌ เกิดข้อผิดพลาดในการเชื่อมต่อ"
  }
}

const logout = () => {
  localStorage.removeItem("user")
  router.push("/")
}
</script>



<style scoped>
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e0f2fe, #f8fafc);
  font-family: "Segoe UI", system-ui, sans-serif;
}

.card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  padding: 30px;
  border-radius: 20px;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.12);
  text-align: center;
}

/* ===== Student Info ===== */
.student-info {
  margin-bottom: 18px;
}

.avatar {
  width: 64px;
  height: 64px;
  margin: 0 auto 6px;
  border-radius: 50%;
  background: #2563eb;
  color: #fff;
  font-size: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.student-name {
  font-size: 16px;
  font-weight: bold;
  color: #1f2937;
}

.student-role {
  font-size: 13px;
  color: #6b7280;
}

/* ===== Text ===== */
h2 {
  margin: 10px 0 6px;
  color: #1e293b;
}

.subtitle {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 18px;
}

/* ===== Input ===== */
.code-input {
  width: 100%;
  padding: 14px;
  font-size: 18px;
  text-align: center;
  border-radius: 12px;
  border: 1px solid #cbd5e1;
  letter-spacing: 3px;
}

.code-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25);
}

/* ===== Buttons ===== */
button {
  width: 100%;
  padding: 12px;
  margin-top: 14px;
  font-size: 15px;
  font-weight: bold;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.checkin-btn {
  background: #22c55e;
  color: #ffffff;
}

.checkin-btn:hover {
  background: #16a34a;
}

.logout-btn {
  background: #ef4444;
  color: #ffffff;
}

.logout-btn:hover {
  background: #dc2626;
}

/* ===== Message ===== */
.message {
  margin-top: 14px;
  font-size: 14px;
  color: #1f2937;
}
</style>
