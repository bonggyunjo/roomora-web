export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  app: {
    head: {
      title: 'Roomora — 내 조건에 맞는 공간 레시피',
      meta: [
        { name: 'description', content: '전세·월세·무타공·예산 조건에 딱 맞는 인테리어 레시피와 맞춤 체크리스트를 찾아보세요.' }
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css'
        }
      ]
    }
  },
  runtimeConfig: {
    public: {
      apiBaseUrl: 'http://localhost:8080'
    }
  }
})
