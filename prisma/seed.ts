import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const organizer = await prisma.user.upsert({
    where: { email: "organizer@example.com" },
    update: {},
    create: { name: "Demo Organizer", email: "organizer@example.com", role: "ORGANIZER" }
  });
  const attendee = await prisma.user.upsert({
    where: { email: "attendee@example.com" },
    update: {},
    create: { name: "Demo Attendee", email: "attendee@example.com", role: "ATTENDEE" }
  });
  const events = [
    { title: "FutureTech Summit 2026", description: "A day of ideas, AI, startups and next-generation technology.", category: "Technology", venue: "Chennai Trade Centre", city: "Chennai", startsAt: new Date("2026-11-14T09:00:00+05:30"), salesCutoffAt: new Date("2026-11-13T23:59:00+05:30"), tiers: [{ name: "General Admission", priceCents: 79900, totalQty: 300 }, { name: "VIP", priceCents: 199900, totalQty: 40 }] },
    { title: "Indie Nights Live", description: "Discover fresh sounds and unforgettable live performances.", category: "Music", venue: "Phoenix Marketcity", city: "Chennai", startsAt: new Date("2026-11-21T18:00:00+05:30"), salesCutoffAt: new Date("2026-11-21T15:00:00+05:30"), tiers: [{ name: "General Admission", priceCents: 49900, totalQty: 500 }, { name: "VIP", priceCents: 149900, totalQty: 60 }] },
    { title: "Design Forward", description: "Creative minds come together for a day of design and innovation.", category: "Design", venue: "The Leela Palace", city: "Chennai", startsAt: new Date("2026-12-05T10:00:00+05:30"), salesCutoffAt: new Date("2026-12-04T23:59:00+05:30"), tiers: [{ name: "General Admission", priceCents: 99900, totalQty: 180 }, { name: "VIP", priceCents: 249900, totalQty: 25 }] }
  ];
  for (const e of events) {
    const event = await prisma.event.upsert({
      where: { id: e.title.toLowerCase().replaceAll(" ", "-") },
      update: {},
      create: {
        id: e.title.toLowerCase().replaceAll(" ", "-"),
        organizerId: organizer.id, title: e.title, description: e.description, category: e.category,
        venue: e.venue, city: e.city, startsAt: e.startsAt, salesCutoffAt: e.salesCutoffAt,
        ticketTiers: { create: e.tiers }
      }
    });
    console.log(`Seeded ${event.title}`);
  }
  console.log(`Demo attendee: ${attendee.email}`);
}
main().finally(() => prisma.$disconnect());
