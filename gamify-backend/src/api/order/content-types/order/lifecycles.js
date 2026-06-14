'use strict';

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    if (!result) return;

    let ticketCount = 0;
    try {
      // Parse tickets if they are stored as a string or handle if they are an array/object
      const tickets = typeof result.tickets === 'string' ? JSON.parse(result.tickets) : result.tickets;
      if (Array.isArray(tickets)) {
        ticketCount = tickets.reduce((sum, t) => sum + (Number(t.qty) || Number(t.quantity) || 1), 0);
      } else if (tickets && typeof tickets === 'object') {
        ticketCount = Number(tickets.qty) || Number(tickets.quantity) || 1;
      } else {
        ticketCount = 1;
      }
    } catch (e) {
      ticketCount = 1;
    }

    // assign 100 points per ticket purchased
    const points = ticketCount * 100;

    // In Strapi v5, result.user is not populated by default on database afterCreate.
    // We get it from event.params.data.user, or query the document service with populated user.
    let userId = event.params?.data?.user || result.user?.id || result.user?.documentId || result.user;
    
    if (userId && typeof userId === 'object') {
      if (userId.connect && Array.isArray(userId.connect) && userId.connect.length > 0) {
        userId = userId.connect[0].id || userId.connect[0].documentId || userId.connect[0];
      } else {
        userId = userId.documentId || userId.id || null;
      }
    }

    if (!userId && (result.documentId || result.id)) {
      try {
        const orderWithUser = await strapi.documents('api::order.order').findOne({
          documentId: result.documentId || result.id,
          populate: ['user']
        });
        userId = orderWithUser?.user?.documentId || orderWithUser?.user?.id;
      } catch (err) {
        console.error('[Lifecycle Hook] Erro ao carregar relação user:', err);
      }
    }

    if (userId) {
      try {
        await strapi.documents('api::credit.credit').create({
          data: {
            user: userId,
            amount: points,
            reason: `Compra de ${ticketCount} bilhete(s) para o jogo "${result.eventName || 'Jogo'}"`
          }
        });
        console.log(`[Lifecycle Hook] Atribuídos ${points} pontos ao utilizador (ID: ${userId}) para a compra (ID: ${result.orderId})`);
      } catch (err) {
        console.error('[Lifecycle Hook] Erro ao atribuir pontos ao utilizador:', err);
      }
    } else {
      console.log(`[Lifecycle Hook] Nenhuma conta de utilizador associada à compra ${result.orderId}. Pontos não atribuídos.`);
    }
  }
};
