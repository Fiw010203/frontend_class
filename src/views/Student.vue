<template>
  <div class="box">
    <h2>นักศึกษา</h2>

    <input v-model="code" placeholder="กรอกรหัสเช็คชื่อ" />
    <button @click="checkin">เช็คชื่อ</button>

    <p>{{ message }}</p>

    <button @click="logout">Logout</button>
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
  try {
    if (!user || user.role !== "student") {
      message.value = "❌ กรุณาเข้าสู่ระบบนักศึกษา"
      return
    }

    const res = await fetch(`${API_BASE}/attendance/checkin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: user.id,
        code: code.value.trim()
      })
    })

    const data = await res.json()

    if (!res.ok) {
      message.value = data.message || "❌ เช็คชื่อไม่สำเร็จ"
      return
    }

    message.value = data.message
    code.value = ""
  } catch (err) {
    console.error(err)
    message.value = "❌ เกิดข้อผิดพลาดในการเชื่อมต่อ"
  }
}

const logout = () => {
  localStorage.removeItem("user")
  router.push("/")
}
</script>


<style scoped>
.box {
  width: 300px;
  margin: auto;
  border: 1px solid #ccc;
  padding: 20px;
}
input, button {
  width: 100%;
  margin-top: 8px;
}
</style>
