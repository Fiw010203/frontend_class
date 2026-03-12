<template>
  <div class="container">
    <div class="card">

      <!-- LEFT SIDE -->
      <div class="left">
        <img src="../student.png" class="login-img" />
      </div>

      <!-- RIGHT SIDE -->
      <div class="right">
        <h2>🔐 Student Login</h2>

        <input v-model="username" placeholder="Username" class="input" />

        <input v-model="password" type="password" placeholder="Password" class="input" />

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
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { API_BASE } from "../api.js"

const router = useRouter()

const username = ref("")
const password = ref("")
const message = ref("")

// 🔐 ถ้า login แล้ว ไม่ให้กลับมาหน้า login
onMounted(() => {
  const user = localStorage.getItem("user")
  if (user) {
    const parsed = JSON.parse(user)

    if (parsed.role === "teacher") {
      router.replace("/teacher")
    } else {
      router.replace("/student")
    }
  }
})

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

    // 💾 เก็บ user
    localStorage.setItem("user", JSON.stringify(data.user))

    // 🔀 redirect ตาม role
    if (data.user.role === "teacher") {
      router.replace("/teacher")
    } else {
      router.replace("/student")
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
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(90deg, #5f6de8, #b94cc6);
  font-family: "Segoe UI", system-ui, sans-serif;
}

/* ===== Card ===== */
.card {
  width: 900px;
  height: 420px;
  background: white;
  border-radius: 12px;
  display: flex;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

/* ===== Left Side ===== */
.left {
  width: 50%;
  background: white;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.circle {
  width: 180px;
  height: 180px;
  background: #e5e7eb;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon {
  font-size: 60px;
}

/* ===== Right Side ===== */
.right {
  width: 50%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

/* ===== Inputs ===== */
.input {
  width: 100%;
  padding: 12px;
  margin-top: 14px;
  border-radius: 25px;
  border: none;
  font-size: 14px;
  box-sizing: border-box;
  background: #e5e7eb;
}

.input:focus {
  outline: none;
  background: #c6ced5;
}

/* ===== Buttons == */
button {
  width: 100%;
  padding: 12px;
  margin-top: 14px;
  border-radius: 25px;
  border: none;
  font-size: 14px;
  box-sizing: border-box;
}

.primary-btn {
  background: linear-gradient(90deg, #b94cc6, #1de0c9);
  color: white;
}

.primary-btn:hover {
  background: linear-gradient(90deg, #973fa1, #16ab99);
}

.secondary-btn {
  background: linear-gradient(90deg, #10c98e, #16ab99);
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