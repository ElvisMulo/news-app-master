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

<script lang="ts">
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'
import { mapStores } from 'pinia'

import { useAuthStore } from '@/stores/auth'

type FieldErrors = Record<string, string | undefined>

export default defineComponent({
  name: 'LoginView',
  components: {
    RouterLink,
  },
  data() {
    return {
      form: {
        username: '',
        password: '',
      },
      fieldErrors: {} as FieldErrors,
      showPassword: false,
    }
  },
  computed: {
    ...mapStores(useAuthStore),
    isLoading(): boolean {
      return this.authStore.status === 'loading'
    },
  },
  created() {
    this.authStore.clearError()
  },
  beforeUnmount() {
    this.authStore.clearError()
  },
  methods: {
    validate(): boolean {
      const errors: FieldErrors = {}

      if (!this.form.username) {
        errors.username = 'Username is required'
      }

      if (!this.form.password) {
        errors.password = 'Password is required'
      }

      this.fieldErrors = errors
      return Object.keys(errors).length === 0
    },
    async onSubmit() {
      if (!this.validate()) {
        return
      }

      try {
        await this.authStore.login({
          username: this.form.username,
          password: this.form.password,
        })

        this.authStore.clearError()
        const redirectTarget = this.$route.query.redirect

        if (typeof redirectTarget === 'string' && redirectTarget) {
          await this.$router.push(redirectTarget)
        } else {
          await this.$router.push({ name: 'home' })
        }
      } catch (error) {
        // handled by auth store
      }
    },
  },
})
</script>

<style scoped>
.gap-4 {
  gap: 16px;
}
</style>
