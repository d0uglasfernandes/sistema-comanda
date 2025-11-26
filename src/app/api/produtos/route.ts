import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getTenantFromRequest, getUserFromRequest } from '@/lib/auth-utils';

export async function GET(request: NextRequest) {
  try {
    const tenantId = await getTenantFromRequest(request);
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID required' },
        { status: 400 }
      );
    }

    const products = await db.product.findMany({
      where: { tenantId },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Get products error:', error);
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
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (!['ADMIN', 'CAIXA'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const { name, priceInCents } = await request.json();

    if (!name || priceInCents === undefined) {
      return NextResponse.json(
        { error: 'Name and price are required' },
        { status: 400 }
      );
    }

    const product = await db.product.create({
      data: {
        name,
        priceInCents,
        tenantId: user.tenantId,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}