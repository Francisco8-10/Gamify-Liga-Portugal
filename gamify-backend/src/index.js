'use strict';

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  async bootstrap({ strapi }) {
    console.log('Configurando permissões automáticas...');
    try {
      // 1. Obter funções
      const roles = await strapi.documents('plugin::users-permissions.role').findMany();
      const publicRole = roles.find(r => r.type === 'public');
      const authenticatedRole = roles.find(r => r.type === 'authenticated');

      if (publicRole) {
        // Encontrar todas as permissões associadas à role Public e atualizar
        const currentPermissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
          where: { role: publicRole.id }
        });
        
        const publicActions = [
          { action: 'api::game.game.find', actionType: 'find' },
          { action: 'api::game.game.findOne', actionType: 'findOne' },
          { action: 'api::team.team.find', actionType: 'find' },
          { action: 'api::team.team.findOne', actionType: 'findOne' }
        ];

        for (const act of publicActions) {
          const exists = currentPermissions.some(p => p.action === act.action);
          if (!exists) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action: act.action,
                role: publicRole.id
              }
            });
          }
        }
      }

      if (authenticatedRole) {
        const currentPermissions = await strapi.db.query('plugin::users-permissions.permission').findMany({
          where: { role: authenticatedRole.id }
        });

        const authActions = [
          { action: 'api::game.game.find' },
          { action: 'api::game.game.findOne' },
          { action: 'api::game.game.create' },
          { action: 'api::game.game.update' },
          { action: 'api::game.game.destroy' },
          { action: 'api::team.team.find' },
          { action: 'api::team.team.findOne' },
          { action: 'api::team.team.create' },
          { action: 'api::team.team.update' },
          { action: 'api::team.team.destroy' },
          { action: 'api::prize.prize.find' },
          { action: 'api::prize.prize.findOne' },
          { action: 'api::order.order.create' },
          { action: 'api::order.order.find' },
          { action: 'api::order.order.findOne' },
          { action: 'api::redemption.redemption.create' },
          { action: 'api::redemption.redemption.find' },
          { action: 'api::redemption.redemption.findOne' },
          { action: 'api::credit.credit.find' },
          { action: 'api::credit.credit.findOne' },
          { action: 'plugin::users-permissions.user.find' },
          { action: 'plugin::users-permissions.user.findOne' },
          { action: 'plugin::users-permissions.user.update' }
        ];

        for (const act of authActions) {
          const exists = currentPermissions.some(p => p.action === act.action);
          if (!exists) {
            await strapi.db.query('plugin::users-permissions.permission').create({
              data: {
                action: act.action,
                role: authenticatedRole.id
              }
            });
          }
        }
      }
      console.log('Permissões do Strapi configuradas com sucesso! 🎉');
    } catch (err) {
      console.error('Erro ao configurar permissões no bootstrap:', err);
    }
  },
};
