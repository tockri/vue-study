import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/home/HomeView.vue'
import LocalGovernmentMasterEditorView from '@/local-government/master-editor/View.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: HomeView,
  },
  {
    path: '/local-government/master-editor',
    name: 'LocalGovernmentMasterEditor',
    component: LocalGovernmentMasterEditorView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
