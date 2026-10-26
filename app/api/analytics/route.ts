import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Demo endpoint: add session authentication and organizer ownership checks before production use.
export async function GET() {
  try {
    const [paid, allOrders, events] = await Promise.all([
      prisma.order.aggregate({ where: { status: "PAID" }, _sum: { totalCents: true }, _count: true }),
      prisma.order.count(),
      prisma.event.count()
    ]);
    return NextResponse.json({
      revenueCents: paid._sum.totalCents ?? 0,
      paidOrders: paid._count,
      totalOrders: allOrders,
      conversionRate: allOrders ? Math.round(paid._count / allOrders * 1000) / 10 : 0,
      events
    });
  } catch {
    return NextResponse.json({ error: "Analytics unavailable. Check database configuration." }, { status: 503 });
  }
}
