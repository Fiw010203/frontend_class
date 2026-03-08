<template>
  <div class="container">
    <div class="card">
      <h2>🎓 นักศึกษา</h2>

      <p class="subtitle">
        กรุณากรอกรหัสเช็คชื่อจากอาจารย์
      </p>

      <input v-model="code" placeholder="กรอกรหัสเช็คชื่อ" class="code-input" />

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
import { ref } from "vue"
import { useRouter } from "vue-router"
import { API_BASE } from "../api.js"

const router = useRouter()
const code = ref("")
const message = ref("")

// ดึง user จาก localStorage
const user = JSON.parse(localStorage.getItem("user"))

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
/* ===== Layout ===== */
.container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(90deg, #5f6de8, #b94cc6);
  font-family: "Segoe UI", system-ui, sans-serif;
}

/* ===== Card ===== */
.card {
  width: 100%;
  max-width: 500px;
  background: #ffffff;
  padding: 28px;
  border-radius: 18px;
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.1);
  text-align: center;
}

h2 {
  margin-bottom: 6px;
  color: #1f2937;
}

.subtitle {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 18px;
}

/* ===== Input ===== */
.code-input {
  width: 100%;
  padding: 12px;
  margin-top: 14px;
  border-radius: 25px;
  border: none;
  font-size: 14px;
  box-sizing: border-box;
  background: #e5e7eb;

}

.code-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
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

.checkin-btn {
  background: linear-gradient(90deg, #b94cc6, #1de0c9);
  color: #ffffff;
}

.checkin-btn:hover {
  background: linear-gradient(90deg, #973fa1, #16ab99);
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
  margin-top: 12px;
  font-size: 14px;
  color: #374151;
}
</style>
