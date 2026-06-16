<script setup>
import { ref, computed, onMounted } from 'vue'
import { useUserStore } from '../stores/user'

const userStore = useUserStore()

const activeCategory = ref('Todos')
const selectedPrize = ref(null)
const activePrizeDetails = ref(null)
const modalState = ref('idle') // 'idle' | 'confirm' | 'success' | 'insufficient'
const redeemedVoucherCode = ref('')

const prizes = ref([])

const loadPrizes = async () => {
  try {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const headers = {};
    if (savedUser.jwt) {
      headers['Authorization'] = `Bearer ${savedUser.jwt}`;
    }
    const response = await fetch('/api/prizes', { headers });
    const j = await response.json();
    if (j.data) {
      prizes.value = j.data.map(p => ({
        id: p.id,
        documentId: p.documentId,
        name: p.name,
        desc: p.description || '',
        cost: Number(p.cost) || 0,
        category: p.category || 'Merchandise',
        icon: p.icon || 'coffee',
        image: p.image || ''
      })).sort((a, b) => a.cost - b.cost);
    }
  } catch (err) {
    console.error('Erro ao carregar catálogo de prémios:', err);
  }
}

onMounted(async () => {
  await loadPrizes()
})

const progressPercent = computed(() => {
  return (userStore.xp / userStore.xpNextLevel) * 100
})

const filteredPrizes = computed(() => {
  if (activeCategory.value === 'Todos') {
    return prizes.value
  }
  return prizes.value.filter(p => p.category === activeCategory.value)
})

const openRedeemModal = (prize) => {
  selectedPrize.value = prize
  if (userStore.coins >= prize.cost) {
    modalState.value = 'confirm'
  } else {
    modalState.value = 'insufficient'
  }
}

const confirmRedemption = async () => {
  if (!selectedPrize.value) return;

  try {
    const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!savedUser.jwt) {
      alert('Sessão expirada. Por favor inicie sessão novamente.');
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${savedUser.jwt}`
    };

    const response = await fetch('/api/redemptions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        data: {
          user: savedUser.id,
          prize: selectedPrize.value.id,
          credits_spent: selectedPrize.value.cost
        }
      })
    });
    
    const j = await response.json();
    if (j.error) {
      throw new Error(j.error.message || 'Erro ao efetuar resgate.');
    }

    // Sincronizar o saldo do utilizador e histórico
    await userStore.syncFromBackend(savedUser, savedUser.jwt);

    // Recarregar os prémios para atualizar o stock disponível
    await loadPrizes();

    const abb = selectedPrize.value.name.substring(0, 3).toUpperCase()
    const rand = Math.floor(1000 + Math.random() * 9000)
    redeemedVoucherCode.value = `GMFY-${abb}-${rand}`
    modalState.value = 'success'
  } catch (err) {
    console.error('Erro no resgate:', err);
    alert(err.message || 'Erro ao efetuar resgate.');
    modalState.value = 'idle';
  }
}

const closeModal = () => {
  selectedPrize.value = null
  modalState.value = 'idle'
  redeemedVoucherCode.value = ''
}
</script>

<template>
  <div class="rewards-view animate-fade-in">
    <!-- Header dedicated matching mockup -->
    <header class="rewards-header">
      <button v-if="activePrizeDetails" class="back-btn" @click="activePrizeDetails = null">
        <!-- Arrow Left SVG -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="header-svg-icon">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
      </button>
      <div v-else style="width: 32px;"></div>

      <span class="header-logo-text">FANPRIZES</span>

      <div style="width: 32px;"></div>
    </header>

    <!-- DETAILED VIEW STATE -->
    <div v-if="activePrizeDetails" class="prize-detail-page-container animate-fade-in">
      <div class="prize-detail-image-card">
        <img v-if="activePrizeDetails.image" :src="activePrizeDetails.image" :alt="activePrizeDetails.name" class="prize-detail-img" />
        <div v-else class="prize-detail-icon-fallback">
          <!-- Coffee Icon -->
          <svg v-if="activePrizeDetails.icon === 'coffee'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="prize-svg-icon">
            <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
            <path d="M6 8h12M14 12H10a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2ZM6 5h1M17 5h1" />
          </svg>
          <!-- Hanger Icon -->
          <svg v-else-if="activePrizeDetails.icon === 'tshirt'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="prize-svg-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 7a2.5 2.5 0 0 1 2-2.5c.8-.1 1.7.3 2 1L12 10 8 5.5c.3-.7 1.2-1.1 2-1A2.5 2.5 0 0 1 12 7Z" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 10 3 17a1 1 0 0 0 .5 1.8h17a1 1 0 0 0 .5-1.8l-9-7Z" />
          </svg>
          <!-- Headphones Icon -->
          <svg v-else-if="activePrizeDetails.icon === 'headphones'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="prize-svg-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 14c0-4.97 4.03-9 9-9s9 4.03 9 9M3 14v3a3 3 0 0 0 3 3h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H3Zm18 0v3a3 3 0 0 1-3 3h-1a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3Z" />
          </svg>
          <!-- Ticket Icon -->
          <svg v-else-if="activePrizeDetails.icon === 'ticket'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="prize-svg-icon">
            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
            <path d="M13 5v2M13 17v2M13 11v2" />
          </svg>
          <!-- Crown Icon -->
          <svg v-else-if="activePrizeDetails.icon === 'crown'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="prize-svg-icon">
            <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
            <path d="M3 20h18" />
          </svg>
          <!-- Clapperboard Icon -->
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="prize-svg-icon">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 7h18M3 11h18M3 15v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5M3 11V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 3.5 8 7M11 3.5 13 7M16 3.5 18 7" />
          </svg>
        </div>
      </div>

      <h2 class="prize-detail-title">{{ activePrizeDetails.name }}</h2>
      <p class="prize-detail-desc">{{ activePrizeDetails.desc }}</p>

      <div class="prize-detail-cost-card">
        <div class="cost-row">
          <span class="cost-label">CUSTO</span>
          <div class="cost-price-container">
            <div class="cost-dollar-circle" :style="{ background: userStore.coins < activePrizeDetails.cost ? '#c5221f' : '#00873c' }">$</div>
            <span class="cost-value" :style="{ color: userStore.coins < activePrizeDetails.cost ? '#c5221f' : '#0b171e' }">{{ activePrizeDetails.cost }}</span>
          </div>
        </div>
        <button 
          @click="openRedeemModal(activePrizeDetails)" 
          class="resgatar-btn"
        >
          RESGATAR AGORA
        </button>
      </div>
    </div>

    <!-- CATALOG LIST STATE -->
    <div v-else>
      <!-- Page Title and Balance Row -->
      <div class="catalog-title-row">
        <h1 class="catalog-title">Catálogo de Prémios</h1>
        <div class="header-balance-pill">
          <span>{{ userStore.coins }}</span>
          <div class="dollar-circle">$</div>
        </div>
      </div>

      <!-- Category Pills horizontal scrollable -->
      <div class="categories-scroll">
        <button 
          @click="activeCategory = 'Todos'" 
          class="category-pill-custom" 
          :class="{ active: activeCategory === 'Todos' }"
        >
          Todos
        </button>
        <button 
          @click="activeCategory = 'Bilhetes'" 
          class="category-pill-custom" 
          :class="{ active: activeCategory === 'Bilhetes' }"
        >
          Bilhetes
        </button>
        <button 
          @click="activeCategory = 'Merchandise'" 
          class="category-pill-custom" 
          :class="{ active: activeCategory === 'Merchandise' }"
        >
          Merchandise
        </button>
        <button 
          @click="activeCategory = 'Vouchers'" 
          class="category-pill-custom" 
          :class="{ active: activeCategory === 'Vouchers' }"
        >
          Vouchers
        </button>
        <button 
          @click="activeCategory = 'VIP'" 
          class="category-pill-custom" 
          :class="{ active: activeCategory === 'VIP' }"
        >
          VIP
        </button>
      </div>

      <!-- Prizes Grid -->
      <div class="prizes-grid-custom">
        <div 
          v-for="prize in filteredPrizes" 
          :key="prize.id" 
          class="prize-card-custom"
          @click="activePrizeDetails = prize"
        >
          <!-- Affordable Dot Indicator -->
          <div v-if="userStore.coins >= prize.cost" class="affordable-dot"></div>

          <!-- Icon/Image Box -->
          <div class="prize-icon-wrapper-light">
            <img v-if="prize.image" :src="prize.image" :alt="prize.name" class="prize-card-img" />
            <template v-else>
              <!-- Coffee Icon -->
              <svg v-if="prize.icon === 'coffee'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="prize-svg-icon">
                <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
                <path d="M6 8h12M14 12H10a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2ZM6 5h1M17 5h1" />
              </svg>
              <!-- Hanger Icon -->
              <svg v-else-if="prize.icon === 'tshirt'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="prize-svg-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 7a2.5 2.5 0 0 1 2-2.5c.8-.1 1.7.3 2 1L12 10 8 5.5c.3-.7 1.2-1.1 2-1A2.5 2.5 0 0 1 12 7Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 10 3 17a1 1 0 0 0 .5 1.8h17a1 1 0 0 0 .5-1.8l-9-7Z" />
              </svg>
              <!-- Headphones Icon -->
              <svg v-else-if="prize.icon === 'headphones'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="prize-svg-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 14c0-4.97 4.03-9 9-9s9 4.03 9 9M3 14v3a3 3 0 0 0 3 3h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H3Zm18 0v3a3 3 0 0 1-3 3h-1a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3Z" />
              </svg>
              <!-- Ticket Icon -->
              <svg v-else-if="prize.icon === 'ticket'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="prize-svg-icon">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                <path d="M13 5v2M13 17v2M13 11v2" />
              </svg>
              <!-- Crown Icon -->
              <svg v-else-if="prize.icon === 'crown'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="prize-svg-icon">
                <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
                <path d="M3 20h18" />
              </svg>
              <!-- Clapperboard Icon -->
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="prize-svg-icon">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 7h18M3 11h18M3 15v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5M3 11V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 3.5 8 7M11 3.5 13 7M16 3.5 18 7" />
              </svg>
            </template>
          </div>

          <!-- Details -->
          <h3 class="prize-title-custom">{{ prize.name }}</h3>
          <p class="prize-desc-custom">{{ prize.desc }}</p>

          <!-- Price Badge -->
          <div v-if="userStore.coins < prize.cost" class="price-tag-insufficient">
            $ {{ prize.cost }}
          </div>
          <div v-else class="price-tag-green">
            $ {{ prize.cost }}
          </div>
        </div>
      </div>
    </div>

    <!-- Redemption Modal Popup -->
    <div v-if="modalState !== 'idle'" class="modal-backdrop" @click.self="closeModal">
      <div class="modal-content-card">
        <!-- Confirm State -->
        <div v-if="modalState === 'confirm'">
          <div class="modal-icon-box">
            <!-- Render Icon inside modal -->
            <svg v-if="selectedPrize.icon === 'coffee'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="prize-svg-icon">
              <path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" />
              <path d="M6 8h12M14 12H10a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2ZM6 5h1M17 5h1" />
            </svg>
            <svg v-else-if="selectedPrize.icon === 'tshirt'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="prize-svg-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 7a2.5 2.5 0 0 1 2-2.5c.8-.1 1.7.3 2 1L12 10 8 5.5c.3-.7 1.2-1.1 2-1A2.5 2.5 0 0 1 12 7Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 10 3 17a1 1 0 0 0 .5 1.8h17a1 1 0 0 0 .5-1.8l-9-7Z" />
            </svg>
            <svg v-else-if="selectedPrize.icon === 'headphones'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="prize-svg-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 14c0-4.97 4.03-9 9-9s9 4.03 9 9M3 14v3a3 3 0 0 0 3 3h1a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1H3Zm18 0v3a3 3 0 0 1-3 3h-1a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h3Z" />
            </svg>
            <svg v-else-if="selectedPrize.icon === 'ticket'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="prize-svg-icon">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              <path d="M13 5v2M13 17v2M13 11v2" />
            </svg>
            <svg v-else-if="selectedPrize.icon === 'crown'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="prize-svg-icon">
              <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
              <path d="M3 20h18" />
            </svg>
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="prize-svg-icon">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7h18M3 11h18M3 15v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5M3 11V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 3.5 8 7M11 3.5 13 7M16 3.5 18 7" />
            </svg>
          </div>
          <h2 class="modal-title-custom">Confirmar Resgate</h2>
          <p class="modal-desc">
            Deseja resgatar o prémio <span class="modal-prize-name">"{{ selectedPrize.name }}"</span> por <span class="modal-prize-cost">{{ selectedPrize.cost }} créditos</span>? O valor será debitado do seu saldo.
          </p>
          <div class="modal-buttons-row">
            <button @click="closeModal" class="modal-cancel-btn">Cancelar</button>
            <button @click="confirmRedemption" class="modal-confirm-btn">Confirmar</button>
          </div>
        </div>

        <!-- Success State -->
        <div v-else-if="modalState === 'success'">
          <div class="success-badge-icon">✓</div>
          <h2 class="modal-title-custom">Resgate Efetuado!</h2>
          <p class="modal-desc">
            Parabéns! O seu resgate foi registado com sucesso. Guarde o código do seu voucher abaixo:
          </p>
          <div class="voucher-code-box">
            {{ redeemedVoucherCode }}
          </div>
          <button @click="closeModal" class="modal-confirm-btn" style="width: 100%;">Fechar</button>
        </div>

        <!-- Insufficient State -->
        <div v-else-if="modalState === 'insufficient'">
          <div class="success-badge-icon" style="background:#fce8e6; color:#c5221f;">!</div>
          <h2 class="modal-title-custom">Saldo Insuficiente</h2>
          <p class="modal-desc">
            Não tem créditos suficientes para resgatar o prémio <span class="modal-prize-name">"{{ selectedPrize.name }}"</span>. Atualmente tem apenas <span class="modal-prize-cost" style="color:#c5221f;">{{ userStore.coins }} créditos</span>.
          </p>
          <button @click="closeModal" class="modal-confirm-btn" style="width: 100%;">Voltar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rewards-header {
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
.menu-btn {
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
}
.header-svg-icon {
  width: 24px;
  height: 24px;
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
.header-balance-pill {
  background: #f1f3f4;
  border-radius: 9999px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-heading);
  font-size: 0.9rem;
  font-weight: 700;
  color: #000000;
}
.dollar-circle {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #00873c;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
}

.catalog-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.catalog-title {
  font-family: var(--font-heading);
  font-size: 1.65rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 0;
}

/* Saldo Card */
.balance-card-black {
  background: #0b171e;
  border-radius: 12px;
  padding: 24px 20px;
  color: #ffffff;
  margin-bottom: 24px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
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
  color: #9ca3af;
}
.reward-next {
  font-weight: 500;
}
.reward-target {
  font-weight: 600;
  color: #22c55e;
}
.progress-bar-bg {
  background: #1e293b;
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

/* Category Pills */
.categories-scroll {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 24px;
  scrollbar-width: none;
}
.categories-scroll::-webkit-scrollbar {
  display: none;
}
.category-pill-custom {
  background: #f1f3f4;
  color: #374151;
  padding: 8px 16px;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}
.category-pill-custom.active {
  background: #0f172a;
  color: #ffffff;
}

/* Prizes Grid */
.prizes-grid-custom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 32px;
}
.prize-card-custom {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.02);
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease;
}
.prize-card-custom:hover {
  transform: translateY(-2px);
  border-color: #00a859;
}
.affordable-dot {
  width: 8px;
  height: 8px;
  background: #00a859;
  border-radius: 50%;
  position: absolute;
  top: 12px;
  right: 12px;
}
.prize-icon-wrapper-light {
  width: 60px;
  height: 60px;
  background: #f3f4f6;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  margin-bottom: 16px;
}
.prize-svg-icon {
  width: 28px;
  height: 28px;
}
.prize-title-custom {
  font-family: var(--font-heading);
  font-size: 0.95rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 4px;
  line-height: 1.2;
}
.prize-desc-custom {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 16px;
  min-height: 3.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.price-tag-green {
  background: #e6f4ea;
  color: #00873c;
  padding: 4px 12px;
  border-radius: 4px;
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 700;
  margin-top: auto;
}
.price-tag-insufficient {
  background: #fce8e6;
  color: #c5221f;
  padding: 4px 12px;
  border-radius: 4px;
  font-family: var(--font-heading);
  font-size: 0.85rem;
  font-weight: 700;
  margin-top: auto;
}

/* Modals */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  padding: 20px;
}
.modal-content-card {
  background: #ffffff;
  border-radius: 16px;
  width: 100%;
  max-width: 380px;
  padding: 24px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  text-align: center;
  position: relative;
  animation: modalScaleUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes modalScaleUp {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

.modal-title-custom {
  font-family: var(--font-heading);
  font-size: 1.25rem;
  font-weight: 700;
  color: #000000;
  margin-bottom: 12px;
}
.modal-icon-box {
  width: 72px;
  height: 72px;
  background: #f3f4f6;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px auto;
  color: #000000;
}
.modal-icon-box .prize-svg-icon {
  width: 36px;
  height: 36px;
}
.modal-desc {
  font-size: 0.9rem;
  color: #4b5563;
  line-height: 1.5;
  margin-bottom: 24px;
}
.modal-prize-name {
  font-weight: 700;
  color: #000000;
}
.modal-prize-cost {
  color: #00873c;
  font-weight: 800;
}
.modal-buttons-row {
  display: flex;
  gap: 12px;
}
.modal-confirm-btn {
  flex: 1;
  background: #006c2b;
  color: #ffffff;
  font-weight: 700;
  font-size: 0.95rem;
  padding: 12px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: background 0.2s ease;
}
.modal-confirm-btn:hover {
  background: #005622;
}
.modal-cancel-btn {
  flex: 1;
  background: #f3f4f6;
  color: #4b5563;
  font-weight: 600;
  font-size: 0.95rem;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background 0.2s ease;
}
.modal-cancel-btn:hover {
  background: #e5e7eb;
}
.success-badge-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #e6f4ea;
  color: #137333;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin: 0 auto 16px auto;
  font-weight: 800;
}
.voucher-code-box {
  background: #f9fafb;
  border: 2px dashed #00a859;
  border-radius: 8px;
  padding: 12px;
  font-family: var(--font-heading);
  font-size: 1.15rem;
  font-weight: 800;
  color: #000000;
  letter-spacing: 0.05em;
  margin-bottom: 20px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Detailed View Page Styles */
.prize-detail-page-container {
  display: flex;
  flex-direction: column;
  padding: 0 16px 32px 16px;
  background: #f8f9fa;
  min-height: calc(100vh - 120px);
}

.prize-detail-image-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 32px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
}

.prize-detail-img {
  max-width: 100%;
  max-height: 240px;
  object-fit: contain;
}

.prize-detail-icon-fallback {
  width: 120px;
  height: 120px;
  background: #f3f4f6;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
}

.prize-detail-icon-fallback .prize-svg-icon {
  width: 60px;
  height: 60px;
}

.prize-detail-title {
  font-family: var(--font-heading);
  font-size: 1.65rem;
  font-weight: 800;
  color: #0b171e;
  text-align: center;
  margin-bottom: 12px;
}

.prize-detail-desc {
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.6;
  text-align: center;
  margin-bottom: 32px;
  padding: 0 8px;
}

.prize-detail-cost-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.02);
  margin-top: auto;
}

.cost-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.cost-label {
  font-size: 0.85rem;
  font-weight: 700;
  color: #4b5563;
  letter-spacing: 0.05em;
}

.cost-price-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cost-dollar-circle {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #00873c;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 800;
}

.cost-value {
  font-family: var(--font-heading);
  font-size: 1.5rem;
  font-weight: 800;
  color: #0b171e;
}

.resgatar-btn {
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
  border: none;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 108, 43, 0.15);
  transition: background 0.2s ease, transform 0.1s ease;
}

.resgatar-btn:hover {
  background: #005622;
}

.resgatar-btn:active {
  transform: scale(0.99);
}

.resgatar-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  box-shadow: none;
}

.prize-card-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
}

.back-btn {
  background: transparent;
  border: none;
  color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: background 0.2s ease;
}
.back-btn:hover {
  background: #f3f4f6;
}
</style>
