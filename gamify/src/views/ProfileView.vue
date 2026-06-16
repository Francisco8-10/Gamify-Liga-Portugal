<script setup>
import { ref, computed, watch } from 'vue'
import { useUserStore } from '../stores/user'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const authStore = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}

const nameInput = ref(userStore.name)
const emailInput = ref(userStore.email)
const addressInput = ref(userStore.address)

watch(() => userStore.name, (val) => { nameInput.value = val })
watch(() => userStore.email, (val) => { emailInput.value = val })
watch(() => userStore.address, (val) => { addressInput.value = val })

const nameInputRef = ref(null)
const notification = ref(null)

const focusNameInput = () => {
  if (nameInputRef.value) {
    nameInputRef.value.focus()
  }
}

const handleSaveChanges = async () => {
  if (!nameInput.value.trim()) {
    showNotification('Nome não pode estar vazio.', 'error')
    return
  }
  
  try {
    const success = await userStore.updateProfile({
      name: nameInput.value.trim(),
      address: addressInput.value.trim()
    })
    
    if (success) {
      showNotification('Alterações gravadas com sucesso!', 'success')
    } else {
      showNotification('Erro ao gravar alterações.', 'error')
    }
  } catch (err) {
    showNotification(err.message || 'Erro ao gravar alterações.', 'error')
  }
}

const handleChangePassword = () => {
  showNotification('Recurso de alteração de password acionado.', 'success')
}

const showNotification = (msg, type) => {
  notification.value = { msg, type }
  setTimeout(() => {
    notification.value = null
  }, 4000)
}
</script>

<template>
  <div class="profile-view animate-fade-in">
    <!-- Header dedicated matching mockup -->
    <header class="profile-header">
      <div style="width: 32px;"></div>
      <span class="header-logo-text">FANPRIZES</span>
      <div style="width: 32px;"></div>
    </header>

    <!-- User Profile Card -->
    <div class="user-profile-dark-card">
      <div class="initials-green-box">
        {{ userStore.avatar }}
      </div>
      <h2 class="user-profile-name">{{ userStore.name }}</h2>
      <p class="user-profile-email">{{ userStore.email }}</p>
      <button @click="focusNameInput" class="edit-profile-action-btn">
        Editar Perfil
      </button>
    </div>

    <!-- Definições de Conta Card -->
    <div class="account-settings-card">
      <h3 class="settings-title">Definições de Conta</h3>
      
      <div class="settings-form">
        <!-- Nome Field -->
        <div class="form-group-custom">
          <label class="form-label-custom">Nome</label>
          <input 
            v-model="nameInput" 
            ref="nameInputRef"
            type="text" 
            class="form-input-custom" 
            placeholder="Nome Completo"
          />
        </div>

        <!-- Email Field -->
        <div class="form-group-custom">
          <label class="form-label-custom">Email</label>
          <input 
            v-model="emailInput" 
            type="email" 
            class="form-input-custom" 
            placeholder="Email"
            disabled
          />
        </div>


        <!-- Morada Field -->
        <div class="form-group-custom">
          <label class="form-label-custom">Morada</label>
          <input 
            v-model="addressInput" 
            type="text" 
            class="form-input-custom" 
            placeholder="Inserir Morada"
          />
        </div>

        <!-- Password Link -->
        <div class="link-wrapper">
          <a href="#" @click.prevent="handleChangePassword" class="change-password-link">
            Alterar Password
          </a>
        </div>

        <!-- Submit Button -->
        <button @click="handleSaveChanges" class="save-changes-btn">
          Guardar Alterações
        </button>
      </div>
    </div>

    <!-- Terminar Sessão Section -->
    <div class="logout-section animate-fade-in">
      <button @click="handleLogout" class="logout-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="logout-icon-svg">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12" />
        </svg>
        Terminar Sessão
      </button>
    </div>

    <!-- Notification Toast -->
    <transition name="fade">
      <div v-if="notification" class="notification-toast" :class="notification.type">
        <span class="toast-icon">{{ notification.type === 'success' ? '✓' : '✗' }}</span>
        <span class="toast-message">{{ notification.msg }}</span>
      </div>
    </transition>
  </div>
</template>

<style scoped>
.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  margin-left: -16px;
  margin-right: -16px;
  margin-top: -24px;
  margin-bottom: 24px;
}
.header-logo-text {
  font-family: var(--font-heading);
  font-size: 1.3rem;
  font-weight: 800;
  color: #000000;
  letter-spacing: 0.05em;
  text-align: center;
  white-space: nowrap;
}

/* Profile Card */
.user-profile-dark-card {
  background: #0b171e; /* Very dark slate/navy */
  border-radius: 12px;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  color: #ffffff;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
.initials-green-box {
  width: 80px;
  height: 80px;
  background: #00873c; /* Green color from mockup */
  border: 3px solid #ffffff;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-heading);
  font-size: 2.25rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 20px;
}
.user-profile-name {
  font-family: var(--font-heading);
  font-size: 1.65rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 4px;
}
.user-profile-email {
  font-size: 0.9rem;
  color: #94a3b8;
  margin-bottom: 24px;
}
.edit-profile-action-btn {
  border: 1px solid rgba(255, 255, 255, 0.4);
  background: transparent;
  color: #ffffff;
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
}
.edit-profile-action-btn:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: #ffffff;
}

/* Account Settings */
.account-settings-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  margin-bottom: 32px;
}
.settings-title {
  font-family: var(--font-heading);
  font-size: 1.35rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 24px;
}
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.form-group-custom {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-label-custom {
  font-size: 0.85rem;
  font-weight: 700;
  color: #4b5563;
}
.form-input-custom {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 14px 16px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #000000;
  outline: none;
  transition: border-color 0.2s ease, background-color 0.2s ease;
}
.form-input-custom::placeholder {
  color: #9ca3af;
}
.form-input-custom:focus {
  background: #ffffff;
  border-color: #00873c;
}
.link-wrapper {
  margin-top: 4px;
}
.change-password-link {
  font-size: 0.9rem;
  font-weight: 700;
  color: #006c2b;
  text-decoration: none;
}
.change-password-link:hover {
  text-decoration: underline;
}
.save-changes-btn {
  background: #006c2b;
  color: #ffffff;
  font-weight: 700;
  font-size: 1rem;
  padding: 14px;
  border-radius: 8px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 6px rgba(0, 108, 43, 0.15);
  border: none;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.1s ease;
}
.save-changes-btn:hover {
  background: #005622;
}
.save-changes-btn:active {
  transform: scale(0.99);
}

/* Toast Notifications */
.notification-toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  z-index: 1000;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.notification-toast.success {
  background: #006c2b;
  color: #ffffff;
}

.notification-toast.error {
  background: #ef4444;
  color: #ffffff;
}

@keyframes slideIn {
  from { opacity: 0; transform: translate(-50%, -10px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.35s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Logout Styles */
.logout-section {
  margin-bottom: 40px;
}
.logout-btn {
  background: #fce8e6;
  color: #c5221f;
  font-weight: 700;
  font-size: 1rem;
  padding: 14px;
  border-radius: 8px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid #fecaca;
  cursor: pointer;
  transition: all 0.2s ease;
}
.logout-btn:hover {
  background: #fcdbd7;
}
.logout-btn:active {
  transform: scale(0.99);
}
.logout-icon-svg {
  width: 20px;
  height: 20px;
}
</style>
