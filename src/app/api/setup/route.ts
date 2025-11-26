import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

export async function POST() {
  try {
    const tenantId = 'demo-tenant';
    
    const existingAdmin = await db.user.findFirst({
      where: {
        email: 'admin@demo.com',
        tenantId,
      },
    });

    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin user already exists' });
    }

    const passwordHash = await bcrypt.hash('admin123', 10);

    const admin = await db.user.create({
      data: {
        email: 'admin@demo.com',
        name: 'Administrador',
        passwordHash,
        role: 'ADMIN',
        tenantId,
        theme: 'light',
      },
    });

    const caixaPasswordHash = await bcrypt.hash('caixa123', 10);
    
    const caixa = await db.user.create({
      data: {
        email: 'caixa@demo.com',
        name: 'Caixa',
        passwordHash: caixaPasswordHash,
        role: 'CAIXA',
        tenantId,
        theme: 'light',
      },
    });

    const garcomPasswordHash = await bcrypt.hash('garcom123', 10);
    
    const garcom = await db.user.create({
      data: {
        email: 'garcom@demo.com',
        name: 'Garçom',
        passwordHash: garcomPasswordHash,
        role: 'GARCOM',
        tenantId,
        theme: 'light',
      },
    });

    const beer = await db.product.create({
      data: {
        name: 'Cerveja',
        priceInCents: 800,
        tenantId,
      },
    });

    const soda = await db.product.create({
      data: {
        name: 'Refrigerante',
        priceInCents: 600,
        tenantId,
      },
    });

    const water = await db.product.create({
      data: {
        name: 'Água',
        priceInCents: 300,
        tenantId,
      },
    });

    return NextResponse.json({
      message: 'Demo data created successfully',
      users: [
        { email: admin.email, role: admin.role, password: 'admin123' },
        { email: caixa.email, role: caixa.role, password: 'caixa123' },
        { email: garcom.email, role: garcom.role, password: 'garcom123' },
      ],
      products: [
        { name: beer.name, price: `R$ ${(beer.priceInCents / 100).toFixed(2)}` },
        { name: soda.name, price: `R$ ${(soda.priceInCents / 100).toFixed(2)}` },
        { name: water.name, price: `R$ ${(water.priceInCents / 100).toFixed(2)}` },
      ],
      tenantId,
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}