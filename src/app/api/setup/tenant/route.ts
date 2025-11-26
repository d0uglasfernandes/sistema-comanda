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

    const { companyName } = await request.json();

    if (!companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Verificar se o tenant já existe
    let tenant = await db.tenant.findUnique({
      where: { id: user.tenantId }
    });

    if (!tenant) {
      // Criar novo tenant
      tenant = await db.tenant.create({
        data: {
          id: user.tenantId,
          name: companyName,
          roles: ['ADMIN', 'BARTENDER'],
        }
      });
    } else {
      // Atualizar nome do tenant existente
      tenant = await db.tenant.update({
        where: { id: user.tenantId },
        data: { name: companyName }
      });
    }

    return NextResponse.json({
      message: 'Tenant configured successfully',
      tenant: {
        id: tenant.id,
        name: tenant.name,
        roles: tenant.roles,
      }
    });
  } catch (error) {
    console.error('Tenant setup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}