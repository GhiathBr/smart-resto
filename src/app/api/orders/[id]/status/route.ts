import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus } from '@/services/order.service';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !['PENDING', 'PREPARING', 'DELIVERED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be PENDING, PREPARING, or DELIVERED' },
        { status: 400 }
      );
    }

    const updatedOrder = await updateOrderStatus(id, status);

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update order status' },
      { status: 400 }
    );
  }
}
