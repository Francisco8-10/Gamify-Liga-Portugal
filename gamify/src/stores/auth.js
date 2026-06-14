import { defineStore } from 'pinia'
import { useUserStore } from './user'

export const useAuthStore = defineStore('auth', {
  state: () => {
    const savedUser = JSON.parse(localStorage.getItem('user') || 'null');
    return {
      isAuthenticated: !!savedUser,
      userEmail: savedUser ? savedUser.email : '',
      token: savedUser ? savedUser.jwt : null,
      user: savedUser || null
    };
  },
  actions: {
    async login(email, password) {
      try {
        const response = await fetch('/api/auth/local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier: email,
            password: password
          })
        });
        const j = await response.json();
        if (j.error) {
          throw new Error(j.error.message || 'Credenciais inválidas no backend Strapi.');
        }

        const userData = {
          id: j.user.id,
          documentId: j.user.documentId,
          name: j.user.name || j.user.username,
          email: j.user.email,
          vat: j.user.vat || '',
          address: j.user.address || '',
          jwt: j.jwt
        };

        localStorage.setItem('user', JSON.stringify(userData));
        this.isAuthenticated = true;
        this.userEmail = userData.email;
        this.token = userData.jwt;
        this.user = userData;

        const userStore = useUserStore();
        await userStore.syncFromBackend(userData, userData.jwt);
        return true;
      } catch (err) {
        console.error('Erro no login:', err);
        throw err;
      }
    },
    async register(name, email, phone, password) {
      try {
        // 1. Registar campos padrão (username, email, password)
        const response = await fetch('/api/auth/local/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: email,
            email: email,
            password: password
          })
        });
        const j = await response.json();
        if (j.error) {
          throw new Error(j.error.message || 'Erro no registo.');
        }

        // 2. Atualizar campos adicionais (name) usando o token JWT retornado
        const updateResponse = await fetch(`/api/users/${j.user.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${j.jwt}`
          },
          body: JSON.stringify({
            name: name
          })
        });
        const jUpdate = await updateResponse.json();
        if (jUpdate.error) {
          throw new Error(jUpdate.error.message || 'Erro ao guardar dados do perfil.');
        }

        const userData = {
          id: j.user.id,
          documentId: j.user.documentId,
          name: jUpdate.name || j.user.username,
          email: j.user.email,
          vat: '',
          address: jUpdate.address || '',
          jwt: j.jwt
        };

        localStorage.setItem('user', JSON.stringify(userData));
        this.isAuthenticated = true;
        this.userEmail = userData.email;
        this.token = userData.jwt;
        this.user = userData;

        const userStore = useUserStore();
        await userStore.syncFromBackend(userData, userData.jwt);
        return true;
      } catch (err) {
        console.error('Erro no registo:', err);
        throw err;
      }
    },
    logout() {
      localStorage.removeItem('user');
      this.isAuthenticated = false;
      this.userEmail = '';
      this.token = null;
      this.user = null;
      
      const userStore = useUserStore();
      userStore.$reset();
    }
  }
})
