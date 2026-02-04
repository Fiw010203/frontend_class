<template>
  <div class="box">
    <h2>Login</h2>

    <input v-model="username" placeholder="Username" />
    <input v-model="password" type="password" placeholder="Password" />

    <button @click="login">Login</button>
    <button @click="$router.push('/register')">สมัครสมาชิก</button>

    <p>{{ message }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

const username = ref("")
const password = ref("")
const message = ref("")

const login = async () => {
  const res = await fetch("http://localhost:5000/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: username.value,
      password: password.value
    })
  })

  const data = await res.json()

  if (!data.success) {
    message.value = data.message || "❌ Login ไม่ถูกต้อง"
    return
  }

  localStorage.setItem("user", JSON.stringify(data.user))

  if (data.user.role === "teacher") {
    router.push("/teacher")
  } else {
    router.push("/student")
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
input, button {
  width: 100%;
  margin-top: 8px;
}
</style>
