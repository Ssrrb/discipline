// dbml.ts
import { storeTable, productTable, categoryTable, imageTable } from "@/db/schema";
const schema = { store: storeTable, product: productTable, category: categoryTable, image: imageTable };
import { pgGenerate } from "drizzle-dbml-generator";

const out = "./schema.dbml";
const relational = true;
pgGenerate({ schema, out, relational });
console.log("✅ Created the schema.dbml file");
console.log("⏳ Creating the erd.svg file");