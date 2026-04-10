import prisma from '@/lib/prisma';
import { nanoid } from 'nanoid';
import { emitOrderCreated, emitOrderUpdated } from '@/lib/socket';

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
  orderItems: Array<{
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
      status: 'PENDING',
      orderItems: {
        create: orderItems,
      },
    },
    include: {
      orderItems: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  // Emit real-time event
  try {
    emitOrderCreated(order);
  } catch (error) {
    console.error('Failed to emit order created event:', error);
  }

  return order as any;
}

export async function getOrderById(orderId: string): Promise<OrderWithItems | null> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      orderItems: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  return order as any;
}

export async function getAllOrders(): Promise<OrderWithItems[]> {
  const orders = await prisma.order.findMany({
    include: {
      orderItems: {
        include: {
          menuItem: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return orders as any;
}


// Valid status transitions
const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['PREPARING'],
  PREPARING: ['DELIVERED'],
  DELIVERED: [], // Final state
};

export async function updateOrderStatus(
  orderId: string,
  newStatus: 'PENDING' | 'PREPARING' | 'DELIVERED'
): Promise<OrderWithItems> {
  // Get current order
  const currentOrder = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!currentOrder) {
    throw new Error('Order not found');
  }

  // Validate status transition
  const allowedTransitions = STATUS_TRANSITIONS[currentOrder.status];
  if (!allowedTransitions.includes(newStatus)) {
    throw new Error(
      `Invalid status transition: ${currentOrder.status} → ${newStatus}`
    );
  }

  // Update order status
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
    include: {
      orderItems: {
        include: {
          menuItem: true,
        },
      },
    },
  });

  // Emit real-time event
  try {
    emitOrderUpdated(updatedOrder);
  } catch (error) {
    console.error('Failed to emit order updated event:', error);
  }

  return updatedOrder as any;
}
