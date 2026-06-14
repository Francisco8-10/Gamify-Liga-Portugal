import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useQuestsStore = defineStore('quests', {
  state: () => ({
    dailyQuests: [
      { id: 1, text: 'Completar 25 min de foco (Pomodoro)', xp: 50, coins: 15, completed: false, category: 'Foco' },
      { id: 2, text: 'Planear tarefas e objetivos do dia', xp: 30, coins: 10, completed: false, category: 'Organização' },
      { id: 3, text: 'Beber 2L de água ao longo do dia', xp: 20, coins: 5, completed: false, category: 'Saúde' },
      { id: 4, text: 'Ler 10 páginas de um livro', xp: 40, coins: 15, completed: false, category: 'Estudo' }
    ],
    weeklyQuests: [
      { id: 101, text: 'Completar 10 sessões de foco', xp: 200, coins: 80, completed: false, category: 'Foco' },
      { id: 102, text: 'Estudar ou ler por 5 horas no total', xp: 150, coins: 60, completed: false, category: 'Estudo' },
      { id: 103, text: 'Finalizar todos os objetivos diários em 3 dias', xp: 250, coins: 100, completed: false, category: 'Consistência' }
    ]
  }),
  actions: {
    completeQuest(id, isWeekly = false) {
      const userStore = useUserStore()
      const questList = isWeekly ? this.weeklyQuests : this.dailyQuests
      const quest = questList.find(q => q.id === id)
      
      if (quest && !quest.completed) {
        quest.completed = true
        userStore.addXp(quest.xp)
        userStore.addCoins(quest.coins)
        
        return true
      }
      return false
    },
    resetDailyQuests() {
      this.dailyQuests.forEach(q => q.completed = false)
    },
    resetWeeklyQuests() {
      this.weeklyQuests.forEach(q => q.completed = false)
    }
  }
})
