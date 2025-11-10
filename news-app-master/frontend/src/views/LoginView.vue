<template>
  <v-container class="py-12 d-flex justify-center">
    <v-card elevation="3" width="420" class="pa-6">
      <v-card-title class="justify-center text-h5 font-weight-bold">Welcome back</v-card-title>
      <v-card-subtitle class="text-center mb-4 text-body-2">
        Sign in to access personalised news searches.
      </v-card-subtitle>

      <v-alert v-if="authStore.error" type="error" variant="tonal" class="mb-4">
        {{ authStore.error }}
      </v-alert>

      <v-form @submit.prevent="onSubmit" class="d-flex flex-column gap-4">
        <v-text-field
          v-model="form.username"
          label="Username"
          autocomplete="username"
          variant="outlined"
          required
          :error="Boolean(fieldErrors.username)"
          :error-messages="fieldErrors.username"
          prepend-inner-icon="mdi-account"
        />

        <v-text-field
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          autocomplete="current-password"
          variant="outlined"
          required
          :error="Boolean(fieldErrors.password)"
          :error-messages="fieldErrors.password"
          prepend-inner-icon="mdi-lock"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
        />

        <v-btn
          type="submit"
          color="primary"
          class="text-white"
          size="large"
          :loading="isLoading"
        >
          Sign In
        </v-btn>
      </v-form>

      <div class="text-body-2 text-medium-emphasis text-center mt-6">
        New to Mzansi News?
        <RouterLink :to="{ name: 'register' }">Create an account</RouterLink>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({
  username: '',
  password: '',
})

const fieldErrors = ref<Record<string, string | undefined>>({})
const showPassword = ref(false)

const isLoading = computed(() => authStore.status === 'loading')

authStore.clearError()

const validate = () => {
  const errors: Record<string, string> = {}

  if (!form.username) {
    errors.username = 'Username is required'
  }

  if (!form.password) {
    errors.password = 'Password is required'
  }

  fieldErrors.value = errors
  return Object.keys(errors).length === 0
}

const onSubmit = async () => {
  if (!validate()) {
    return
  }

  try {
    await authStore.login({
      username: form.username,
      password: form.password,
    })

    authStore.clearError()
    const redirectTarget = route.query.redirect
    if (typeof redirectTarget === 'string' && redirectTarget) {
      await router.push(redirectTarget)
    } else {
      await router.push({ name: 'home' })
    }
  } catch (error) {
    // Error state handled by the store and surfaced via authStore.error
  }
}

onBeforeUnmount(() => {
  authStore.clearError()
})
</script>

<style scoped>
.gap-4 {
  gap: 16px;
}
</style>
