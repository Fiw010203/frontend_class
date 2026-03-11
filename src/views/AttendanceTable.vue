<template>
  <div class="containerbg">
    <div class="container">
      <div class="card">
        <h2>📋 ตารางรายชื่อนักเรียน</h2>
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
      </div>
      <!-- ===== Import CSV ===== -->
      <section class="card">
        <h3>📥 นำเข้าข้อมูลนักศึกษา</h3>

        <div class="import-box">
          <input id="csvFile" type="file" accept=".csv" @change="handleFile" hidden />
          <label for="csvFile" class="upload-btn">
            Upload CSV
          </label>
          <button class="import-btn" @click="uploadFile">
            📤 นำเข้ารหัสนิสิต
          </button>
        </div>
      </section>
      <!-- Stats -->
      <div class="stats">
        <div class="stat blue">
          <div class="num">{{ rows.length }}</div>
          <div>นักเรียนทั้งหมด</div>
        </div>

        <div class="stat green">
          <div class="num">{{ presentCount }}</div>
          <div>มาเรียน</div>
        </div>

        <div class="stat red">
          <div class="num">{{ absentCount }}</div>
          <div>ขาดเรียน</div>
        </div>

        

      </div>
      <div class="cardlist">
        <h2>📋 ตารางรายชื่อนักเรียน</h2>
        <p class="teacher-name">
          👨‍🏫 อาจารย์ผู้สอน: <strong>{{ teacherName }}</strong>
        </p>

        <!-- Table -->
        <table v-if="rows.length">
          <thead>
            <tr>
              <th>ชื่อ-นามสกุล</th>
              <th>รหัสนักศึกษา</th>
              <th>สถานะ</th>
              <th>เวลาเช็คชื่อ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in rows" :key="row.attendance_id">
              <td>{{ row.fullname }}</td>

              <td>{{ row.student_code }}</td>

              <!-- สถานะ -->
              <td>
                <span v-if="row.status === 'present'" class="present">
                  ✅ มา
                </span>

                <span v-else-if="row.status === 'late'" class="late">
                  ⏰ มาสาย
                </span>

                <span v-else-if="row.status === 'leave'" class="leave">
                  📝 ลา
                </span>

                <span v-else class="absent">
                  ❌ ขาด
                </span>
              </td>

              <!-- เวลา -->
              <td>
                {{ row.checked_at ? formatDate(row.checked_at) : "-" }}
              </td>

              <td>
                <button class="delete-btn" @click="deleteRow(row)">
                  🗑 ลบ
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Toolbar -->
      <button class="download-btn" @click="downloadCSV">
        ⬇ ดาวน์โหลดตาราง (CSV)
      </button>

      <button class="back-btn" @click="goBack">
        ⬅ กลับหน้าอาจารย์
      </button>

      <p v-if="message" class="message">{{ message }}</p>



      <p v-if="!rows.length && !message" class="empty">
        ยังไม่มีข้อมูลนักเรียน
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"
import { apiPath } from "../api.js"

const router = useRouter()

const rows = ref([])
const message = ref("")
const selectedDate = ref(getToday())
const teacherName = ref("")
const file = ref(null)
/* ================= STATS ================= */

const presentCount = computed(() =>
  rows.value.filter(r => r.status === "present").length
)

const absentCount = computed(() =>
  rows.value.filter(r => r.status === "absent").length
)

const lateCount = computed(() =>
  rows.value.filter(r => r.status === "late").length
)

const leaveCount = computed(() =>
  rows.value.filter(r => r.status === "leave").length
)
const handleFile = (e) => {
  file.value = e.target.files[0]
}

const uploadFile = async () => {
  if (!file.value) {
    alert("กรุณาเลือกไฟล์ CSV")
    return
  }

  const user = JSON.parse(localStorage.getItem("user"))
  if (!user || user.role !== "teacher") {
    alert("กรุณาเข้าสู่ระบบอาจารย์")
    return
  }

  const formData = new FormData()
  formData.append("file", file.value)

  try {
    const res = await fetch(
      apiPath(`/attendance/students/import?teacherId=${user.id}`),
      {
        method: "POST",
        body: formData
      }
    )

    const data = await res.json()
    alert(data.message)
    loadData() // reload ตาราง
  } catch (err) {
    alert("อัปโหลดไฟล์ไม่สำเร็จ")
  }
}


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
  const ok = confirm(`ถอนรายชื่อ ${row.fullname} ออกจากคลาสใช่ไหม?`)
  if (!ok) return

  try {
    const res = await fetch(
      apiPath(`/attendance/student/${row.student_id}`),
      { method: "DELETE" }
    )

    if (!res.ok) {
      message.value = "❌ ถอนรายชื่อไม่สำเร็จ"
      return
    }

    // เอาออกจากตารางทันที
    rows.value = rows.value.filter(
      r => r.student_id !== row.student_id
    )
  } catch (err) {
    console.error(err)
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
/* ================= EDIT ================= */
const editRow = (row) => {
  row._oldStatus = row.status
  row.editing = true
}

const cancelEdit = (row) => {
  row.status = row._oldStatus
  row.editing = false
}

const saveRow = async (row) => {
  try {

    // ถ้ายังไม่มี attendance_id → ใช้ API สร้างใหม่
    if (!row.attendance_id) {

      const user = JSON.parse(localStorage.getItem("user"))

      const res = await fetch(
        apiPath(`/attendance/update-status`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            studentId: row.student_id,
            status: row.status,
            teacherId: user.id,
            date: selectedDate.value
          })
        }
      )

      if (!res.ok) {
        alert("❌ แก้ไขไม่สำเร็จ")
        return
      }

    } else {

      // ถ้ามีอยู่แล้ว → update ปกติ
      const res = await fetch(
        apiPath(`/attendance/${row.attendance_id}`),
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            status: row.status
          })
        }
      )

      if (!res.ok) {
        alert("❌ แก้ไขไม่สำเร็จ")
        return
      }
    }

    row.editing = false
    message.value = "✅ แก้ไขสถานะเรียบร้อย"
    loadData() // รีโหลดเพื่อเอา attendance_id ใหม่

  } catch (err) {
    console.error("EDIT ERROR:", err)
    alert("❌ เชื่อมต่อ backend ไม่ได้")
  }
}


onMounted(loadData)
</script>


<style scoped>
/* ===== Status Badge ===== */
.present {
  color: #16a34a;
  font-weight: 600;
}

.absent {
  color: #dc2626;
  font-weight: 600;
}

.leave {
  color: #d97706;
  font-weight: 600;
}

/* ===== Layout ===== */
.containerbg {
  background: linear-gradient(90deg, #5f6de8, #b94cc6);
  min-height: 100vh;
  padding: 30px 15px;
}

.container {
  max-width: 1000px;
  margin: 30px auto;
  padding: 22px;
  background: transparent;
  border-radius: 14px;
  font-family: "Segoe UI", system-ui, sans-serif;
}

h2 {
  margin-bottom: 8px;
  color: #111827;
}

.teacher-name {
  margin-bottom: 14px;
  color: #374151;
  font-size: 15px;
}

.card {
  background: #ffffff;
  padding: 20px;
  border-radius: 14px;
  margin-bottom: 20px;
}

.cardlist {
  background: #ffffff;
  padding: 20px;
  border-radius: 14px;
  margin-bottom: 20px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.stat {
  background: white;
  padding: 18px;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.06);
}

.stat .num {
  font-size: 22px;
  font-weight: bold;
}

.blue {
  color: #2563eb
}

.green {
  color: #10b981
}

.red {
  color: #ef4444
}

.yellow {
  color: #f59e0b
}

.gray {
  color: #6b7280
}

/* ===== Buttons ===== */
button {
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.back-btn {
  background: #ef4444;
  color: #ffffff;
  border: none;
  padding: 6px 12px;
  margin-bottom: 10px;
  width: 100%;
  padding: 12px;
  margin-top: 14px;
  border-radius: 25px;
  border: none;
  font-size: 14px;
  box-sizing: border-box;
}

.back-btn:hover {
  background: #cf3b3b;
}

.download-btn {
  margin-top: 10px;
  background: linear-gradient(90deg, #b94cc6, #1de0c9);
  color: #ffffff;
  border: none;
  padding: 8px 14px;
  width: 100%;
  padding: 12px;
  margin-top: 14px;
  border-radius: 25px;
  border: none;
  font-size: 14px;
  box-sizing: border-box;
}

.download-btn:hover {
  background: linear-gradient(90deg, #973fa1, #16ab99);
}

.import-box {
  display: flex;
  gap: 10px;
  align-items: center;
  margin-top: 12px;
}

/* ===== Toolbar ===== */
.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  background: #ffffff;
  padding: 10px;
  border-radius: 10px;
  margin: 12px 0;
}

.toolbar label {
  font-size: 14px;
  color: #ffffff;
}

.toolbar input[type="date"] {
  padding: 6px 10px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
}

.refresh-btn {
  background: #2563eb;
  color: #fff;
  padding: 6px 14px;
}

.refresh-btn:hover {
  background: #1d4ed8;
}

.clear-btn {
  background: #f59e0b;
  color: #fff;
  padding: 6px 14px;
}

.clear-btn:hover {
  background: #d97706;
}

.import-btn {
  background: #10b981;
  color: #fff;
  border: none;
  padding: 6px 12px;
}

.import-btn:hover {
  background: #059669;
}

.upload-btn {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border-radius: 10px;
  cursor: pointer;
  display: inline-block;
}

.upload-btn:hover {
  background: #2563eb;
}

/* ===== Table ===== */
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  font-size: 14px;
  table-layout: fixed;
}

thead {
  background: #f3f4f6;
}

th {
  padding: 12px 10px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
}

td {
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
  vertical-align: middle;
}

td {
  text-align: center;
}

tbody tr:hover {
  background: #f9fafb;
}

/* ===== Column Width ===== */
th:nth-child(1),
td:nth-child(1) {
  width: 26%;
}

th:nth-child(2),
td:nth-child(2) {
  width: 18%;
}

th:nth-child(3),
td:nth-child(3) {
  width: 14%;
}

th:nth-child(4),
td:nth-child(4) {
  width: 22%;
}

th:nth-child(5),
td:nth-child(5) {
  width: 20%;
  white-space: nowrap;
}

/* ===== Action Buttons ===== */
.edit-btn {
  background: #facc15;
  padding: 6px 10px;
}

.save-btn {
  background: #22c55e;
  color: #fff;
  padding: 6px 10px;
}

.cancel-btn {
  background: #ef4444;
  color: #fff;
  padding: 6px 10px;
}

.delete-btn {
  background: #dc2626;
  color: #fff;
  padding: 6px 10px;
}

td button {
  margin-right: 4px;
}

/* ===== Message ===== */
.message {
  margin-top: 12px;
  color: #dc2626;
  font-size: 14px;
}

.empty {
  margin-top: 16px;
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
