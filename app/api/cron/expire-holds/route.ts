import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const expired = await prisma.order.findMany({
    where: { status: "HELD", holdExpiresAt: { lte: new Date() } },
    select: { id: true, tierId: true, quantity: true }
  });
  let released = 0;
  for (const item of expired) {
    const changed = await prisma.$transaction(async tx => {
      const rows = await tx.$queryRaw<Array<{ id: string; tierId: string; quantity: number }>>`
        SELECT id, "tierId", quantity FROM "Order"
        WHERE id = ${item.id} AND status = 'HELD' AND "holdExpiresAt" <= NOW()
        FOR UPDATE
      `;
      if (!rows[0]) return false;
      await tx.order.update({ where: { id: item.id }, data: { status: "EXPIRED" } });
      await tx.ticketTier.update({ where: { id: item.tierId }, data: { heldQty: { decrement: item.quantity } } });
      return true;
    });
    if (changed) released++;
  }
  return NextResponse.json({ expiredHoldsReleased: released });
}
