import { createRouter, createWebHistory } from "vue-router"

import Login from "../views/Login.vue"
import Register from "../views/Register.vue"
import Teacher from "../views/Teacher.vue"
import Student from "../views/Student.vue"
import AttendanceTable from "../views/AttendanceTable.vue"

const routes = [
  { path: "/", component: Login },
  { path: "/register", component: Register },

  { 
    path: "/teacher", 
    component: Teacher,
    meta: { requiresAuth: true }
  },

  { 
    path: "/student", 
    component: Student,
    meta: { requiresAuth: true }
  },

  { 
    path: "/attendance", 
    component: AttendanceTable,
    meta: { requiresAuth: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})


// 🔐 ตรวจสอบ login
router.beforeEach((to, from, next) => {

  const user = localStorage.getItem("user")

  if (to.meta.requiresAuth && !user) {
    next("/") // กลับไปหน้า login
  } else {
    next()
  }

})

export default router