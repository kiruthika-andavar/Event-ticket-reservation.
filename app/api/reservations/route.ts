import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const bodySchema = z.object({
  userId: z.string().min(1),
  eventId: z.string().min(1),
  tierId: z.string().min(1),
  quantity: z.number().int().min(1).max(10)
});

export async function POST(req: NextRequest) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid reservation input." }, { status: 400 });
  const { userId, eventId, tierId, quantity } = parsed.data;
  try {
    const order = await prisma.$transaction(async tx => {
      // Lock the inventory row so concurrent requests cannot oversell.
      const rows = await tx.$queryRaw<Array<{ id: string; totalQty: number; soldQty: number; heldQty: number; priceCents: number }>>`
        SELECT id, "totalQty", "soldQty", "heldQty", "priceCents"
        FROM "TicketTier" WHERE id = ${tierId} AND "eventId" = ${eventId} FOR UPDATE
      `;
      const tier = rows[0];
      if (!tier) throw new Error("TIER_NOT_FOUND");
      const event = await tx.event.findUnique({ where: { id: eventId } });
      if (!event || !event.published || event.salesCutoffAt <= new Date()) throw new Error("SALES_CLOSED");
      if (tier.totalQty - tier.soldQty - tier.heldQty < quantity) throw new Error("SOLD_OUT");
      await tx.ticketTier.update({ where: { id: tierId }, data: { heldQty: { increment: quantity } } });
      return tx.order.create({
        data: { userId, eventId, tierId, quantity, totalCents: tier.priceCents * quantity,
          status: "HELD", holdExpiresAt: new Date(Date.now() + 10 * 60 * 1000) }
      });
    }, { isolationLevel: "Serializable", timeout: 10000 });
    return NextResponse.json({ orderId: order.id, status: order.status, holdExpiresAt: order.holdExpiresAt, totalCents: order.totalCents }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    const status = ["SOLD_OUT", "SALES_CLOSED"].includes(message) ? 409 : message === "TIER_NOT_FOUND" ? 404 : 503;
    return NextResponse.json({ error: status === 503 ? "Reservation failed. Verify database setup and retry." : message }, { status });
  }
}
