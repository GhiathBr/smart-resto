import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';

export interface CartItemInput {
  menuItemId: string;
  quantity: number;
}

export interface CreateOrderInput {
  items: CartItemInput[];
}

export interface OrderWithItems {
  id: string;
  totalPrice: number;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  items: Array<{
    id: string;
    quantity: number;
    price: number;
    menuItem: {
      id: string;
      name: string;
      description: string;
      price: number;
    };
  }>;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderWithItems> {
  // Validate cart is not empty
  if (!input.items || input.items.length === 0) {
    throw new Error('Cart cannot be empty');
  }

  // Fetch menu items to validate and get prices
  const menuItemIds = input.items.map((item) => item.menuItemId);
  const menuItems = await prisma.menuItem.findMany({
    where: { id: { in: menuItemIds } },
  });

  // Validate all menu items exist
  if (menuItems.length !== menuItemIds.length) {
    throw new Error('One or more menu items not found');
  }

  // Create a map for quick lookup
  const menuItemMap = new Map(menuItems.map((item) => [item.id, item]));

  // Calculate total price
  let totalPrice = 0;
  const orderItems = input.items.map((item) => {
    const menuItem = menuItemMap.get(item.menuItemId);
    if (!menuItem) {
      throw new Error(`Menu item ${item.menuItemId} not found`);
    }
    const itemTotal = Number(menuItem.price) * item.quantity;
    totalPrice += itemTotal;
    return {
      menuItemId: item.menuItemId,
      quantity: item.quantity,
      price: Number(menuItem.price),
    };
  });

  // Generate unique order ID
  const orderId = `order_${nanoid(12)}`;

  // Create order with items in a transaction
  const order = await prisma.order.create({
    data: {
      id: orderId,
      totalPrice,
      status: 'pending',
      items: {
        create: orderItems,
      },
    },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  return order;
}

export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  return order;
}

export async function getAllOrders(): Promise<OrderWithItems[]> {
  const orders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          menuItem: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return orders;
}
