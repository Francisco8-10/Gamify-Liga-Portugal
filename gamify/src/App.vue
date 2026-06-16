<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { useUserStore } from './stores/user'

const authStore = useAuthStore()
const userStore = useUserStore()

onMounted(async () => {
  if (authStore.isAuthenticated && authStore.user && authStore.token) {
    await userStore.syncFromBackend(authStore.user, authStore.token)
  }
})
</script>

<template>
  <!-- Paint Server for SVG Icons (renders primary gradient on active icons) -->
  <svg style="display: none;">
    <defs>
      <linearGradient id="primary-grad-paint" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="hsl(263, 90%, 65%)" />
        <stop offset="100%" stop-color="hsl(217, 91%, 60%)" />
      </linearGradient>
    </defs>
  </svg>

  <div class="device-wrapper">
    <div class="device-phone">
      <div class="device-screen">
        <!-- Authenticated App Layout (Dark Theme) -->
        <div v-if="authStore.isAuthenticated" class="app-container">
          <!-- Main View Content Area -->
          <main class="main-content">
            <router-view v-slot="{ Component }">
              <transition name="page-fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </main>
        </div>

        <!-- Unauthenticated Layout (Auth Pages - Light Theme) -->
        <div v-else class="auth-layout">
          <router-view v-slot="{ Component }">
            <transition name="page-fade" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>
      </div>

      <!-- Bottom Navigation Bar (Shown only when authenticated) -->
      <nav v-if="authStore.isAuthenticated" class="mobile-nav">
        <router-link to="/" class="nav-item">
          <!-- Home Icon -->
          <svg viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          <span>Início</span>
        </router-link>

        <router-link to="/rewards" class="nav-item">
          <!-- Gift Box Icon (matching homepage rescues) -->
          <svg viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
          <span>Prémios</span>
        </router-link>

        <router-link to="/profile" class="nav-item">
          <!-- Profile Icon -->
          <svg viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>
          <span>Perfil</span>
        </router-link>
      </nav>
    </div>
  </div>
</template>

<style>
/* Page transition animation */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

.auth-layout {
  min-height: 100vh;
  background-color: #f7f8f9;
  display: flex;
  flex-direction: column;
}

/* Device Wrapper styling */
.device-wrapper {
  display: block;
  height: 100dvh;
  width: 100%;
  overflow: hidden;
  background-color: #0b171e;
}

.device-phone {
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  height: 100dvh;
  background-color: var(--bg-secondary);
  overflow: hidden;
}

.device-screen {
  flex: 1;
  overflow-y: auto;
  width: 100%;
  position: relative;
}

/* Scrollbar styles for the simulator screen */
.device-screen::-webkit-scrollbar {
  width: 6px;
}
.device-screen::-webkit-scrollbar-track {
  background: transparent;
}
.device-screen::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.15);
  border-radius: 99px;
}

/* Desktop Simulation Viewport Override */
@media (min-width: 600px) {
  .device-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
    padding: 20px 0;
  }

  .device-phone {
    width: 395px;
    height: 844px; /* Matches iPhone 13/14 screen height */
    max-height: 94vh;
    border: 12px solid #1e293b;
    border-radius: 44px;
    box-shadow: 
      0 25px 50px -12px rgba(0, 0, 0, 0.6), 
      0 0 0 2px rgba(255, 255, 255, 0.05),
      0 0 40px rgba(0, 168, 89, 0.15);
    background-color: var(--bg-secondary);
    overflow: hidden;
  }

  .mobile-nav {
    position: absolute !important;
    bottom: 0;
    left: 0;
    right: 0;
    border-bottom-left-radius: 32px;
    border-bottom-right-radius: 32px;
  }
}

/* App and Navigation layout styles */
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100%;
}

.main-content {
  flex: 1;
  padding: 24px 16px 32px 16px;
  width: 100%;
}

.mobile-nav {
  height: 72px;
  background: #0b171e;
  border-top: 1px solid #1e293b;
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 100;
  flex-shrink: 0;
  padding-bottom: env(safe-area-inset-bottom);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #ffffff;
  font-size: 0.75rem;
  font-family: var(--font-heading);
  transition: color var(--transition-fast), transform var(--transition-fast);
  padding: 8px 12px;
  border-radius: 12px;
}

.nav-item svg {
  width: 24px;
  height: 24px;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
  transition: stroke var(--transition-fast);
}

.nav-item:hover, .nav-item.router-link-active {
  color: #00a859 !important;
}

.nav-item.router-link-active svg {
  stroke: #00a859 !important;
}
</style>

