import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq } from 'drizzle-orm';
import { storeTable } from './schema';
  
export const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const store: typeof storeTable.$inferInsert = {
    name: 'John',
    userId: 'john@example.com',
  };

  await db.insert(storeTable).values(store);
  console.log('New store created!')

  const stores = await db.select().from(storeTable);
  console.log('Getting all stores from the database: ', stores)
  /*
  const users: {
    id: number;
    name: string;
    age: number;
    email: string;
  }[]
  */

  await db
    .update(storeTable)
    .set({
      name: 'John Doe',
      userId: 'john@example.com',
    })
    .where(eq(storeTable.userId, store.userId));
  console.log('Store info updated!')

}

main();
