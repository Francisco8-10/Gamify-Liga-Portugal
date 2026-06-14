'use strict';

const prizesData = [
  // Categoria: Bilhetes
  {
    name: 'Bilhete de Oferta',
    description: '1 bilhete grátis para qualquer jogo da Liga Portugal',
    cost: 300,
    category: 'Bilhetes',
    icon: 'ticket'
  },
  {
    name: 'Pack Duo',
    description: '2 bilhetes grátis para o jogo à tua escolha',
    cost: 550,
    category: 'Bilhetes',
    icon: 'ticket'
  },
  // Categoria: Merchandise
  {
    name: 'Cachecol Oficial',
    description: 'Cachecol oficial da Liga Portugal',
    cost: 200,
    category: 'Merchandise',
    icon: 'tshirt'
  },
  {
    name: 'Camisola de Clube',
    description: 'Camisola oficial do clube à tua escolha',
    cost: 800,
    category: 'Merchandise',
    icon: 'tshirt'
  },
  {
    name: 'Kit Completo',
    description: 'Camisola + calções oficiais do clube à tua escolha',
    cost: 1400,
    category: 'Merchandise',
    icon: 'tshirt'
  },
  // Categoria: Vouchers
  {
    name: 'Voucher Loja Liga 10€',
    description: 'Desconto de 10€ na loja oficial da Liga Portugal',
    cost: 150,
    category: 'Vouchers',
    icon: 'ticket'
  },
  {
    name: 'Voucher Loja Liga 25€',
    description: 'Desconto de 25€ na loja oficial da Liga Portugal',
    cost: 350,
    category: 'Vouchers',
    icon: 'ticket'
  },
  {
    name: 'Voucher Sport Zone 20€',
    description: 'Desconto de 20€ em qualquer loja Sport Zone',
    cost: 250,
    category: 'Vouchers',
    icon: 'ticket'
  },
  {
    name: 'Voucher Decathlon 20€',
    description: 'Desconto de 20€ em qualquer loja Decathlon',
    cost: 250,
    category: 'Vouchers',
    icon: 'ticket'
  },
  // Categoria: VIP
  {
    name: 'Tour ao Estádio',
    description: 'Visita guiada ao estádio do clube à tua escolha',
    cost: 600,
    category: 'VIP',
    icon: 'crown'
  },
  {
    name: 'Experiência VIP',
    description: 'Lugar VIP + acesso ao camarote num jogo à tua escolha',
    cost: 2000,
    category: 'VIP',
    icon: 'crown'
  }
];

async function seed() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');
  console.log('Compiling Strapi context...');
  const appContext = await compileStrapi();
  console.log('Loading Strapi app...');
  const app = await createStrapi(appContext).load();

  try {
    console.log('Checking for existing prizes in Strapi...');
    // In Strapi v5, findMany is the way to get all documents of a type
    const existing = await strapi.documents('api::prize.prize').findMany();
    console.log(`Found ${existing.length} existing prizes.`);

    if (existing.length > 0) {
      console.log('Deleting existing prizes...');
      for (const p of existing) {
        await strapi.documents('api::prize.prize').delete({
          documentId: p.documentId
        });
        console.log(`Deleted prize: "${p.name}" (documentId: ${p.documentId})`);
      }
    }

    console.log('Seeding new prizes table...');
    for (const prize of prizesData) {
      await strapi.documents('api::prize.prize').create({
        data: prize
      });
      console.log(`Created prize: "${prize.name}"`);
    }
    console.log('Prizes seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    console.log('Shutting down Strapi...');
    await app.destroy();
  }
}

seed().then(() => {
  console.log('Done!');
  process.exit(0);
}).catch(err => {
  console.error('Seed process failed:', err);
  process.exit(1);
});
