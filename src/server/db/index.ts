import { drizzle } from "drizzle-orm/libsql";
export * from "./schema";

export const db = drizzle(process.env.DATABASE_URL!);