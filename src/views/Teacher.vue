<template>
  <div class="container">
    <h2>👩‍🏫 หน้าสำหรับอาจารย์</h2>

    <section class="card">
      <h3>สร้างรหัสเช็คชื่อ</h3>
      <button @click="generateCode">สร้างรหัส</button>
      <p v-if="code">รหัส: {{ code }}</p>
      <p v-if="message">{{ message }}</p>
    </section>

    <section class="card">
      <h3>จัดการข้อมูล</h3>
      <button @click="goToAttendance">
        📋 ดูตารางรายชื่อนักเรียน
      </button>
    </section>

    <button class="logout" @click="logout">🚪 Logout</button>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const code = ref("")
const message = ref("")

const generateCode = async () => {
  const res = await fetch("http://localhost:5000/attendance/generate-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
  const data = await res.json()
  code.value = data.code
}

const goToAttendance = () => {
  // ✅ เปลี่ยนหน้าใหม่ทั้งหน้า
  router.push("/attendance")
}

const logout = () => {
  localStorage.removeItem("user")
  router.push("/")
}
</script>



<style scoped>
.container {
  max-width: 800px;
  margin: auto;
  padding: 20px;
  font-family: "Segoe UI", sans-serif;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
}

.card {
  border: 1px solid #ccc;
  padding: 20px;
  margin-bottom: 30px;
  border-radius: 8px;
  background-color: #f9f9f9;
}

button {
  display: block;
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  font-weight: bold;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button.logout {
  background-color: #dc3545;
  margin-top: 20px;
}

button:hover {
  opacity: 0.9;
}

.code {
  font-size: 1.2em;
  font-weight: bold;
  margin-top: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

th, td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}

thead {
  background-color: #e0e0e0;
}
</style>
