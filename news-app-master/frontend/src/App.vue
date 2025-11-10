<template>
  <v-app>
    <v-app-bar flat color="primary" class="text-white">
      <v-app-bar-title class="font-weight-bold">
        <RouterLink to="/" class="app-link text-white">Mzansi News</RouterLink>
      </v-app-bar-title>
      <v-spacer />
      <div class="d-none d-md-flex align-center gap-3">
        <v-btn :to="{ name: 'home' }" variant="text" class="text-white">
          Headlines
        </v-btn>
        <template v-if="!isAuthenticated">
          <v-btn :to="{ name: 'login' }" variant="text" class="text-white">
            Login
          </v-btn>
          <v-btn
            :to="{ name: 'register' }"
            color="secondary"
            variant="flat"
            class="text-white"
          >
            Register
          </v-btn>
        </template>
        <template v-else>
          <v-chip color="secondary" class="text-white font-weight-medium">
            Hi, {{ authStore.user?.username }}
          </v-chip>
          <v-btn
            variant="text"
            class="text-white"
            :loading="authStore.status === 'loading'"
            @click="handleLogout"
          >
            Logout
          </v-btn>
        </template>
      </div>
      <div class="d-md-none">
        <v-menu transition="fade-transition">
          <template #activator="{ props }">
            <v-btn icon="mdi-menu" v-bind="props" variant="text" class="text-white" />
          </template>
          <v-list>
            <v-list-item :to="{ name: 'home' }">Headlines</v-list-item>
            <template v-if="!isAuthenticated">
              <v-list-item :to="{ name: 'login' }">Login</v-list-item>
              <v-list-item :to="{ name: 'register' }">Register</v-list-item>
            </template>
            <template v-else>
              <v-list-item title="Signed in as" :subtitle="authStore.user?.username" />
              <v-list-item @click="handleLogout">Logout</v-list-item>
            </template>
          </v-list>
        </v-menu>
      </div>
    </v-app-bar>

    <v-main>
      <RouterView />
    </v-main>

    <v-snackbar v-model="showSnackbar" color="error" timeout="6000" location="top end">
      {{ snackbarMessage }}
      <template #actions>
        <v-btn variant="text" @click="showSnackbar = false">Dismiss</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { RouterLink, RouterView, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const showSnackbar = ref(false)
const snackbarMessage = ref('')

const isAuthenticated = computed(() => authStore.isAuthenticated)

watch(
  () => authStore.error,
  (message) => {
    if (message) {
      snackbarMessage.value = message
      showSnackbar.value = true
    } else {
      showSnackbar.value = false
    }
  }
)

onMounted(async () => {
  await authStore.bootstrap()
})

const handleLogout = async () => {
  await authStore.logout()
  router.push({ name: 'home' })
}
</script>

<style scoped>
.app-link {
  text-decoration: none;
}
.gap-3 {
  gap: 12px;
}
</style>
