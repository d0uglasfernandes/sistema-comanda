import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTenantFromRequest } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantFromRequest(request);
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID required' },
        { status: 400 }
      );
    }

    const orders = await db.order.findMany({
      where: { tenantId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const tenantId = await getTenantFromRequest(request);
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID required' },
        { status: 400 }
      );
    }

    const { tableNumber, items } = await request.json();

    if (!tableNumber || !items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Table number and items are required' },
        { status: 400 }
      );
    }

    let totalInCents = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await db.product.findFirst({
        where: {
          id: item.productId,
          tenantId,
        },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      const itemTotal = product.priceInCents * item.quantity;
      totalInCents += itemTotal;

      orderItems.push({
        productId: product.id,
        quantity: item.quantity,
        unitPrice: product.priceInCents,
      });
    }

    const order = await db.order.create({
      data: {
        tableNumber,
        tenantId,
        totalInCents,
        status: 'OPEN',
        items: {
          create: orderItems,
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}