import dotenv from 'dotenv';
dotenv.config();

import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Pathology } from '../models/Pathology';
import { Question } from '../models/Question';
import { connectDB } from '../config/database';
import { PATHOLOGIES_CATALOG } from '../data/pathologiesCatalog';

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Pathology.deleteMany({});
    await Question.deleteMany({});

    console.log('Cleared existing data');

    const enableDevSeedUsers = process.env.ALLOW_DEV_USER_SEED === 'true' && process.env.NODE_ENV !== 'production';
    if (enableDevSeedUsers) {
      const userPassword = await bcrypt.hash('user123456', 10);
      await User.create({
        email: 'user@tibele.ci',
        password: userPassword,
        fullName: 'Utilisateur Test',
        matricule: 'INF000001',
        school: 'INFAS',
        studyYear: '3',
        major: 'Soins infirmiers',
        matriculeValidated: true,
        role: 'user',
      });
      console.log('✓ Utilisateur de développement créé (facultatif)');
    }

    // Import full pathology catalog (300+)
    const pathologies = await Pathology.insertMany(PATHOLOGIES_CATALOG);
    console.log(`✓ Pathologies imported: ${pathologies.length}`);

    // Generate at least 50 training exercises (QCM + QCD)
    const minimumExercises = 50;
    const supportedPathologies = pathologies.slice(0, Math.min(pathologies.length, 30));
    const generatedQuestions = supportedPathologies.flatMap((pathology) => [
      {
        pathology: pathology._id,
        questionText: `Quel enonce est le plus juste concernant ${pathology.title} ?`,
        type: 'QCM' as const,
        options: [
          { text: `Le diagnostic de ${pathology.title} repose sur une evaluation clinique et des examens adaptes`, isCorrect: true },
          { text: `${pathology.title} ne demande jamais de suivi medical`, isCorrect: false },
          { text: `${pathology.title} est toujours benin et sans complication`, isCorrect: false },
          { text: `Le traitement de ${pathology.title} est identique dans tous les cas`, isCorrect: false },
        ],
        explanation: `La prise en charge de ${pathology.title} depend du contexte clinique, de la gravite et des examens de confirmation.`,
      },
      {
        pathology: pathology._id,
        questionText: `La surveillance clinique est importante dans la prise en charge de ${pathology.title}.`,
        type: 'QCD' as const,
        options: [
          { text: 'Vrai', isCorrect: true },
          { text: 'Faux', isCorrect: false },
        ],
        explanation: 'Une surveillance reguliere permet d adapter le traitement et de depister rapidement les complications.',
      },
    ]);

    const questionsToInsert = generatedQuestions.slice(0, Math.max(minimumExercises, generatedQuestions.length));
    await Question.insertMany(questionsToInsert);
    console.log(`✓ Exercises created: ${questionsToInsert.length}`);

    console.log('✓ Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
