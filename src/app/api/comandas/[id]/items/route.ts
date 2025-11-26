import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: orderId } = await params;
    const { items } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    // Verificar se a comanda existe e pertence ao tenant
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

    // Verificar se a comanda está aberta
    if (order.status !== 'OPEN') {
      return NextResponse.json(
        { error: 'Cannot add items to a closed or paid order' },
        { status: 400 }
      );
    }

    let additionalTotal = 0;
    const orderItems = [];

    // Validar e processar os itens
    for (const item of items) {
      const product = await db.product.findFirst({
        where: {
          id: item.productId,
          tenantId: user.tenantId,
        },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      const itemTotal = product.priceInCents * item.quantity;
      additionalTotal += itemTotal;

      orderItems.push({
        orderId: orderId,
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.priceInCents,
      });
    }

    // Adicionar os novos itens e atualizar o total
    await db.$transaction([
      db.orderItem.createMany({
        data: orderItems,
      }),
      db.order.update({
        where: { id: orderId },
        data: {
          totalInCents: order.totalInCents + additionalTotal,
          updatedAt: new Date(),
        },
      }),
    ]);

    // Buscar a comanda atualizada
    const updatedOrder = await db.order.findUnique({
      where: { id: orderId },
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
    console.error('Add items to order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
