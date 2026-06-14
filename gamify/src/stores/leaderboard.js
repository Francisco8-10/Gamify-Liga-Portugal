import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useLeaderboardStore = defineStore('leaderboard', {
  state: () => ({
    bots: [
      { id: 'b1', name: 'Sofia Silva', level: 6, xp: 850, avatar: 'SS' },
      { id: 'b2', name: 'Pedro Costa', level: 4, xp: 520, avatar: 'PC' },
      { id: 'b3', name: 'João Santos', level: 3, xp: 390, avatar: 'JS' },
      { id: 'b4', name: 'Ana Oliveira', level: 2, xp: 210, avatar: 'AO' },
      { id: 'b5', name: 'Mariana Pires', level: 1, xp: 190, avatar: 'MP' },
      { id: 'b6', name: 'Tiago Dias', level: 1, xp: 110, avatar: 'TD' }
    ]
  }),
  getters: {
    rankings() {
      const userStore = useUserStore()
      
      // Map user to the same format as bots
      const userEntry = {
        id: 'user',
        name: userStore.name + ' (Tu)',
        level: userStore.level,
        // Approximate total XP across levels
        totalPower: userStore.level * 1000 + userStore.xp,
        avatar: userStore.avatar,
        isUser: true
      }
      
      const botsMapped = this.bots.map(bot => ({
        ...bot,
        totalPower: bot.level * 1000 + bot.xp,
        isUser: false
      }))
      
      // Combine and sort by totalPower descending
      const combined = [...botsMapped, userEntry]
      combined.sort((a, b) => b.totalPower - a.totalPower)
      
      // Add ranking field
      return combined.map((player, index) => ({
        ...player,
        rank: index + 1
      }))
    }
  }
})
