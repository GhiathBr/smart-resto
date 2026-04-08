import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { hashPassword } from '../src/services/auth.service';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  console.log('Creating admin user...');
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@restaurant.com' },
    update: {},
    create: {
      email: 'admin@restaurant.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✓ Admin user created:', admin.email);

  // Create staff user
  console.log('Creating staff user...');
  const staffPassword = await hashPassword('staff123');
  const staff = await prisma.user.upsert({
    where: { email: 'staff@restaurant.com' },
    update: {},
    create: {
      email: 'staff@restaurant.com',
      passwordHash: staffPassword,
      role: 'STAFF',
    },
  });
  console.log('✓ Staff user created:', staff.email);

  // Create categories
  console.log('Creating categories...');
  const pizzaCategory = await prisma.category.upsert({
    where: { name: 'Pizzas' },
    update: {},
    create: { name: 'Pizzas' },
  });

  const burgerCategory = await prisma.category.upsert({
    where: { name: 'Burgers' },
    update: {},
    create: { name: 'Burgers' },
  });

  const drinkCategory = await prisma.category.upsert({
    where: { name: 'Drinks' },
    update: {},
    create: { name: 'Drinks' },
  });

  const dessertCategory = await prisma.category.upsert({
    where: { name: 'Desserts' },
    update: {},
    create: { name: 'Desserts' },
  });

  console.log('✓ Categories created');

  // Create menu items
  console.log('Creating menu items...');

  // Pizzas
  await prisma.menuItem.upsert({
    where: { id: 'pizza-margherita' },
    update: {},
    create: {
      id: 'pizza-margherita',
      name: 'Margherita Pizza',
      description: 'Classic pizza with tomato sauce, mozzarella, and fresh basil',
      price: 12.99,
      categoryId: pizzaCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
    },
  });

  await prisma.menuItem.upsert({
    where: { id: 'pizza-pepperoni' },
    update: {},
    create: {
      id: 'pizza-pepperoni',
      name: 'Pepperoni Pizza',
      description: 'Loaded with pepperoni, mozzarella cheese, and tomato sauce',
      price: 14.99,
      categoryId: pizzaCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800',
    },
  });

  await prisma.menuItem.upsert({
    where: { id: 'pizza-veggie' },
    update: {},
    create: {
      id: 'pizza-veggie',
      name: 'Veggie Supreme',
      description: 'Fresh vegetables including bell peppers, mushrooms, onions, and olives',
      price: 13.99,
      categoryId: pizzaCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1511689660979-10d2b1aada49?w=800',
    },
  });

  // Burgers
  await prisma.menuItem.upsert({
    where: { id: 'burger-classic' },
    update: {},
    create: {
      id: 'burger-classic',
      name: 'Classic Burger',
      description: 'Juicy beef patty with lettuce, tomato, onion, and special sauce',
      price: 10.99,
      categoryId: burgerCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800',
    },
  });

  await prisma.menuItem.upsert({
    where: { id: 'burger-cheese' },
    update: {},
    create: {
      id: 'burger-cheese',
      name: 'Cheeseburger',
      description: 'Classic burger with melted cheddar cheese',
      price: 11.99,
      categoryId: burgerCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=800',
    },
  });

  await prisma.menuItem.upsert({
    where: { id: 'burger-chicken' },
    update: {},
    create: {
      id: 'burger-chicken',
      name: 'Chicken Burger',
      description: 'Crispy chicken breast with mayo, lettuce, and pickles',
      price: 9.99,
      categoryId: burgerCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800',
    },
  });

  // Drinks
  await prisma.menuItem.upsert({
    where: { id: 'drink-coke' },
    update: {},
    create: {
      id: 'drink-coke',
      name: 'Coca-Cola',
      description: 'Classic Coca-Cola soft drink',
      price: 2.99,
      categoryId: drinkCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=800',
    },
  });

  await prisma.menuItem.upsert({
    where: { id: 'drink-water' },
    update: {},
    create: {
      id: 'drink-water',
      name: 'Mineral Water',
      description: 'Refreshing mineral water',
      price: 1.99,
      categoryId: drinkCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=800',
    },
  });

  await prisma.menuItem.upsert({
    where: { id: 'drink-juice' },
    update: {},
    create: {
      id: 'drink-juice',
      name: 'Orange Juice',
      description: 'Freshly squeezed orange juice',
      price: 3.99,
      categoryId: drinkCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=800',
    },
  });

  // Desserts
  await prisma.menuItem.upsert({
    where: { id: 'dessert-tiramisu' },
    update: {},
    create: {
      id: 'dessert-tiramisu',
      name: 'Tiramisu',
      description: 'Classic Italian dessert with coffee-soaked ladyfingers and mascarpone',
      price: 6.99,
      categoryId: dessertCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=800',
    },
  });

  await prisma.menuItem.upsert({
    where: { id: 'dessert-cheesecake' },
    update: {},
    create: {
      id: 'dessert-cheesecake',
      name: 'New York Cheesecake',
      description: 'Creamy cheesecake with graham cracker crust',
      price: 7.99,
      categoryId: dessertCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?w=800',
    },
  });

  await prisma.menuItem.upsert({
    where: { id: 'dessert-brownie' },
    update: {},
    create: {
      id: 'dessert-brownie',
      name: 'Chocolate Brownie',
      description: 'Rich chocolate brownie served warm with vanilla ice cream',
      price: 5.99,
      categoryId: dessertCategory.id,
      imageUrl: 'https://images.unsplash.com/photo-1607920591413-4ec007e70023?w=800',
    },
  });

  console.log('✓ Menu items created');

  console.log('\n✅ Database seeded successfully!');
  console.log('\n📝 Login credentials:');
  console.log('   Admin: admin@restaurant.com / admin123');
  console.log('   Staff: staff@restaurant.com / staff123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
