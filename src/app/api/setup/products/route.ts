import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Criar produtos padrão para a nova empresa
    const beer = await db.product.create({
      data: {
        name: 'Cerveja',
        priceInCents: 800,
        tenantId: user.tenantId,
      },
    });

    const soda = await db.product.create({
      data: {
        name: 'Refrigerante',
        priceInCents: 600,
        tenantId: user.tenantId,
      },
    });

    const water = await db.product.create({
      data: {
        name: 'Água',
        priceInCents: 300,
        tenantId: user.tenantId,
      },
    });

    return NextResponse.json({
      message: 'Default products created successfully',
      products: [
        { name: beer.name, price: `R$ ${(beer.priceInCents / 100).toFixed(2)}` },
        { name: soda.name, price: `R$ ${(soda.priceInCents / 100).toFixed(2)}` },
        { name: water.name, price: `R$ ${(water.priceInCents / 100).toFixed(2)}` },
      ],
    });
  } catch (error) {
    console.error('Setup products error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}