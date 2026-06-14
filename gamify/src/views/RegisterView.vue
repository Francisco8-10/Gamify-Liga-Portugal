<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const acceptTerms = ref(false)

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const errorMsg = ref('')

const handleRegister = async () => {
  if (!name.value) {
    errorMsg.value = 'Por favor, insira o seu nome completo.'
    return
  }
  if (!email.value) {
    errorMsg.value = 'Por favor, insira o seu email.'
    return
  }
  if (!phone.value) {
    errorMsg.value = 'Por favor, insira o seu número de telemóvel.'
    return
  }
  if (!password.value) {
    errorMsg.value = 'Por favor, insira uma palavra-passe.'
    return
  }
  if (password.value !== confirmPassword.value) {
    errorMsg.value = 'As palavras-passe não coincidem.'
    return
  }
  if (!acceptTerms.value) {
    errorMsg.value = 'Deve aceitar os termos e condições.'
    return
  }

  try {
    const success = await authStore.register(name.value, email.value, phone.value, password.value)
    if (success) {
      router.push('/')
    } else {
      errorMsg.value = 'Erro ao criar conta. Tente novamente.'
    }
  } catch (err) {
    errorMsg.value = err.message || 'Erro ao criar conta. Tente novamente.'
  }
}
</script>

<template>
  <div class="auth-page">
    <div class="auth-card">
      <!-- Top Trophy Icon Badge -->
      <div class="trophy-badge">
        <svg viewBox="0 0 24 24" class="trophy-icon">
          <path d="M19 4h-1V2H6v2H5c-1.1 0-2 .9-2 2v3c0 2.24 1.54 4.13 3.6 4.78C7.54 15.36 10 17 10 17v4H7v2h10v-2h-3v-4s2.46-1.64 3.4-3.22c2.06-.65 3.6-2.54 3.6-4.78V6c0-1.1-.9-2-2-2zm-14 5V6h1v3.35C5.39 9.17 5 8.63 5 8zm13-2h1v2c0 .63-.39 1.17-1 1.35V6z"/>
        </svg>
      </div>

      <!-- Gamify Text Logo (Only on Register screen) -->
      <div class="gamify-logo">GAMIFY</div>

      <!-- Header Titles -->
      <h1 class="auth-title">Criar Conta</h1>
      <p class="auth-subtitle">Junta-te à equipa</p>

      <!-- Error Message -->
      <div v-if="errorMsg" class="error-banner">
        {{ errorMsg }}
      </div>

      <!-- Form -->
      <form @submit.prevent="handleRegister" class="auth-form">
        <!-- Full Name Input (No icon inside input) -->
        <div class="form-group">
          <label class="form-label">Nome Completo</label>
          <div class="input-wrapper">
            <input 
              v-model="name" 
              type="text" 
              placeholder="Introduza o seu nome"
              class="auth-input no-left-icon"
            />
          </div>
        </div>

        <!-- Email Input -->
        <div class="form-group">
          <label class="form-label">Email</label>
          <div class="input-wrapper">
            <svg viewBox="0 0 24 24" class="input-icon left-icon">
              <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/>
            </svg>
            <input 
              v-model="email" 
              type="email" 
              placeholder="user@gmail.com"
              class="auth-input"
            />
          </div>
        </div>

        <!-- Phone Input -->
        <div class="form-group">
          <label class="form-label">Telemóvel</label>
          <div class="input-wrapper">
            <svg viewBox="0 0 24 24" class="input-icon left-icon">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <input 
              v-model="phone" 
              type="text" 
              placeholder="+351 912 345 678"
              class="auth-input"
            />
          </div>
        </div>

        <!-- Password Input -->
        <div class="form-group">
          <label class="form-label">Palavra-passe</label>
          <div class="input-wrapper">
            <svg viewBox="0 0 24 24" class="input-icon left-icon">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <input 
              v-model="password" 
              :type="showPassword ? 'text' : 'password'" 
              placeholder="......."
              class="auth-input password-input"
            />
            <button 
              type="button" 
              @click="showPassword = !showPassword" 
              class="eye-btn"
            >
              <!-- Eye Icon -->
              <svg v-if="showPassword" viewBox="0 0 24 24" class="input-icon right-icon">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              <!-- Eye Off Icon -->
              <svg v-else viewBox="0 0 24 24" class="input-icon right-icon">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.82l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.74-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Confirm Password Input -->
        <div class="form-group">
          <label class="form-label">Confirmar Palavra-passe</label>
          <div class="input-wrapper">
            <svg viewBox="0 0 24 24" class="input-icon left-icon">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
            </svg>
            <input 
              v-model="confirmPassword" 
              :type="showConfirmPassword ? 'text' : 'password'" 
              placeholder="......."
              class="auth-input password-input"
            />
            <button 
              type="button" 
              @click="showConfirmPassword = !showConfirmPassword" 
              class="eye-btn"
            >
              <!-- Eye Icon -->
              <svg v-if="showConfirmPassword" viewBox="0 0 24 24" class="input-icon right-icon">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
              </svg>
              <!-- Eye Off Icon -->
              <svg v-else viewBox="0 0 24 24" class="input-icon right-icon">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.82l2.92 2.92c1.51-1.26 2.7-2.89 3.44-4.74-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Checkbox: Accept Terms -->
        <div class="form-options-row">
          <label class="checkbox-container">
            <input type="checkbox" v-model="acceptTerms" />
            <span class="custom-checkbox"></span>
            <span class="checkbox-label">Aceito os termos e condições</span>
          </label>
        </div>

        <!-- Submit Button -->
        <button type="submit" class="submit-btn">
          Criar Conta
          <svg viewBox="0 0 24 24" class="arrow-icon">
            <path stroke="currentColor" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </button>
      </form>

      <!-- Footer navigation -->
      <footer class="auth-footer">
        <span>Já tens conta?</span>
        <router-link to="/login" class="auth-footer-link">Iniciar Sessão</router-link>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 36px 16px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  color: #0f172a;
}

.auth-card {
  width: 100%;
  max-width: 380px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Trophy badge styling exactly as mockup */
.trophy-badge {
  background: #f1f2f4;
  border: 1px solid #e2e8f0;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.trophy-icon {
  width: 28px;
  height: 28px;
  fill: #0d1e36;
}

/* Gamify bold header */
.gamify-logo {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 2.35rem;
  font-weight: 900;
  color: #000000;
  letter-spacing: -0.01em;
  margin-bottom: 24px;
  line-height: 1;
}

/* Titles */
.auth-title {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 2.15rem;
  font-weight: 800;
  color: #0d1e36;
  text-align: center;
  margin-bottom: 4px;
}

.auth-subtitle {
  font-size: 0.95rem;
  color: #64748b;
  text-align: center;
  margin-bottom: 36px;
}

.error-banner {
  width: 100%;
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  margin-bottom: 16px;
  text-align: center;
}

/* Form inputs */
.auth-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 40px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #0d1e36;
}

.input-wrapper {
  position: relative;
  width: 100%;
}

.auth-input {
  width: 100%;
  background-color: #f1f2f4;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 14px 14px 44px;
  font-size: 0.95rem;
  font-weight: 500;
  color: #0f172a;
  outline: none;
  transition: all 0.2s ease;
}

/* Overwrite padding for input with no icon (Nome Completo) */
.auth-input.no-left-icon {
  padding-left: 16px;
}

.auth-input::placeholder {
  color: #a1a8b3;
}

.auth-input:focus {
  background-color: #ffffff;
  border-color: #94a3b8;
  box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.1);
}

.input-icon {
  width: 20px;
  height: 20px;
  fill: #64748b;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.left-icon {
  left: 14px;
}

.right-icon {
  right: 14px;
}

.eye-btn {
  background: none;
  border: none;
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  padding: 0 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Custom Circle Checkbox */
.form-options-row {
  display: flex;
  align-items: center;
  font-size: 0.82rem;
  margin-top: 2px;
}

.checkbox-container {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  user-select: none;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid #cbd5e1;
  background-color: #ffffff;
  display: inline-block;
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.checkbox-container input:checked ~ .custom-checkbox {
  background-color: #006c2b;
  border-color: #006c2b;
  box-shadow: inset 0 0 0 3px #ffffff;
}

.checkbox-label {
  color: #475569;
  font-weight: 500;
}

/* Green Submit Button exactly as mockup */
.submit-btn {
  background-color: #006c2b;
  color: #ffffff;
  width: 100%;
  border-radius: 8px;
  padding: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease, transform 0.1s ease;
  margin-top: 12px;
}

.submit-btn:hover {
  background-color: #005622;
}

.submit-btn:active {
  transform: scale(0.99);
}

.arrow-icon {
  width: 16px;
  height: 16px;
}

/* Footer link exactly as mockup */
.auth-footer {
  font-size: 0.9rem;
  color: #475569;
  display: flex;
  gap: 6px;
}

.auth-footer-link {
  color: #0d1e36;
  font-weight: 700;
}
</style>
