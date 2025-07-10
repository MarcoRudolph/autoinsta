import { db } from './index';
import { personas } from './schema/personas';
import { PersonaInsertSchema } from './schema/personas.zod';
import fs from 'fs/promises';
import path from 'path';

async function seed() {
  // Load eden.json
  const edenPath = path.join(process.cwd(), 'public', 'eden.json');
  const edenRaw = await fs.readFile(edenPath, 'utf-8');
  const edenData = JSON.parse(edenRaw);

  // Validate persona data with Zod
  const parsed = PersonaInsertSchema.safeParse({
    userId: '', // empty string or a valid UUID for test data
    data: edenData,
  });
  if (!parsed.success) {
    console.error('Validation failed:', parsed.error.format());
    process.exit(1);
  }

  // Insert persona
  await db.insert(personas).values(parsed.data);
  console.log('Seeded eden persona as public template.');
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
}); 