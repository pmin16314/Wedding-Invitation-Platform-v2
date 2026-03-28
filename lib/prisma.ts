import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

function make() {
  // Runtime MUST use DATABASE_URL (port 6543, pgBouncer pooler)
  // DIRECT_URL (port 5432) is only for prisma db push / migrate — never runtime
  const cs = process.env.DATABASE_URL!;
  if (!cs) throw new Error("DATABASE_URL environment variable is not set");
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: cs }),
  });
}

const g = globalThis as any;
export const prisma: PrismaClient = g._prisma ?? (g._prisma = make());
