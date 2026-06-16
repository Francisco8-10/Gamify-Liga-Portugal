import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: null,
    documentId: null,
    name: '',
    avatar: 'U',
    email: '',
    nif: '',
    address: '',
    level: 1,
    xp: 0,
    xpNextLevel: 500,
    coins: 0,
    streak: 3, // Streak is client-side mock
    gamesWatched: 0,
    ticketsPurchased: 0,
    nextRewardCost: 0,
    creditsEarned: 0,
    rescues: 0,
    achievements: [],
    recentActivities: []
  }),
  actions: {
    async syncFromBackend(user, token) {
      if (!user || !token) return;

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      try {
        // 1. Definições básicas do utilizador
        this.id = user.id;
        this.documentId = user.documentId;
        this.name = user.name || user.username || '';
        this.email = user.email || '';
        this.nif = user.vat || '';
        this.address = user.address || '';

        // Iniciais para o Avatar
        const parts = this.name.trim().split(' ');
        if (parts.length >= 2) {
          this.avatar = (parts[0][0] + parts[1][0]).toUpperCase();
        } else if (parts[0] && parts[0].length >= 2) {
          this.avatar = parts[0].substring(0, 2).toUpperCase();
        } else if (parts[0]) {
          this.avatar = parts[0][0].toUpperCase();
        } else {
          this.avatar = 'U';
        }

        // 2. Procurar Créditos (Ganhos de pontos)
        const resCredits = await fetch(`/api/credits?filters[user][id][$eq]=${user.id}`, { headers });
        const jCredits = await resCredits.json();
        const creditsList = jCredits.data || [];

        // 3. Procurar Resgates (Gastos de pontos)
        const resRedemptions = await fetch(`/api/redemptions?filters[user][id][$eq]=${user.id}&populate=*`, { headers });
        const jRedemptions = await resRedemptions.json();
        const redemptionsList = jRedemptions.data || [];

        // 4. Procurar Compras (Jogos assistidos / Bilhetes comprados)
        const resOrders = await fetch(`/api/orders?filters[user][id][$eq]=${user.id}&populate=*`, { headers });
        const jOrders = await resOrders.json();
        const ordersList = jOrders.data || [];

        // 5. Cálculos de Saldo e Créditos Acumulados
        const totalCreditsEarned = creditsList.reduce((sum, c) => sum + (c.amount || 0), 0);
        const totalCreditsSpent = redemptionsList.reduce((sum, r) => sum + (r.credits_spent || 0), 0);

        this.creditsEarned = totalCreditsEarned;
        this.coins = Math.max(0, totalCreditsEarned - totalCreditsSpent);
        this.rescues = redemptionsList.length;

        // 6. Cálculo dinâmico do Nível e XP baseado no total acumulado
        let totalXp = totalCreditsEarned;
        let lvl = 1;
        let xpNextLvl = 500;
        while (totalXp >= xpNextLvl) {
          totalXp -= xpNextLvl;
          lvl++;
          xpNextLvl = Math.round(xpNextLvl * 1.4);
        }
        this.level = lvl;
        this.xp = totalXp;
        this.xpNextLevel = xpNextLvl;

        // 7. Calcular Jogos Assistidos (Jogos com compras únicas)
        const uniqueGameIds = new Set();
        ordersList.forEach(order => {
          if (order.game?.documentId) {
            uniqueGameIds.add(order.game.documentId);
          } else if (order.game?.id) {
            uniqueGameIds.add(order.game.id);
          }
        });
        this.gamesWatched = uniqueGameIds.size;

        // 7. Calcular Bilhetes Comprados
        let totalTickets = 0;
        ordersList.forEach(order => {
          let tks = [];
          if (typeof order.tickets === 'string') {
            try {
              tks = JSON.parse(order.tickets);
            } catch (e) {
              tks = [];
            }
          } else if (Array.isArray(order.tickets)) {
            tks = order.tickets;
          }
          tks.forEach(tk => {
            totalTickets += Number(tk.qty) || 0;
          });
        });
        this.ticketsPurchased = totalTickets;

        // 8. Construir a lista combinada de Atividades Recentes
        const activities = [];
        
        creditsList.forEach(c => {
          activities.push({
            id: 'c-' + c.id,
            type: 'match',
            title: c.reason || 'Pontos Recebidos',
            date: c.createdAt ? new Date(c.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recente',
            value: c.amount,
            timestamp: c.createdAt ? new Date(c.createdAt).getTime() : 0
          });
        });

        redemptionsList.forEach(r => {
          const prizeName = r.prize?.name || 'Prémio';
          activities.push({
            id: 'r-' + r.id,
            type: 'rescue',
            title: `Resgate: ${prizeName}`,
            date: r.createdAt ? new Date(r.createdAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recente',
            value: -r.credits_spent,
            timestamp: r.createdAt ? new Date(r.createdAt).getTime() : 0
          });
        });

        // Ordenar atividades por data decrescente
        activities.sort((a, b) => b.timestamp - a.timestamp);
        this.recentActivities = activities;

        // Achievements are no longer tracked

        // 9. Calcular o custo do próximo prémio
        let nextCost = 0;
        try {
          const resPrizes = await fetch('/api/prizes', { headers });
          const jPrizes = await resPrizes.json();
          const prizesList = jPrizes.data || [];
          const sortedPrizes = prizesList
            .map(p => Number(p.cost) || 0)
            .sort((a, b) => a - b);
          
          // Encontrar o primeiro prémio que o utilizador NÃO consegue pagar
          const nextAffordable = sortedPrizes.find(cost => cost > this.coins);
          if (nextAffordable) {
            nextCost = nextAffordable;
          } else if (sortedPrizes.length > 0) {
            // Se consegue pagar todos, o target é o mais caro
            nextCost = sortedPrizes[sortedPrizes.length - 1];
          } else {
            nextCost = 500; // default fallback
          }
        } catch (err) {
          console.error('Erro ao calcular custo do próximo prémio:', err);
          nextCost = 500;
        }
        this.nextRewardCost = nextCost;

      } catch (err) {
        console.error('Erro na sincronização de dados:', err);
      }
    },
    async updateProfile(payload) {
      const authStore = useAuthStore();
      const token = authStore.token;
      const user = authStore.user;
      if (!user || !token) return false;

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      try {
        const response = await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify({
            name: payload.name,
            address: payload.address
          })
        });
        const j = await response.json();
        if (j.error) {
          throw new Error(j.error.message || 'Erro ao gravar no Strapi.');
        }

        const updatedUser = {
          ...authStore.user,
          name: j.name || j.username,
          vat: '',
          address: j.address || ''
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        authStore.user = updatedUser;

        await this.syncFromBackend(updatedUser, token);
        return true;
      } catch (err) {
        console.error('Erro ao atualizar perfil no Strapi:', err);
        throw err;
      }
    }
  }
})
