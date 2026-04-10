import prisma from '@/lib/prisma';

export interface DailyAnalytics {
  date: string;
  revenue: number;
  orderCount: number;
  averageOrderValue: number;
}

export async function getDailyAnalytics(date?: Date): Promise<DailyAnalytics> {
  const targetDate = date || new Date();
  
  // Start and end of the day
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all delivered orders for the day
  const orders = await prisma.order.findMany({
    where: {
      status: 'DELIVERED',
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  const orderCount = orders.length;
  const revenue = orders.reduce((sum, order) => sum + Number(order.totalPrice), 0);
  const averageOrderValue = orderCount > 0 ? revenue / orderCount : 0;

  return {
    date: targetDate.toISOString().split('T')[0],
    revenue: Number(revenue.toFixed(2)),
    orderCount,
    averageOrderValue: Number(averageOrderValue.toFixed(2)),
  };
}

export async function getWeeklyAnalytics(): Promise<DailyAnalytics[]> {
  const analytics: DailyAnalytics[] = [];
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dayAnalytics = await getDailyAnalytics(date);
    analytics.push(dayAnalytics);
  }

  return analytics;
}
