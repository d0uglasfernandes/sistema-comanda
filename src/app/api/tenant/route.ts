import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    let tenant = await db.tenant.findFirst({
      where: { id: user.tenantId },
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });

    if (!tenant) {
      // Criar tenant padrão se não existir
      tenant = await db.tenant.create({
        data: {
          id: user.tenantId,
          name: 'Meu Bar',
        },
        select: {
          id: true,
          name: true,
          createdAt: true,
        },
      });
    }

    // Contar usuários, produtos e pedidos
    const userCount = await db.user.count({
      where: { tenantId: user.tenantId },
    });

    const productCount = await db.product.count({
      where: { tenantId: user.tenantId },
    });

    const orderCount = await db.order.count({
      where: { tenantId: user.tenantId },
    });

    const tenantWithStats = {
      ...tenant,
      stats: {
        users: userCount,
        products: productCount,
        orders: orderCount,
      },
    };

    return NextResponse.json(tenantWithStats);
  } catch (error) {
    console.error('Get tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { name } = await request.json();

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Tenant name is required' },
        { status: 400 }
      );
    }

    const updatedTenant = await db.tenant.update({
      where: { id: user.tenantId },
      data: { name: name.trim() },
    });

    return NextResponse.json(updatedTenant);
  } catch (error) {
    console.error('Update tenant error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}