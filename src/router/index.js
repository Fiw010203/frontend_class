import { createRouter, createWebHistory } from "vue-router"

import Login from "../views/Login.vue"
import Register from "../views/Register.vue"
import Teacher from "../views/Teacher.vue"
import Student from "../views/Student.vue"
import AttendanceTable from "../views/AttendanceTable.vue"

const routes = [
  { path: "/", component: Login },
  { path: "/register", component: Register },
  { path: "/teacher", component: Teacher },
  { path: "/student", component: Student },

  // ✅ หน้าใหม่ แยกจาก Teacher
  { path: "/attendance", component: AttendanceTable },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
