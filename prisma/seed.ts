import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import crypto from "crypto";

// Seed uses DIRECT_URL (port 5432) — runs outside the app, no pgBouncer needed
  const cs = process.env.DIRECT_URL ?? process.env.DATABASE_URL!;
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: cs }) });

function token() { return crypto.randomBytes(16).toString("hex"); }

async function main() {
  console.log("🌱 Seeding Vowly Invites…");

  // Admin
  await prisma.user.upsert({
    where:  { username: "admin" },
    update: {},
    create: { username:"admin", name:"Platform Admin", email:"admin@vowlyinvites.lk", passwordHash: await bcrypt.hash("admin123",12), role:"ADMIN" },
  });
  console.log("  ✓ Admin: username=admin / admin123");

  // Demo couple
  const couple = await prisma.user.upsert({
    where:  { username: "ishara.panchana" },
    update: {},
    create: { username:"ishara.panchana", name:"Ishara & Panchana", email:"demo@vowlyinvites.lk", passwordHash: await bcrypt.hash("demo1234",12), role:"COUPLE" },
  });

  const existing = await prisma.wedding.findUnique({ where: { coupleId: couple.id } });
  if (!existing) {
    const wedding = await prisma.wedding.create({ data: {
      slug:"ishara-and-panchana-2026", coupleId:couple.id, package:"PREMIUM", status:"PUBLISHED",
      content:{ create:{
        brideName:"Ishara", groomName:"Panchana",
        weddingDate:new Date("2026-11-22T00:00:00Z"),
        venue:"The Grand Garden Hotel",
        venueAddress:"123 Garden Road, Colombo 03, Sri Lanka",
        loveStory:"We met at university during our first year and have been inseparable ever since. After seven years together, we are beyond excited to celebrate our love with all the people who matter most to us.",
        specialNote:"Please join us for dinner and dancing to follow the ceremony. Dress code: Formal.",
        dressCode:"Formal",
      }},
      theme:{ create:{ primaryColor:"#C9606A", accentColor:"#C9A84C", bgTint:"#FDF9F5", isCustom:true }},
      events:{ create:[
        { title:"Seth Pirith",     time:new Date("2026-11-21T19:00:00Z"), location:"Family Home, Colombo 07",        order:0 },
        { title:"Poruwa Ceremony", time:new Date("2026-11-22T09:30:00Z"), location:"The Grand Garden Hotel",         nekathTime:"9:47 AM", order:1 },
        { title:"Reception",       time:new Date("2026-11-22T18:00:00Z"), location:"Grand Garden Ballroom, Colombo", order:2 },
      ]},
      chatMessages:{ create:{ senderRole:"SYSTEM", senderName:"Vowly", content:"Welcome, Ishara & Panchana! 🎉 Your Vowly Invites account is ready. Fill in your wedding details in the dashboard and contact us here with any questions." }},
    }});

    await prisma.guest.createMany({ data: [
      { weddingId:wedding.id, name:"Kasun Fernando",              inviteType:"MR", phone:"+94771234567", token:token(), maxAttendees:1 },
      { weddingId:wedding.id, name:"Dilini Perera",             inviteType:"MR", phone:"+94772345678", token:token(), maxAttendees:1 },
      { weddingId:wedding.id, name:"Mr. & Mrs. Silva",   inviteType:"MR_AND_MRS",     phone:"+94773456789", token:token(), maxAttendees:2 },
      { weddingId:wedding.id, name:"The Jayawardena Family", inviteType:"FAMILY", phone:"+94774567890", token:token(), maxAttendees:4 },
    ]});
    console.log("  ✓ Demo wedding: ishara-and-panchana-2026 (PREMIUM/PUBLISHED) + 4 guests");
  }

  // Sample leads
  await prisma.lead.createMany({
    data: [
      { name:"Kasun & Dilini Mendis", email:"kasun@example.com", whatsapp:"+94771234567", package:"CLASSIC", status:"NEW",       hasDesignerCard:true  },
      { name:"Nimal & Kamani Perera", email:"nimal@example.com", whatsapp:"+94772345678", package:"PREMIUM", status:"CONTACTED", hasDesignerCard:false },
      { name:"Ruwan & Sachini Silva", email:"ruwan@example.com", whatsapp:"+94773456789", package:"BASIC",   status:"PAID",      hasDesignerCard:false },
    ],
    skipDuplicates: true,
  });
  console.log("  ✓ 3 sample leads");
  console.log("\n✅ Seeding complete!");
  console.log("   Admin:  username=admin / admin123");
  console.log("   Couple: username=ishara.panchana / demo1234");
  console.log("   Login:  /ishara-and-panchana-2026/couple-login");
}

main().catch(console.error).finally(() => prisma.$disconnect());
