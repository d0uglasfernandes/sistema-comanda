import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const tenantId = request.headers.get('x-tenant-id');
    
    if (!tenantId) {
      return NextResponse.json(
        { error: 'Tenant ID required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    let startDate: Date;
    let endDate: Date = new Date();

    switch (type) {
      case 'daily':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'weekly':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'monthly':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid report type. Use daily, weekly, or monthly' },
          { status: 400 }
        );
    }

    const orders = await db.order.findMany({
      where: {
        tenantId,
        createdAt: {
          gte: startDate,
          lte: endDate,
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

    const totalOrders = orders.length;
    const paidOrders = orders.filter(order => order.status === 'PAID');
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalInCents, 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const productSales = new Map();
    
    orders.forEach(order => {
      order.items.forEach(item => {
        const existing = productSales.get(item.product.name) || {
          quantity: 0,
          revenue: 0,
        };
        
        productSales.set(item.product.name, {
          quantity: existing.quantity + item.quantity,
          revenue: existing.revenue + (item.unitPrice * item.quantity),
        });
      });
    });

    const topProducts = Array.from(productSales.entries())
      .map(([name, data]) => ({
        productName: name,
        quantitySold: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    const statusBreakdown = {
      OPEN: orders.filter(order => order.status === 'OPEN').length,
      CLOSED: orders.filter(order => order.status === 'CLOSED').length,
      PAID: orders.filter(order => order.status === 'PAID').length,
    };

    const report = {
      type,
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      summary: {
        totalOrders,
        paidOrders: paidOrders.length,
        totalRevenue,
        averageOrderValue,
        conversionRate: totalOrders > 0 ? (paidOrders.length / totalOrders) * 100 : 0,
      },
      statusBreakdown,
      topProducts,
      orders: orders.slice(0, 50).map(order => ({
        id: order.id,
        tableNumber: order.tableNumber,
        status: order.status,
        totalInCents: order.totalInCents,
        createdAt: order.createdAt,
        itemCount: order.items.length,
      })),
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error('Generate report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}