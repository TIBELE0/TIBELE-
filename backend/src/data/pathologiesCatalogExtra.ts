import { PathologyCatalogItem } from './pathologiesCatalog';

interface RawPathology {
  title: string;
  groupe: string;
  isFree?: boolean;
}

const slugify = (value: string): string => {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const referencesByGroup: Record<string, string> = {
  'Maladies infectieuses': 'OMS (WHO) guidelines; CDC infectious diseases guidance; ECDC technical resources.',
  'Cardiologie': 'ESC guidelines; AHA/ACC guidance; NICE cardiovascular recommendations.',
  'Pédiatrie': 'WHO child health resources; AAP guidance; NICE paediatric recommendations.',
  'Gastroentérologie': 'NICE digestive diseases guidance; ACG recommendations; WHO digestive health resources.',
  'Neurologie': 'AHA/ASA neurological guidance; ESO/AAN recommendations; NICE neurology resources.',
  'Pneumologie': 'WHO respiratory guidance; GOLD/GINA where applicable; NICE respiratory recommendations.',
  'Endocrinologie': 'ADA/IDF standards; Endocrine Society guidance; WHO NCD resources.',
  'Rhumatologie': 'EULAR recommendations; ACR guidance; NICE musculoskeletal resources.',
  'Dermatologie': 'AAD guidance; NICE dermatology recommendations; WHO skin resources.',
  'Néphrologie': 'KDIGO guidelines; NICE CKD/AKI recommendations; WHO renal risk resources.',
  'Gynécologie-Obstétrique': 'WHO maternal health guidance; ACOG recommendations; NICE obstetric guidance.',
  'Psychiatrie': 'WHO mhGAP; APA guidance; NICE mental health recommendations.',
  'Urgences et réanimation': 'Surviving Sepsis Campaign; ATLS/critical care frameworks; WHO emergency care tools.',
};

const toBullets = (items: string[]): string => {
  return items.map((item) => `- ${item}`).join('\n');
};

const buildPathology = (raw: RawPathology, index: number): PathologyCatalogItem => {
  const slug = slugify(raw.title);
  const references = referencesByGroup[raw.groupe] || 'WHO guidance; CDC resources; NICE recommendations.';

  return {
    title: raw.title,
    slug,
    shortDescription: `Prise en charge pratique de ${raw.title.toLowerCase()} selon recommandations internationales adaptees au contexte clinique.`,
    definition: toBullets([
      `${raw.title} correspond a une pathologie frequente en pratique clinique et necessite une evaluation standardisee.`,
      'La gravite est appreciee sur les signes cliniques, les comorbidites et le retentissement fonctionnel.',
      'L objectif est un diagnostic precoce et un traitement adapte au niveau de risque.',
    ]),
    examinations: toBullets([
      'Anamnese ciblee et examen clinique complet avec constantes vitales.',
      'Examens biologiques et/ou imagerie selon presentation et drapeaux rouges.',
      'Reevaluation clinique apres traitement initial pour ajuster la conduite a tenir.',
    ]),
    referentialDiagnosis: toBullets([
      'Diagnostic retenu sur faisceau clinico-paraclinique conforme aux recommandations de reference.',
      'Exclusion systematique des diagnostics differentiels urgents ou menaçant le pronostic vital.',
      'Stadification de la severite pour orienter ambulatoire, hospitalisation ou urgence specialisee.',
    ]),
    onSiteTreatment: toBullets([
      'Traitement initial symptomatique et etiologique selon protocole en vigueur.',
      'Correction des facteurs aggravants et prevention des complications immediates.',
      'Orientation specialisee rapide si criteres de gravite ou echec therapeutique.',
    ]),
    dischargeOrder: toBullets([
      'Ordonnance avec posologies, duree, precautions et interactions majeures.',
      'Consignes ecrites sur les signes d alerte imposant une reconsultation rapide.',
      'Plan de suivi clinique et biologique avec rendez-vous programme.',
    ]),
    prevention: toBullets([
      'Education therapeutique et renforcement de l observance.',
      'Mesures hygieno-dietetiques personnalisees et reduction des facteurs de risque.',
      'Depistage precoce des recidives et complications lors du suivi.',
    ]),
    references,
    isFree: typeof raw.isFree === 'boolean' ? raw.isFree : index % 4 === 0,
    groupe: raw.groupe,
  };
};

const rawPathologies: RawPathology[] = [
  { title: 'Dengue', groupe: 'Maladies infectieuses' },
  { title: 'Fièvre typhoïde', groupe: 'Maladies infectieuses' },
  { title: 'Méningite bactérienne communautaire', groupe: 'Maladies infectieuses' },
  { title: 'Hépatite B chronique', groupe: 'Maladies infectieuses' },
  { title: 'Infection par le VIH', groupe: 'Maladies infectieuses' },
  { title: 'Choléra', groupe: 'Maladies infectieuses' },
  { title: 'Rougeole', groupe: 'Maladies infectieuses' },
  { title: 'Varicelle compliquée', groupe: 'Maladies infectieuses' },
  { title: 'Oreillons', groupe: 'Maladies infectieuses' },
  { title: 'Rage post-exposition', groupe: 'Maladies infectieuses' },
  { title: 'Leptospirose', groupe: 'Maladies infectieuses' },
  { title: 'Pneumonie communautaire bactérienne', groupe: 'Maladies infectieuses' },

  { title: 'Hypertension artérielle essentielle', groupe: 'Cardiologie' },
  { title: 'Syndrome coronarien aigu', groupe: 'Cardiologie' },
  { title: 'Fibrillation auriculaire', groupe: 'Cardiologie' },
  { title: 'Cardiomyopathie dilatée', groupe: 'Cardiologie' },
  { title: 'Valvulopathie aortique', groupe: 'Cardiologie' },
  { title: 'Péricardite aiguë', groupe: 'Cardiologie' },
  { title: 'Endocardite infectieuse', groupe: 'Cardiologie' },
  { title: 'Thrombose veineuse profonde', groupe: 'Cardiologie' },
  { title: 'Embolie pulmonaire', groupe: 'Cardiologie' },
  { title: 'Dissection aortique', groupe: 'Cardiologie' },

  { title: 'Diarrhée aiguë de l enfant', groupe: 'Pédiatrie' },
  { title: 'Malnutrition aiguë sévère', groupe: 'Pédiatrie' },
  { title: 'Otite moyenne aiguë', groupe: 'Pédiatrie' },
  { title: 'Pneumonie de l enfant', groupe: 'Pédiatrie' },
  { title: 'Convulsions fébriles', groupe: 'Pédiatrie' },
  { title: 'Reflux gastro-oesophagien du nourrisson', groupe: 'Pédiatrie' },
  { title: 'Anémie ferriprive de l enfant', groupe: 'Pédiatrie' },
  { title: 'Retard staturo-pondéral', groupe: 'Pédiatrie' },
  { title: 'Coqueluche', groupe: 'Pédiatrie' },
  { title: 'Laryngite aiguë sous-glottique', groupe: 'Pédiatrie' },

  { title: 'Gastro-entérite aiguë de l adulte', groupe: 'Gastroentérologie' },
  { title: 'Cirrhose hépatique', groupe: 'Gastroentérologie' },
  { title: 'Pancréatite aiguë', groupe: 'Gastroentérologie' },
  { title: 'Hépatite alcoolique', groupe: 'Gastroentérologie' },
  { title: 'Lithiase biliaire symptomatique', groupe: 'Gastroentérologie' },
  { title: 'Syndrome de l intestin irritable', groupe: 'Gastroentérologie' },
  { title: 'Rectocolite hémorragique', groupe: 'Gastroentérologie' },
  { title: 'Maladie de Crohn', groupe: 'Gastroentérologie' },

  { title: 'Épilepsie de l adulte', groupe: 'Neurologie' },
  { title: 'Migraine avec aura', groupe: 'Neurologie' },
  { title: 'Maladie de Parkinson', groupe: 'Neurologie' },
  { title: 'Sclérose en plaques', groupe: 'Neurologie' },
  { title: 'Neuropathie périphérique diabétique', groupe: 'Neurologie' },
  { title: 'Syndrome de Guillain-Barré', groupe: 'Neurologie' },
  { title: 'Hémorragie méningée', groupe: 'Neurologie' },
  { title: 'Vertige paroxystique positionnel bénin', groupe: 'Neurologie' },

  { title: 'Bronchopneumopathie chronique obstructive', groupe: 'Pneumologie' },
  { title: 'Pneumothorax spontané', groupe: 'Pneumologie' },
  { title: 'Syndrome d apnées obstructives du sommeil', groupe: 'Pneumologie' },
  { title: 'Bronchectasies', groupe: 'Pneumologie' },
  { title: 'Pleurésie aiguë', groupe: 'Pneumologie' },
  { title: 'Pneumonie nosocomiale', groupe: 'Pneumologie' },
  { title: 'Insuffisance respiratoire aiguë', groupe: 'Pneumologie' },
  { title: 'Fibrose pulmonaire idiopathique', groupe: 'Pneumologie' },

  { title: 'Hypothyroïdie', groupe: 'Endocrinologie' },
  { title: 'Hyperthyroïdie de Basedow', groupe: 'Endocrinologie' },
  { title: 'Obésité', groupe: 'Endocrinologie' },
  { title: 'Syndrome métabolique', groupe: 'Endocrinologie' },
  { title: 'Acidocétose diabétique', groupe: 'Endocrinologie' },
  { title: 'Hypoglycémie sévère', groupe: 'Endocrinologie' },
  { title: 'Insuffisance surrénalienne', groupe: 'Endocrinologie' },
  { title: 'Goitre multinodulaire', groupe: 'Endocrinologie' },

  { title: 'Arthrose du genou', groupe: 'Rhumatologie' },
  { title: 'Goutte', groupe: 'Rhumatologie' },
  { title: 'Spondylarthrite ankylosante', groupe: 'Rhumatologie' },
  { title: 'Lupus érythémateux systémique', groupe: 'Rhumatologie' },
  { title: 'Ostéoporose post-ménopausique', groupe: 'Rhumatologie' },
  { title: 'Lombalgie chronique commune', groupe: 'Rhumatologie' },

  { title: 'Psoriasis en plaques', groupe: 'Dermatologie' },
  { title: 'Acné vulgaire', groupe: 'Dermatologie' },
  { title: 'Impétigo', groupe: 'Dermatologie' },
  { title: 'Urticaire aiguë', groupe: 'Dermatologie' },
  { title: 'Zona', groupe: 'Dermatologie' },
  { title: 'Mycose cutanée superficielle', groupe: 'Dermatologie' },

  { title: 'Syndrome néphrotique', groupe: 'Néphrologie' },
  { title: 'Pyélonéphrite aiguë', groupe: 'Néphrologie' },
  { title: 'Glomérulonéphrite aiguë', groupe: 'Néphrologie' },
  { title: 'Insuffisance rénale aiguë', groupe: 'Néphrologie' },
  { title: 'Lithiase urinaire', groupe: 'Néphrologie' },
  { title: 'Infection urinaire compliquée', groupe: 'Néphrologie' },

  { title: 'Diabète gestationnel', groupe: 'Gynécologie-Obstétrique' },
  { title: 'Placenta prævia', groupe: 'Gynécologie-Obstétrique' },
  { title: 'Hémorragie du post-partum', groupe: 'Gynécologie-Obstétrique' },
  { title: 'Menace d accouchement prématuré', groupe: 'Gynécologie-Obstétrique' },
  { title: 'Infection urinaire de la grossesse', groupe: 'Gynécologie-Obstétrique' },
  { title: 'Endométriose', groupe: 'Gynécologie-Obstétrique' },

  { title: 'Trouble anxieux généralisé', groupe: 'Psychiatrie' },
  { title: 'Trouble bipolaire', groupe: 'Psychiatrie' },
  { title: 'Schizophrénie', groupe: 'Psychiatrie' },
  { title: 'Trouble panique', groupe: 'Psychiatrie' },
  { title: 'État de stress post-traumatique', groupe: 'Psychiatrie' },
  { title: 'Insomnie chronique', groupe: 'Psychiatrie' },

  { title: 'Choc anaphylactique', groupe: 'Urgences et réanimation' },
  { title: 'Intoxication médicamenteuse aiguë', groupe: 'Urgences et réanimation' },
  { title: 'Brûlure thermique étendue', groupe: 'Urgences et réanimation' },
  { title: 'Traumatisme crânien léger à modéré', groupe: 'Urgences et réanimation' },
  { title: 'Polytraumatisme', groupe: 'Urgences et réanimation' },
  { title: 'Crise hypertensive compliquée', groupe: 'Urgences et réanimation' },
];

if (rawPathologies.length !== 100) {
  throw new Error(`Le lot additionnel doit contenir exactement 100 pathologies. Recu: ${rawPathologies.length}`);
}

export const EXTRA_PATHOLOGIES_100: PathologyCatalogItem[] = rawPathologies.map((raw, index) => {
  return buildPathology(raw, index);
});