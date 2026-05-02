import prisma from '../src/config/prisma';
import { createSlug } from '../src/utils/validators';

const pathologyGroups = [
  'Cardiologie', 'Pneumologie', 'Gastro-entérologie', 'Hépatologie', 'Rhumatologie',
  'Dermatologie', 'Oncologie', 'Endocrinologie', 'Métabolique', 'Hématologie',
  'Neurologie', 'Psychiatrie', 'Ophtalmologie', 'ORL', 'Urologie',
  'Néphologie', 'Immunologie', 'Maladies infectieuses', 'Pédiatrie', 'Gériatrie'
];

const pathologyNames: Record<string, string[]> = {
  'Cardiologie': ['Hypertension artérielle', 'Insuffisance cardiaque', 'Coronaropathie', 'Arythmie cardiaque', 'Valvulopathie', 'Péricardite', 'Myocardite', 'Endocardite', 'Thromboembolie pulmonaire', 'Anévrysme aortique', 'Dissection aortique', 'Cardiomyopathie', 'Choc cardiogénique', 'Syncope', 'Tachycardie supraventriculaire'],
  'Pneumologie': ['Asthme', 'BPCO', 'Embolie pulmonaire', 'Pneumonie', 'Bronchite aiguë', 'Bronchectasies', 'Fibrose pulmonaire', 'Sarcoidose', 'Silicose', 'Asbestose', 'Pneumothorax', 'Epanchement pleural', 'Abcès du poumon', 'Cancer du poumon', 'Tuberculose pulmonaire'],
  'Gastro-entérologie': ['Reflux gastro-oesophagien', 'Ulcère gastrique', 'Ulcère duodénal', 'Appendicite', 'Diverticulose', 'Maladie de Crohn', 'Rectocolite hémorragique', 'Entérocolite', 'Constipation', 'Diarrhée', 'Gastroentérite virale', 'Gastroentérite bactérienne', 'Volvulus', 'Iléus paralytique', 'Hernie inguinale'],
  'Hépatologie': ['Hépatite A', 'Hépatite B', 'Hépatite C', 'Cirrhose hépatique', 'Stéatose hépatique', 'Insuffisance hépatique aiguë', 'Insuffisance hépatique chronique', 'Cholécystite', 'Lithiase biliaire', 'Cholangite', 'Cancer hépatocellulaire', 'Hemochromatose', 'Maladie de Wilson', 'Abcès hépatique', 'Carcinome cholangiocarcinome'],
  'Rhumatologie': ['Polyarthrite rhumatoïde', 'Spondylarthrite ankylosante', 'Lupus érythémateux', 'Sclérose systémique', 'Arthrose cervicale', 'Arthrose lombaire', 'Arthrite septique', 'Goutte', 'Pseudogoutte', 'Ostéoporose', 'Maladie de Paget', 'Fibromyalgie', 'Syndrome du canal carpien', 'Tendinite', 'Bursite'],
  'Dermatologie': ['Acné', 'Psoriasis', 'Dermatite atopique', 'Eczéma de contact', 'Urticaire', 'Angioedème', 'Pemphigus', 'Pemphigoïde bulleuse', 'Dermatite séborrhéique', 'Pityriasis rosé', 'Lichen plan', 'Vitiligo', 'Alopécie androgénétique', 'Teigne', 'Impétigo'],
  'Oncologie': ['Cancer colorectal', 'Cancer du sein', 'Cancer du poumon', 'Cancer de la prostate', 'Cancer de l\'ovaire', 'Cancer de l\'utérus', 'Cancer du pancréas', 'Cancer de l\'estomac', 'Cancer de l\'œsophage', 'Lymphome non hodgkinien', 'Lymphome hodgkinien', 'Leucémie aiguë', 'Leucémie chronique', 'Myélome multiple', 'Mélanome malin'],
  'Endocrinologie': ['Diabète type 1', 'Diabète type 2', 'Hypothyroïdie', 'Hyperthyroïdie', 'Thyroïdite de Hashimoto', 'Maladie de Graves', 'Goitre', 'Insuffisance surrénalienne', 'Hypercorticisme', 'Phéochromocytome', 'Hypogonadisme', 'Hyperprolactinémie', 'Acromégalie', 'Syndrome de Cushing', 'Diabète insipide'],
  'Métabolique': ['Obésité', 'Surcharge pondérale', 'Dyslipidémie', 'Hyperuricémie', 'Déficit en fer', 'Carence en B12', 'Carence en acide folique', 'Scorbut', 'Béribéri', 'Pellagre', 'Rachitisme', 'Hypercalcémie', 'Hypocalcémie', 'Hypokaliémie', 'Hyperkaliémie'],
  'Hématologie': ['Anémie microcytaire', 'Anémie macrocytaire', 'Anémie normocytaire', 'Thrombopénie', 'Thrombophilie', 'Maladie de von Willebrand', 'Hémophilie A', 'Hémophilie B', 'Déficit en facteur V', 'Trouble de la coagulation', 'Drépanocytose', 'Thalassémie', 'Sphérocytose héréditaire', 'Polycythémie vraie', 'Thrombocytémie essentielle'],
  'Neurologie': ['Accident vasculaire cérébral', 'Hémorragie sous-arachnoïdienne', 'Hématome sous-dural', 'Hématome épidural', 'Traumatisme crânien', 'Commotio cerebri', 'Épilepsie', 'Status epilepticus', 'Céphalée de tension', 'Migraine', 'Cluster headache', 'Trigeminal neuralgia', 'Maladie de Parkinson', 'Sclérose latérale amyotrophique', 'Sclérose en plaques'],
  'Psychiatrie': ['Dépression majeure', 'Trouble bipolaire', 'Schizophrénie', 'Trouble anxieux généralisé', 'Trouble panique', 'Agoraphobie', 'Trouble obsessionnel-compulsif', 'Trouble de stress post-traumatique', 'Trouble de l\'adaptation', 'Trouble de la personnalité', 'Trouble du sommeil', 'Insomnie', 'Narcolepsie', 'Apnée du sommeil', 'Cauchemars récurrents'],
  'Ophtalmologie': ['Myopie', 'Hypermétropie', 'Astigmatisme', 'Presbytie', 'Cataracte', 'Glaucome', 'Dégénérescence maculaire', 'Rétinopathie diabétique', 'Occlusion artérielle rétinienne', 'Occlusion veineuse rétinienne', 'Décollement rétinien', 'Kératite', 'Conjonctivite virale', 'Conjonctivite bactérienne', 'Uvéite'],
  'ORL': ['Pharyngite', 'Amygdalite', 'Laryngite', 'Sinusite', 'Otite externe', 'Otite moyenne', 'Mastoïdite', 'Surdité de conduction', 'Surdité de perception', 'Vertigo', 'Maladie de Ménière', 'Nystagmus', 'Aponevrose palatine', 'Ronchopathie', 'Apnée obstructive du sommeil'],
  'Urologie': ['Cystite', 'Urétrite', 'Prostatite aiguë', 'Prostatite chronique', 'Adénome de la prostate', 'Cancer de la prostate', 'Calcul rénal', 'Calcul urétéral', 'Calcul vésical', 'Hydronéphrose', 'Reflux vésico-urétéral', 'Dysfonction érectile', 'Priapisme', 'Hypospadias', 'Epispadias'],
  'Néphologie': ['Glomérulonéphrite post-streptococcique', 'Glomérulonéphrite membranoproliférative', 'Néphropathie IgA', 'Sclérose glomérulaire focale', 'Syndrome néphrotique', 'Syndrome néphritique', 'Insuffisance rénale aiguë', 'Insuffisance rénale chronique', 'Maladie polykystique', 'Acidose tubulaire rénale', 'Hyperparathyroïdie tertiaire', 'Ostéodystrophie rénale', 'Néphrosclérose hypertensive', 'Néphrite interstitielle', 'Pyelonéphrite'],
  'Immunologie': ['Déficit immunitaire combiné sévère', 'Déficit en IgA', 'Hypogammaglobulinémie', 'Agammaglobulinémie', 'Lymphopénie', 'Immunodéficience acquise', 'Mutation JAK2', 'Syndrome de DiGeorge', 'Ataxie-télangiectasie', 'Dysplasie ectodermique', 'Syndrome de Wiskott-Aldrich', 'Syndrome des hyper-IgE', 'Déficit en complement', 'Syndrome d\'activation des lymphocytes', 'Lymphohistiocytose hémophagocytaire'],
  'Maladies infectieuses': ['VIH/SIDA', 'Tuberculose', 'Syphilis', 'Gonorrhée', 'Chlamydia trachomatis', 'Tréponématose', 'Fièvre typhoïde', 'Dysenterie bacillaire', 'Brucellose', 'Paludisme', 'Dengue', 'Fièvre jaune', 'Rage', 'Tétanos', 'Diphtérie'],
  'Pédiatrie': ['Gastroentérite de l\'enfant', 'Pneumonie pédiatrique', 'Bronchiolite', 'Laryngotrachéite', 'Coqueluche', 'Rougeole', 'Rubéole', 'Oreillons', 'Varicelle', 'Rosecola infantile', 'Cinquième maladie', 'Sixième maladie', 'Exanthème subit', 'Scarlatine', 'Impétigo pédiatrique'],
  'Gériatrie': ['Démence d\'Alzheimer', 'Démence vasculaire', 'Maladie de Lewy', 'Dégénérescence lobaire fronto-temporale', 'Syndrome gériatrique génitoire', 'Chutes chez le sujet âgé', 'Fracture de la hanche', 'Incontinence urinaire', 'Incontinence fécale', 'Malnutrition chez le sujet âgé', 'Dépression chez le sujet âgé', 'Polypharmacologie', 'Syndrome apnéique du sujet âgé', 'Troubles du sommeil du sujet âgé', 'Isolement social du sujet âgé'],
};

async function seed() {
  console.log('🌱 Démarrage du seed...');

  try {
    // Créer les groupes médicaux
    for (const groupName of pathologyGroups) {
      const slug = createSlug(groupName);
      const existing = await prisma.medicalGroup.findUnique({ where: { slug } });
      if (!existing) {
        await prisma.medicalGroup.create({
          data: { name: groupName, slug, description: `Pathologies de ${groupName}` },
        });
        console.log(`✓ Groupe créé: ${groupName}`);
      }
    }

    // Créer les pathologies
    let pathologyCount = 0;
    for (const [groupName, pathologies] of Object.entries(pathologyNames)) {
      for (const pathologyName of pathologies) {
        const slug = createSlug(pathologyName);
        const existing = await prisma.pathology.findUnique({ where: { slug } });
        if (!existing && pathologyCount < 300) {
          await prisma.pathology.create({
            data: {
              title: pathologyName,
              slug,
              shortDescription: `Description courte de ${pathologyName}`,
              definition: `Définition détaillée de ${pathologyName}. Il s'agit d'une pathologie du groupe de ${groupName}.`,
              examinations: `Examens recommandés: Laboratoire, Imagerie médicale, Consultation spécialisée.`,
              referentialDiagnosis: `Diagnostic basé sur les critères cliniques et paracliniques de ${pathologyName}.`,
              onSiteTreatment: `Traitement sur site: Médicaments, Thérapies physiques, Suivi médical régulier.`,
              dischargeOrder: `Ordonnance de sortie avec recommandations de suivi ambulatoire.`,
              prevention: `Mesures préventives: Hygiène de vie, Alimentation équilibrée, Exercice régulier.`,
              isFree: Math.random() > 0.7,
              isHidden: true,
              groupe: groupName,
            },
          });
          pathologyCount++;
          if (pathologyCount % 50 === 0) console.log(`✓ ${pathologyCount} pathologies créées...`);
        }
      }
    }

    console.log(`✓ Total: ${pathologyCount} pathologies créées`);

    // Créer les questions (100)
    const allPathologies = await prisma.pathology.findMany({ take: 100 });
    let questionCount = 0;

    for (const pathology of allPathologies) {
      if (questionCount >= 100) break;

      const questionTypes = ['QCM', 'QCD'] as const;
      for (let i = 0; i < 1; i++) {
        if (questionCount >= 100) break;

        const qType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        const options = [
          { text: 'Option A correcte', isCorrect: true },
          { text: 'Option B incorrecte', isCorrect: false },
        ];

        await prisma.question.create({
          data: {
            questionText: `Quelle est la meilleure approche thérapeutique pour ${pathology.title}?`,
            type: qType as any,
            options: options as any,
            explanation: `Explication detaillée de la réponse concernant ${pathology.title}.`,
            isHidden: true,
            pathologyId: pathology.id,
          },
        });

        questionCount++;
        if (questionCount % 25 === 0) console.log(`✓ ${questionCount} questions créées...`);
      }
    }

    console.log(`✓ Total: ${questionCount} questions créées`);
    console.log('✅ Seed complété avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
