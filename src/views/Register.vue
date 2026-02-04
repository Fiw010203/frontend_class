<template>
  <div class="box">
    <h2>Register</h2>

    <input v-model="username" placeholder="Username" />
    <input v-model="password" type="password" placeholder="Password" />

    <select v-model="role">
      <option value="student">นักศึกษา</option>
      <option value="teacher">อาจารย์</option>
    </select>

    <!-- ช่องกรอก fullname และ student_code เฉพาะนักศึกษา -->
    <input v-if="role === 'student'" v-model="fullname" placeholder="ชื่อจริง" />
    <input v-if="role === 'student'" v-model="studentCode" placeholder="รหัสนักศึกษา" />

    <button @click="register">สมัคร</button>
    <button @click="$router.push('/')">กลับ</button>

    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue"
import axios from "axios"
import { useRouter } from "vue-router"

const username = ref("")
const password = ref("")
const role = ref("student")
const fullname = ref("")
const studentCode = ref("")
const message = ref("")
const router = useRouter()

const register = async () => {
  try {
    // เตรียม payload ตาม role
    const payload = {
      username: username.value,
      password: password.value,
      role: role.value
    }

    // ถ้าเป็น student ให้ส่ง fullname และ student_code ไปด้วย
    if (role.value === "student") {
      payload.fullname = fullname.value
      payload.student_code = studentCode.value
    }

    await axios.post("http://localhost:5000/auth/register", payload)

    message.value = "✅ สมัครสำเร็จ"
    router.push("/")
  } catch (err) {
    console.error("REGISTER ERROR:", err.response?.data || err.message)
    message.value = "❌ สมัครไม่สำเร็จ: " + (err.response?.data?.message || "")
  }
}
</script>

<style scoped>
.box {
  width: 300px;
  margin: auto;
  border: 1px solid #ccc;
  padding: 20px;
}
input, select, button {
  width: 100%;
  margin-top: 8px;
}
</style>
