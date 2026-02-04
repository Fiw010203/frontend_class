<template>
  <div class="container">
    <h2>📋 ตารางรายชื่อนักเรียน</h2>

    <button class="back-btn" @click="goBack">
      ⬅ กลับหน้าอาจารย์
    </button>
    <h2>📋 ตารางรายชื่อนักเรียน</h2>
    <p class="teacher-name">
      👨‍🏫 อาจารย์ผู้สอน: <strong>{{ teacherName }}</strong>
    </p>

    <!-- Toolbar -->
    <div class="toolbar">
      <label>
        📅 เลือกวันที่:
        <input type="date" v-model="selectedDate" @change="loadData" />
      </label>

      <button class="refresh-btn" @click="loadData">
        🔄 รีเฟรช
      </button>

      <button class="clear-btn" @click="clearDate">
        ❌ ล้างวันที่
      </button>
    </div>

    <button class="download-btn" @click="downloadCSV">
      ⬇ ดาวน์โหลดตาราง (CSV)
    </button>

    <p v-if="message" class="message">{{ message }}</p>

    <!-- Table -->
    <table v-if="rows.length">
      <thead>
        <tr>
          <th>ชื่อ-นามสกุล</th>
          <th>รหัสนักศึกษา</th>
          <th>เวลาเช็คชื่อ</th>
          <th>จัดการ</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.attendance_id">
          <td>{{ row.fullname }}</td>
          <td>{{ row.student_code }}</td>
          <td>{{ formatDate(row.checked_at) }}</td>
          <td>
            <button class="delete-btn" @click="deleteRow(row)">
              🗑 ลบ
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="!rows.length && !message" class="empty">
      ยังไม่มีข้อมูลนักเรียน
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"
import { apiPath } from "../api.js"

const router = useRouter()

const rows = ref([])
const message = ref("")
const selectedDate = ref(getToday())
const teacherName = ref("")

/* ================= UTILS ================= */
function getToday() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

/* ================= LOAD DATA ================= */
const loadData = async () => {
  message.value = ""
  rows.value = []

  const user = JSON.parse(localStorage.getItem("user"))

  if (!user || user.role !== "teacher") {
    message.value = "❌ กรุณาเข้าสู่ระบบอาจารย์"
    return
  }

  try {
    const url = new URL(
      apiPath(`/attendance/list/${user.id}`)
    )

    url.searchParams.set(
      "date",
      selectedDate.value ? selectedDate.value : "all"
    )

    const res = await fetch(url.toString())

    if (!res.ok) {
      message.value = "❌ โหลดข้อมูลไม่สำเร็จ"
      return
    }

    const data = await res.json()
    rows.value = data.students || []

  } catch (err) {
    console.error("LOAD ERROR:", err)
    message.value = "❌ เชื่อมต่อ backend ไม่ได้"
  }
}

/* ================= DELETE ================= */
const deleteRow = async (row) => {
  const ok = confirm(`ต้องการลบรายการของ ${row.fullname} ใช่หรือไม่?`)
  if (!ok) return

  try {
    const res = await fetch(
      apiPath(`/attendance/${row.attendance_id}`),
      { method: "DELETE" }
    )

    if (!res.ok) {
      message.value = "❌ ลบรายการไม่สำเร็จ"
      return
    }

    rows.value = rows.value.filter(
      (r) => r.attendance_id !== row.attendance_id
    )
  } catch (err) {
    console.error("DELETE ERROR:", err)
    message.value = "❌ เชื่อมต่อ backend ไม่ได้"
  }
}

/* ================= CSV ================= */
const downloadCSV = () => {
  const user = JSON.parse(localStorage.getItem("user"))
  if (!user) return

  const url = new URL(
    apiPath(`/attendance/export/${user.id}`)
  )

  url.searchParams.set(
    "date",
    selectedDate.value ? selectedDate.value : "all"
  )

  window.open(url.toString(), "_blank")
}

/* ================= NAV ================= */
const clearDate = () => {
  selectedDate.value = ""
  loadData()
}

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString("th-TH")
}

const goBack = () => {
  router.push("/teacher")
}
onMounted(() => {
  const user = JSON.parse(localStorage.getItem("user"))
  if (user?.role === "teacher") {
    teacherName.value = user.fullname || user.username
  }
  loadData()
})

onMounted(loadData)
</script>


<style scoped>
/* ===== Layout ===== */
.container {
  max-width: 1000px;
  margin: 30px auto;
  padding: 22px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  font-family: "Segoe UI", system-ui, sans-serif;
}

h2 {
  margin-bottom: 12px;
  color: #1f2937;
}

/* ===== Buttons ===== */
button {
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.back-btn {
  background: #e5e7eb;
  border: none;
  padding: 6px 12px;
  margin-bottom: 10px;
}

.back-btn:hover {
  background: #d1d5db;
}

.download-btn {
  margin-top: 10px;
  background: #10b981;
  color: white;
  border: none;
  padding: 8px 14px;
}

.download-btn:hover {
  background: #059669;
}

/* ===== Toolbar ===== */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  background: #f9fafb;
  padding: 10px;
  border-radius: 10px;
  margin: 12px 0;
}

.toolbar label {
  font-size: 14px;
  color: #374151;
}

.toolbar input[type="date"] {
  padding: 6px 8px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

.refresh-btn {
  background: #2563eb;
  color: #fff;
  border: none;
  padding: 6px 12px;
}

.refresh-btn:hover {
  background: #1d4ed8;
}

.clear-btn {
  background: #f59e0b;
  color: #fff;
  border: none;
  padding: 6px 12px;
}

.clear-btn:hover {
  background: #d97706;
}

/* ===== Table ===== */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
  font-size: 14px;
}

thead {
  background: #f3f4f6;
}

th,
td {
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
}

th {
  color: #374151;
}

tbody tr:hover {
  background: #f9fafb;
}

/* ===== Delete ===== */
.delete-btn {
  background: #ef4444;
  color: #fff;
  border: none;
  padding: 6px 10px;
}

.delete-btn:hover {
  background: #dc2626;
}

/* ===== Message ===== */
.message {
  margin-top: 10px;
  color: #dc2626;
}

.empty {
  margin-top: 15px;
  color: #6b7280;
}

/* ===== Responsive ===== */
@media (max-width: 768px) {
  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  table {
    font-size: 13px;
  }
}
.teacher-name {
  margin-bottom: 10px;
  color: #374151;
  font-size: 15px;
}

</style>
