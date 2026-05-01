import dotenv from 'dotenv';
import { connectDB } from '../config/database';
import { Pathology } from '../models/Pathology';
import { PATHOLOGIES_CATALOG } from '../data/pathologiesCatalog';

dotenv.config();

const seedPathologies = async () => {
  try {
    await connectDB();

    let inserted = 0;
    let updated = 0;

    for (const pathology of PATHOLOGIES_CATALOG) {
      const existing = await Pathology.findOne({ slug: pathology.slug }).select('_id');
      await Pathology.updateOne(
        { slug: pathology.slug },
        { $set: pathology },
        { upsert: true }
      );

      if (existing) {
        updated += 1;
      } else {
        inserted += 1;
      }
    }

    console.log(`✓ Pathologies importees: ${PATHOLOGIES_CATALOG.length}`);
    console.log(`✓ Nouvelles pathologies: ${inserted}`);
    console.log(`✓ Pathologies mises a jour: ${updated}`);
    process.exit(0);
  } catch (error) {
    console.error('Erreur import pathologies:', error);
    process.exit(1);
  }
};

seedPathologies();