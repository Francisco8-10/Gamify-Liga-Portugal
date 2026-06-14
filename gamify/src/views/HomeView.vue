<script setup>
import { computed } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const progressPercent = computed(() => {
  return (userStore.xp / userStore.xpNextLevel) * 100
})
</script>

<template>
  <div class="home-view animate-fade-in">
    <!-- Header -->
    <header class="home-header">
      <div style="width: 32px;"></div>
      <span class="header-logo-text">GAMIFY</span>
      <div style="width: 32px;"></div>
    </header>

    <!-- Saldo Atual Card -->
    <div class="balance-card-black">
      <span class="balance-label">Saldo Atual</span>
      <div class="balance-value-row">
        <span class="balance-amount">{{ userStore.coins }}</span>
        <span class="balance-unit">créditos</span>
      </div>
      <div class="reward-progress-section">
        <div class="reward-labels">
          <span class="reward-next">Próximo Prémio</span>
          <span class="reward-target">{{ userStore.xpNextLevel }} pts</span>
        </div>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill-green" :style="{ width: `${progressPercent}%` }"></div>
        </div>
        <div class="progress-status-row">
          <span class="progress-percent-text">{{ Math.round(progressPercent) }}% completo</span>
        </div>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="stats-grid-custom">
      <div class="stat-card-light">
        <div class="stat-icon-wrapper">
          <!-- Soccer Ball Icon -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="green-icon-svg">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10zM2 12h20" />
          </svg>
        </div>
        <span class="stat-large-val">{{ userStore.gamesWatched }}</span>
        <span class="stat-subtext">Jogos Assistidos</span>
      </div>

      <div class="stat-card-light">
        <div class="stat-icon-wrapper">
          <!-- Ring/Gauge Icon -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="green-icon-svg">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6a6 6 0 1 1 0 12 6 6 0 0 1 0-12" stroke-dasharray="30 10" />
          </svg>
        </div>
        <span class="stat-large-val">{{ userStore.creditsEarned }}</span>
        <span class="stat-subtext">Créditos Ganhos</span>
      </div>

      <div class="stat-card-light full-width-stat">
        <div class="stat-icon-wrapper">
          <!-- Gift Box Icon -->
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="green-icon-svg">
            <path d="M20 12v10H4V12M2 7h20v5H2zM12 22V7M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
        </div>
        <span class="stat-large-val">{{ userStore.rescues }}</span>
        <span class="stat-subtext">Resgates</span>
      </div>
    </div>



    <!-- Atividade Recente Section -->
    <div class="section-container-custom">
      <h2 class="section-title-custom">Atividade Recente</h2>
      <div class="card-border-box activity-list-container">
        <div 
          v-for="(act, idx) in userStore.recentActivities" 
          :key="act.id" 
          class="activity-row-custom"
          :class="{ 'no-border': idx === userStore.recentActivities.length - 1 }"
        >
          <!-- Left Icon Circle -->
          <div class="activity-icon-circle" :class="act.type === 'match' ? 'green-bg-circle' : 'gray-bg-circle'">
            <!-- Soccer Icon -->
            <svg v-if="act.type === 'match'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="activity-svg">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10zM2 12h20" />
            </svg>
            <!-- Ticket Icon -->
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="activity-svg">
              <path d="M2 9a3 3 0 0 1 0 6v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3a3 3 0 0 1 0-6V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v3Z" />
              <path d="M9 4v16M15 4v16" stroke-dasharray="3 3" />
            </svg>
          </div>

          <!-- Middle Description -->
          <div class="activity-details-custom">
            <span class="activity-title-custom">{{ act.title }}</span>
            <span class="activity-date-custom">{{ act.date }}</span>
          </div>

          <!-- Right Value (+/-) -->
          <div class="activity-value-custom" :class="act.value > 0 ? 'value-positive' : 'value-negative'">
            {{ act.value > 0 ? `+${act.value}` : act.value }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-header {
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
  font-size: 1.25rem;
  font-weight: 800;
  color: #000000;
  letter-spacing: 0.05em;
}

/* Saldo Card */
.balance-card-black {
  background: #0b171e;
  border-radius: 12px;
  padding: 24px 20px;
  color: #ffffff;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}
.balance-label {
  font-size: 0.85rem;
  color: #9ca3af;
  font-weight: 500;
  display: block;
  margin-bottom: 8px;
}
.balance-value-row {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 20px;
}
.balance-amount {
  font-family: var(--font-heading);
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1;
}
.balance-unit {
  font-size: 1.1rem;
  color: #9ca3af;
  font-weight: 500;
}
.reward-progress-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.reward-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}
.reward-next {
  color: #ffffff;
  font-weight: 500;
}
.reward-target {
  color: #ffffff;
  font-weight: 600;
}
.progress-bar-bg {
  background: #1f2937;
  height: 6px;
  border-radius: 3px;
  width: 100%;
  overflow: hidden;
}
.progress-bar-fill-green {
  background: #00a859;
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}
.progress-status-row {
  display: flex;
  justify-content: flex-end;
}
.progress-percent-text {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Stats Grid */
.stats-grid-custom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}
.full-width-stat {
  grid-column: span 2;
}
.stat-card-light {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}
.stat-icon-wrapper {
  margin-bottom: 12px;
  color: #00a859;
  display: flex;
  align-items: center;
  justify-content: center;
}
.green-icon-svg {
  width: 28px;
  height: 28px;
}
.stat-large-val {
  font-family: var(--font-heading);
  font-size: 1.85rem;
  font-weight: 800;
  color: #000000;
  line-height: 1.2;
}
.stat-subtext {
  font-size: 0.75rem;
  color: #6b7280;
  font-weight: 500;
  margin-top: 4px;
}

/* Conquistas & Activity Sections */
.section-container-custom {
  margin-bottom: 32px;
}
.section-title-custom {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 16px;
}
.card-border-box {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
}


/* Activity list */
.activity-list-container {
  padding: 0 !important;
}
.activity-row-custom {
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}
.activity-row-custom.no-border {
  border-bottom: none;
}
.activity-icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}
.green-bg-circle {
  background: #e6f4ea;
  color: #137333;
}
.gray-bg-circle {
  background: #f1f3f4;
  color: #5f6368;
}
.activity-svg {
  width: 20px;
  height: 20px;
}
.activity-details-custom {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}
.activity-title-custom {
  font-size: 0.95rem;
  font-weight: 700;
  color: #000000;
}
.activity-date-custom {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
}
.activity-value-custom {
  font-family: var(--font-heading);
  font-size: 1rem;
  font-weight: 700;
}
.value-positive {
  color: #137333;
}
.value-negative {
  color: #c5221f;
}
</style>
