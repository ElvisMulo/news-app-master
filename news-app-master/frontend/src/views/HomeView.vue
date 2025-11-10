<template>
  <v-container class="py-8 home-container">
    <v-row class="align-center mb-6">
      <v-col cols="12" md="8">
        <h1 class="text-h4 font-weight-bold mb-2">Stay Informed</h1>
        <p class="text-body-2 text-medium-emphasis">
          Browse the latest headlines from trusted news sources and search for stories that matter to
          you.
        </p>
      </v-col>
      <v-col cols="12" md="4" class="d-flex justify-end">
        <v-select
          v-model="selectedCategory"
          :items="categories"
          label="Filter by category"
          item-title="title"
          item-value="value"
          density="comfortable"
          variant="solo-filled"
          color="primary"
          clearable
          hide-details
          @update:model-value="loadHeadlines"
        />
      </v-col>
    </v-row>

    <v-card class="pa-4 mb-6" elevation="2">
      <v-form @submit.prevent="onSearch">
        <v-row class="align-center" :class="{ 'flex-column': isXs }">
          <v-col cols="12" md="8">
            <v-text-field
              v-model="searchTerm"
              :disabled="!isAuthenticated"
              label="Search for topics, locations, or keywords"
              variant="outlined"
              density="comfortable"
              prepend-inner-icon="mdi-magnify"
              :hint="!isAuthenticated ? 'Sign in to unlock search filters.' : undefined"
              :persistent-hint="!isAuthenticated"
            />
          </v-col>
          <v-col cols="12" md="4" class="d-flex gap-3 justify-end">
            <v-select
              v-model="selectedLanguage"
              :items="languages"
              label="Language"
              item-title="title"
              item-value="value"
              density="comfortable"
              variant="solo-filled"
              hide-details
              :disabled="!isAuthenticated"
            />
            <v-btn
              color="primary"
              class="text-white"
              size="large"
              :disabled="!isAuthenticated || !searchTerm"
              :loading="loading && currentMode === 'search'"
              type="submit"
            >
              Search
            </v-btn>
          </v-col>
        </v-row>
      </v-form>
      <v-alert
        v-if="searchFeedback"
        class="mt-4"
        :type="searchFeedbackType"
        variant="tonal"
      >
        {{ searchFeedback }}
      </v-alert>
    </v-card>

    <v-row class="mb-4">
      <v-col cols="12" md="6">
        <h2 class="text-h5 font-weight-medium">
          {{ currentMode === 'search' ? 'Search Results' : 'Top Headlines' }}
        </h2>
      </v-col>
      <v-col cols="12" md="6" class="d-flex justify-end text-medium-emphasis">
        <span v-if="!loading && articles.length">
          Showing {{ articles.length }} article{{ articles.length === 1 ? '' : 's' }}
        </span>
      </v-col>
    </v-row>

    <v-alert v-if="errorMessage" type="error" variant="tonal" class="mb-6">
      {{ errorMessage }}
    </v-alert>

    <v-row v-if="loading">
      <v-col v-for="n in 6" :key="n" cols="12" md="4">
        <v-skeleton-loader type="image, article" />
      </v-col>
    </v-row>

    <v-row v-else-if="articles.length">
      <v-col
        v-for="(article, index) in articles"
        :key="article.url ?? `${article.title}-${index}`"
        cols="12"
        md="6"
        lg="4"
      >
        <ArticleCard :article="article" />
      </v-col>
    </v-row>

    <v-alert
      v-else
      border="start"
      variant="outlined"
      type="info"
      color="primary"
      class="mt-8"
    >
      No articles found. Try adjusting your filters or searching for a different topic.
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useDisplay } from 'vuetify'
import { isAxiosError } from 'axios'

import ArticleCard from '@/components/ArticleCard.vue'
import { fetchTopHeadlines, searchArticles } from '@/services/news'
import { useAuthStore } from '@/stores/auth'
import type { Article } from '@/types/api'

type Mode = 'headlines' | 'search'

const authStore = useAuthStore()
const { xs } = useDisplay()

const articles = ref<Article[]>([])
const loading = ref(false)
const errorMessage = ref<string | null>(null)
const searchFeedback = ref<string | null>(null)
const searchFeedbackType = ref<'info' | 'error'>('info')
const searchTerm = ref('')
const selectedCategory = ref<string | null>(null)
const selectedLanguage = ref('en')
const currentMode = ref<Mode>('headlines')

const categories = [
  { title: 'All Categories', value: null },
  { title: 'Business', value: 'business' },
  { title: 'Entertainment', value: 'entertainment' },
  { title: 'General', value: 'general' },
  { title: 'Health', value: 'health' },
  { title: 'Science', value: 'science' },
  { title: 'Sports', value: 'sports' },
  { title: 'Technology', value: 'technology' },
]

const languages = [
  { title: 'English', value: 'en' },
  { title: 'French', value: 'fr' },
  { title: 'German', value: 'de' },
  { title: 'Spanish', value: 'es' },
]

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isXs = computed(() => xs.value)

const loadHeadlines = async () => {
  loading.value = true
  errorMessage.value = null
  searchFeedback.value = null
  currentMode.value = 'headlines'

  try {
    articles.value = await fetchTopHeadlines({
      category: selectedCategory.value ?? undefined,
    })
  } catch (error) {
    if (isAxiosError(error)) {
      errorMessage.value =
        error.response?.data?.detail ?? 'Unable to load headlines. Please try again later.'
    } else {
      errorMessage.value = 'Unable to load headlines. Please try again later.'
    }
  } finally {
    loading.value = false
  }
}

const onSearch = async () => {
  if (!isAuthenticated.value) {
    searchFeedback.value = 'Sign in to unlock global news search.'
    searchFeedbackType.value = 'info'
    return
  }

  if (!searchTerm.value) {
    searchFeedback.value = 'Enter a keyword or phrase to start searching.'
    searchFeedbackType.value = 'info'
    return
  }

  loading.value = true
  errorMessage.value = null
  searchFeedback.value = null
  currentMode.value = 'search'

  try {
    articles.value = await searchArticles({
      q: searchTerm.value,
      language: selectedLanguage.value,
      sortBy: 'publishedAt',
    })

    if (!articles.value.length) {
      searchFeedback.value = 'No articles matched your search. Try a different keyword.'
      searchFeedbackType.value = 'info'
    }
  } catch (error) {
    if (isAxiosError(error)) {
      if (error.response?.status === 401) {
        searchFeedback.value = 'Your session has expired. Please sign in again to continue.'
        searchFeedbackType.value = 'error'
        await authStore.refreshSession()
      } else {
        searchFeedback.value =
          error.response?.data?.detail ?? 'Search failed. Please try again in a moment.'
        searchFeedbackType.value = 'error'
      }
    } else {
      searchFeedback.value = 'Search failed. Please try again in a moment.'
      searchFeedbackType.value = 'error'
    }
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadHeadlines()
})
</script>

<style scoped>
.home-container {
  max-width: 1200px;
}

.gap-3 {
  gap: 12px;
}
</style>
