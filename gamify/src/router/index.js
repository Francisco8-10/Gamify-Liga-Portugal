import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView
    },
    {
      path: '/',
      name: 'home',
      component: HomeView
    },
    {
      path: '/rewards',
      name: 'rewards',
      component: () => import('../views/RewardsView.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue')
    }
  ]
})

// Authentication route guard
router.beforeEach((to) => {
  const authStore = useAuthStore()
  
  const isAuthRoute = to.path === '/login' || to.path === '/register'
  
  if (!authStore.isAuthenticated && !isAuthRoute) {
    // Redirect to login if trying to access protected page while logged out
    return '/login'
  } else if (authStore.isAuthenticated && isAuthRoute) {
    // Redirect to home if trying to access login/register while already logged in
    return '/'
  }
})

export default router
