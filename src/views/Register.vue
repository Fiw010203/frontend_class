<template>
  <div class="container">
    <div class="card">
      <h2>📝 สมัครสมาชิก</h2>

      <input
        v-model="username"
        placeholder="Username"
        class="input"
      />

      <input
        v-model="password"
        type="password"
        placeholder="Password"
        class="input"
      />

      <select v-model="role" class="input">
        <option value="student">🎓 นักศึกษา</option>
        <option value="teacher">👩‍🏫 อาจารย์</option>
      </select>

      <!-- ช่องกรอกเฉพาะนักศึกษา -->
      <input
        v-if="role === 'student'"
        v-model="fullname"
        placeholder="ชื่อ - นามสกุล"
        class="input"
      />

      <input
        v-if="role === 'student'"
        v-model="studentCode"
        placeholder="รหัสนักศึกษา"
        class="input"
      />

      <button class="primary-btn" @click="register">
        ✅ สมัครสมาชิก
      </button>

      <button class="secondary-btn" @click="goBack">
        ⬅ กลับหน้าเข้าสู่ระบบ
      </button>

      <p v-if="message" class="message">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import axios from "axios"
import { useRouter } from "vue-router"
import { API_BASE } from "../api.js"

const username = ref("")
const password = ref("")
const role = ref("student")
const fullname = ref("")
const studentCode = ref("")
const message = ref("")
const loading = ref(false)

const router = useRouter()

const register = async () => {
  message.value = ""

  /* ---------- frontend validate ---------- */
  if (!username.value || !password.value || !role.value) {
    message.value = "⚠️ กรุณากรอกข้อมูลให้ครบ"
    return
  }

  if (role.value === "student") {
    if (!fullname.value || !studentCode.value) {
      message.value = "⚠️ กรุณากรอกข้อมูลนักศึกษาให้ครบ"
      return
    }
  }

  /* ---------- payload ให้ตรง backend ---------- */
  const payload = {
    username: username.value.trim(),
    password: password.value,
    role: role.value
  }

  if (role.value === "student") {
    payload.fullname = fullname.value.trim()
    payload.student_code = studentCode.value.trim()
  }

  try {
    loading.value = true

    const res = await axios.post(
      `${API_BASE}/auth/register`,
      payload
    )

    message.value = res.data?.message || "✅ สมัครสมาชิกสำเร็จ"
    setTimeout(() => router.push("/"), 800)
  } catch (err) {
    console.error("REGISTER ERROR:", err.response?.data || err.message)
    message.value =
      "❌ สมัครไม่สำเร็จ: " +
      (err.response?.data?.message || "เกิดข้อผิดพลาด")
  } finally {
    loading.value = false
  }
}

const goBack = () => {
  router.push("/")
}
</script>


<style scoped>
/* ===== Layout ===== */
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f3f4f6;
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
  margin-bottom: 18px;
  color: #1f2937;
}

/* ===== Inputs ===== */
.input {
  width: 100%;
  padding: 12px;
  margin-top: 10px;
  border-radius: 10px;
  border: 1px solid #d1d5db;
  font-size: 14px;
}

.input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
}

/* ===== Buttons ===== */
button {
  width: 100%;
  padding: 12px;
  margin-top: 14px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: bold;
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
  background: #e5e7eb;
  color: #1f2937;
}
.secondary-btn:hover {
  background: #d1d5db;
}

/* ===== Message ===== */
.message {
  margin-top: 14px;
  font-size: 14px;
  color: #374151;
}
</style>
