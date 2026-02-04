<template>
  <div class="container">
    <h2>📋 ตารางรายชื่อนักเรียน</h2>

    <button @click="goBack">⬅ กลับหน้าอาจารย์</button>

    <div class="toolbar">
      <label>
        เลือกวันที่:
        <input type="date" v-model="selectedDate" @change="loadData" />
      </label>
      <button class="refresh-btn" @click="loadData">รีเฟรช</button>
      <button class="clear-btn" @click="clearDate">ล้างวันที่</button>
    </div>
    <button @click="downloadCSV">⬇ ดาวน์โหลดตาราง</button>

    <p v-if="message">{{ message }}</p>

    <table v-if="rows.length">
  <thead>
    <tr>
      <th>ชื่อ-นามสกุล</th>
      <th>รหัสนักศึกษา</th>
      <th>เวลาเช็คชื่อ</th> <!-- ✅ เพิ่ม -->
      <th>จัดการ</th>
    </tr>
  </thead>
  <tbody>
    <tr v-for="(row, index) in rows" :key="index">
      <td>{{ row.fullname }}</td>
      <td>{{ row.student_code }}</td>
      <td>{{ formatDate(row.checked_at) }}</td> <!-- ✅ -->
      <td>
        <button class="delete-btn" @click="deleteRow(row)">ลบ</button>
      </td>
    </tr>
  </tbody>
</table>

    <p v-if="!rows.length && selectedDate && !message">ยังไม่มีข้อมูลสำหรับวันที่ {{ selectedDate }}</p>
    <p v-else-if="!rows.length && !message">ยังไม่มีข้อมูลนักเรียน</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const rows = ref([])
const message = ref("")
const selectedDate = ref(getTodayLocalDate())

function getTodayLocalDate() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

const loadData = async () => {
  try {
    const url = new URL("http://localhost:5000/attendance/list")
    if (selectedDate.value) {
      url.searchParams.set("date", selectedDate.value)
    } else {
      // request all when date is cleared
      url.searchParams.set("date", "all")
    }
    const res = await fetch(url.toString())

    if (!res.ok) {
      message.value = "❌ โหลดข้อมูลไม่สำเร็จ"
      return
    }

    const data = await res.json()
    rows.value = data.students || []
  } catch (err) {
    message.value = "❌ เชื่อมต่อ backend ไม่ได้"
  }
}
const deleteRow = async (row) => {
  const ok = confirm(`ต้องการลบรายการของ ${row.fullname} ใช่หรือไม่?`)
  if (!ok) return

  try {
    const res = await fetch(
      `http://localhost:5000/attendance/${row.attendance_id}`,
      { method: "DELETE" }
    )

    if (!res.ok) {
      message.value = "❌ ลบรายการไม่สำเร็จ"
      return
    }

    rows.value = rows.value.filter(
      (item) => item.attendance_id !== row.attendance_id
    )
  } catch (err) {
    message.value = "❌ เชื่อมต่อ backend ไม่ได้"
  }
}
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
const downloadCSV = () => {
  const url = new URL("http://localhost:5000/attendance/export")
  if (selectedDate.value) {
    url.searchParams.set("date", selectedDate.value)
  } else {
    url.searchParams.set("date", "all")
  }
  window.open(url.toString(), "_blank")
}

onMounted(loadData)
</script>


<style scoped>
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}
th, td {
  border: 1px solid #ccc;
  padding: 8px;
}
th {
  background: #f0f0f0;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 8px 0;
}
.refresh-btn {
  background: #2f6feb;
  color: #fff;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
}
.refresh-btn:hover {
  background: #2558c7;
}
.delete-btn {
  background: #e5484d;
  color: #fff;
  border: none;
  padding: 6px 10px;
  cursor: pointer;
}
.delete-btn:hover {
  background: #c4353a;
}
</style>
