import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const schema = z.object({ orderId: z.string().min(1), outcome: z.enum(["approve", "reject"]) });

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Provide orderId and outcome approve/reject." }, { status: 400 });
  const { orderId, outcome } = parsed.data;
  // Mock asynchronous gateway delay. Production should use a provider webhook/job queue.
  await new Promise(resolve => setTimeout(resolve, 900));
  try {
    const result = await prisma.$transaction(async tx => {
      const rows = await tx.$queryRaw<Array<{ id: string; tierId: string; quantity: number; totalCents: number; status: string; holdExpiresAt: Date }>>`
        SELECT id, "tierId", quantity, "totalCents", status, "holdExpiresAt"
        FROM "Order" WHERE id = ${orderId} FOR UPDATE
      `;
      const order = rows[0];
      if (!order) throw new Error("ORDER_NOT_FOUND");
      if (order.status !== "HELD" || order.holdExpiresAt <= new Date()) throw new Error("HOLD_EXPIRED");
      const approved = outcome === "approve";
      await tx.payment.upsert({
        where: { orderId },
        create: { orderId, amountCents: order.totalCents, status: approved ? "APPROVED" : "REJECTED", providerRef: `MOCK-${Date.now()}` },
        update: { status: approved ? "APPROVED" : "REJECTED", providerRef: `MOCK-${Date.now()}` }
      });
      await tx.ticketTier.update({
        where: { id: order.tierId },
        data: approved
          ? { heldQty: { decrement: order.quantity }, soldQty: { increment: order.quantity } }
          : { heldQty: { decrement: order.quantity } }
      });
      return tx.order.update({ where: { id: orderId }, data: { status: approved ? "PAID" : "FAILED" } });
    });
    return NextResponse.json({ orderId: result.id, status: result.status, simulated: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    return NextResponse.json({ error: msg || "Payment simulation failed." }, { status: msg === "ORDER_NOT_FOUND" ? 404 : 409 });
  }
}
