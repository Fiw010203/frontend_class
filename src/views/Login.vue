<template>
  <div class="container">
    <div class="card">
      <h2>🔐 เข้าสู่ระบบ</h2>

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

      <button class="primary-btn" @click="login">
        🚀 Login
      </button>

      <button class="secondary-btn" @click="goRegister">
        📝 สมัครสมาชิก
      </button>

      <p v-if="message" class="message">
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { API_BASE } from "../api.js"

const router = useRouter()

const username = ref("")
const password = ref("")
const message = ref("")

const login = async () => {
  message.value = ""

  try {
    if (!username.value || !password.value) {
      message.value = "⚠️ กรุณากรอก Username และ Password"
      return
    }

    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    const data = await res.json()

    if (!data.success) {
      message.value = data.message || "❌ Username หรือ Password ไม่ถูกต้อง"
      return
    }

    localStorage.setItem("user", JSON.stringify(data.user))

    if (data.user.role === "teacher") {
      router.push("/teacher")
    } else {
      router.push("/student")
    }
  } catch (err) {
    console.error("LOGIN ERROR:", err)
    message.value = "❌ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้"
  }
}

const goRegister = () => {
  router.push("/register")
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
  padding: 30px;
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
  background: #10b981;
  color: #ffffff;
}
.secondary-btn:hover {
  background: #059669;
}

/* ===== Message ===== */
.message {
  margin-top: 14px;
  font-size: 14px;
  color: #dc2626;
}
</style>
