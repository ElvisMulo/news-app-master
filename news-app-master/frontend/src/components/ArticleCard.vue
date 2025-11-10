<template>
  <v-card elevation="2" class="article-card h-100 d-flex flex-column">
    <v-img
      :src="imageSource"
      height="180"
      cover
      class="rounded-t"
      :alt="article.title || 'Article image'"
    >
      <template #placeholder>
        <div class="d-flex align-center justify-center fill-height">
          <v-progress-circular indeterminate color="primary" />
        </div>
      </template>
    </v-img>

    <v-card-item>
      <v-card-title class="text-wrap text-h6">
        {{ article.title }}
      </v-card-title>
      <v-card-subtitle class="text-caption">
        <span>{{ article.source?.name || 'Unknown source' }}</span>
        <span v-if="article.publishedAt"> &bull; {{ article.publishedAt }}</span>
      </v-card-subtitle>
    </v-card-item>

    <v-card-text class="text-body-2 text-medium-emphasis">
      {{ article.description || 'No description available.' }}
    </v-card-text>

    <v-spacer />

    <v-divider />

    <v-card-actions class="justify-space-between">
      <div class="text-body-2 text-medium-emphasis">
        {{ article.author || 'Unknown author' }}
      </div>
      <v-btn
        color="primary"
        variant="elevated"
        class="text-white"
        :href="article.url || '#'"
        target="_blank"
        rel="noopener"
      >
        Read More
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue'

import type { Article } from '@/types/api'

const FALLBACK_IMAGE = 'https://via.placeholder.com/600x400.png?text=No+Image+Available'

export default defineComponent({
  name: 'ArticleCard',
  props: {
    article: {
      type: Object as PropType<Article>,
      required: true,
    },
  },
  computed: {
    imageSource(): string {
      return this.article.urlToImage || FALLBACK_IMAGE
    },
  },
})
</script>

<style scoped>
.article-card {
  min-height: 100%;
}

.rounded-t {
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}
</style>
