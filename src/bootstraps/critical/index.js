import bootstrapDatabase from "./database.bootstrap.js";
import bootstrapRedis from "./redis.bootstrap.js";

export default async function criticalBootstrap() {
    await bootstrapDatabase();
    await bootstrapRedis();
}