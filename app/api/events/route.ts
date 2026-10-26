import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRedis } from "@/lib/redis";

export async function GET() {
  const redis = getRedis();
  const cacheKey = "events:published:v1";
  try {
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) return NextResponse.json(JSON.parse(cached), { headers: { "x-cache": "HIT" } });
    }
    const events = await prisma.event.findMany({
      where: { published: true, startsAt: { gte: new Date() } },
      include: { ticketTiers: true },
      orderBy: { startsAt: "asc" }
    });
    if (redis) await redis.set(cacheKey, JSON.stringify(events), "EX", 60);
    return NextResponse.json(events, { headers: { "x-cache": "MISS" } });
  } catch {
    return NextResponse.json({ error: "Could not load events. Check DATABASE_URL." }, { status: 503 });
  }
}
