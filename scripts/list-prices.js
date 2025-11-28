const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const items = await prisma.menuItem.findMany({
    include: { category: true },
    orderBy: [{ category: { sortOrder: 'asc' } }, { name: 'asc' }]
  });
  
  for (const item of items) {
    console.log(item.category.name + ' | ' + item.name + ' | $' + item.price);
  }
}

main().finally(() => prisma.$disconnect());

