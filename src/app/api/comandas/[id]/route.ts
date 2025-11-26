import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleOrderUpdate(request, params.id);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleOrderUpdate(request, params.id);
}

async function handleOrderUpdate(request: NextRequest, orderId: string) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { status } = await request.json();

    if (!status || !['OPEN', 'CLOSED', 'PAID'].includes(status)) {
      return NextResponse.json(
        { error: 'Valid status is required' },
        { status: 400 }
      );
    }

    const order = await db.order.findFirst({
      where: {
        id: orderId,
        tenantId: user.tenantId,
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const order = await db.order.findFirst({
      where: {
        id: params.id,
        tenantId: user.tenantId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Get order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}