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

const router = useRouter()
const code = ref("")
const message = ref("")

// ดึง user จาก localStorage
const user = JSON.parse(localStorage.getItem("user"))

const checkin = async () => {
  try {
    const res = await fetch("http://localhost:5000/attendance/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId: user.id,
        code: code.value
      })
    })

    if (!res.ok) {
      // ถ้า backend ตอบ error (เช่น 400, 404) → อ่านเป็น text
      const text = await res.text()
      message.value = "❌ Error: " + text
      return
    }

    const data = await res.json()
    message.value = data.message
  } catch (err) {
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
