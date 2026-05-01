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
  'Ophtalmologie': 'AAO preferred practice patterns; NICE ophthalmology guidance; WHO blindness prevention resources.',
  'ORL': 'AAO-HNS guidelines; NICE ENT recommendations; WHO hearing loss resources.',
  'Urologie': 'EAU guidelines; AUA guidance; NICE urology recommendations.',
  'Oncologie': 'ESMO guidelines; NCCN guidance; WHO cancer resources.',
  'Hématologie': 'ASH guidelines; BSH guidance; WHO haematology resources.',
  'Gériatrie': 'BGS guidelines; NICE older people recommendations; WHO ageing resources.',
  'Néonatologie': 'WHO neonatal care guidance; AAP neonatal recommendations; NICE neonatal resources.',
};

const toBullets = (items: string[]): string => items.map((item) => `- ${item}`).join('\n');

/** Ordonnances spécifiques par groupe (médicaments/posologies/durées réels) */
const dischargeOrderByGroup: Record<string, string> = {
  'Maladies infectieuses': toBullets([
    'Amoxicilline-Clavulanate 1 g/125 mg x 3/j per os pendant 7 jours (infections ORL/pulmonaires bactériennes communautaires)',
    'Paracetamol 1 g x 3/j si fièvre ou douleur, max 3 g/j, pendant 5 jours',
    'Antiémétiques si vomissements : metoclopramide 10 mg x 3/j pendant 3 jours max',
    'Hydratation orale : 2 à 3 L/j ; SRO si déshydratation légère à modérée',
    'Contrôle clinique et biologique (NFS, CRP) à J5–J7 ; retour urgent si aggravation',
  ]),
  'Cardiologie': toBullets([
    'Amlodipine 5–10 mg/j : 1 cp le matin (antihypertenseur de 1re ligne ou angineux)',
    'Bisoprolol 5 mg/j : 1 cp le matin (cible FC 55–65/min), titrer selon tolérance',
    'Aspirine 75–100 mg/j à vie si coronaropathie confirmée (avec pantoprazole 20 mg/j)',
    'Atorvastatine 40–80 mg/j le soir si risque cardiovasculaire élevé ou coronaropathie',
    'Contrôle ECG + bilan lipidique + ionogramme-créatinine à 1 mois',
  ]),
  'Pédiatrie': toBullets([
    'Amoxicilline 50 mg/kg/j en 2 prises per os pendant 7 jours (angine/otite à streptocoque confirmé)',
    'Paracetamol 15 mg/kg/dose x 4/j (max 60 mg/kg/j) si fièvre ou douleur pendant 5 jours',
    'Ibuprofene 10 mg/kg/dose x 3/j (> 3 mois, DFG normal) en alternative si fièvre',
    'SRO (Pedialyte/ORS-OMS) 50–100 mL/kg en 3–4 h si déshydratation légère à modérée',
    'Recontrôle pédiatrique à 48–72 h ou urgences si convulsion, cyanose, déshydratation',
  ]),
  'Gastroentérologie': toBullets([
    'Pantoprazole 40 mg/j avant le repas du matin pendant 4–8 semaines selon indication',
    'Metronidazole 500 mg x 3/j pendant 7 jours si infection anaérobie/amibiase documentée',
    'Trimébutine 200 mg x 3/j avant repas pendant 4 semaines si syndrome fonctionnel intestinal',
    'Spasméine (phloroglucinol 80 mg x 3/j) si douleurs spasmodiques abdominales pendant 5 jours',
    'Régime : pauvre en graisses après pancréatite, pauvre en résidus en phase inflammatoire',
  ]),
  'Neurologie': toBullets([
    'Lévétiracétam 500 mg x 2/j (titrer jusqu à 1 500–3 000 mg/j selon réponse et poids)',
    'Sumatriptan 50–100 mg per os en prise unique dès début de migraine (max 200 mg/24 h)',
    'Amitriptyline 25 mg le soir (douleurs neuropathiques) : titrer tous les 14 jours max 75 mg/j',
    'Physio/kiné neurologique débutée dès stabilisation ; orthophonie si trouble du langage',
    'IRM cérébrale programmée, EEG si indication ; suivi neurologique dans 1 mois',
  ]),
  'Pneumologie': toBullets([
    'Tiotropium 18 mcg (Spiriva Handihaler) : 1 inhalation/j (BPCO stade modéré-sévère)',
    'Formoterol 12 mcg : 1 inhalation x 2/j en traitement de fond bronchique',
    'Prednisone 40 mg/j pendant 5 jours si exacerbation BPCO avec dyspnée modérée-sévère',
    'Amoxicilline 1 g x 3/j pendant 5–7 jours si surinfection bactérienne documentée',
    'Saturation cible en ambulatoire : 88–92 % BPCO hypoxémique, 94–98 % autres',
  ]),
  'Endocrinologie': toBullets([
    'Lévothyroxine 25–50 mcg/j le matin à jeun (hypothyroïdie) : titrer par paliers de 25 mcg toutes les 6 sem. selon TSH',
    'Carbimazole 10–20 mg/j en 2–3 prises (hyperthyroïdie de Basedow) : réequilibrage biologique à 6 sem.',
    'Insuline basale Glargine 10 UI/j le soir si objectif glycémique non atteint sous oral',
    'Glucagon kit injectable 1 mg IM/SC : dispenser à l entourage ; glucose 15 g oral si conscient (hypoglycémie légère)',
    'Bilan thyroïdien (TSH) ou HbA1c de contrôle à 6–8 semaines selon pathologie',
  ]),
  'Rhumatologie': toBullets([
    'Paracetamol 1 g x 3/j pendant 4 semaines (douleur articulaire modérée, 1re ligne)',
    'Ibuprofene 400 mg x 3/j aux repas (max 14 jours) + oméprazole 20 mg/j en gastroprotection',
    'Allopurinol 100 mg/j (introduire à distance de la crise, titrer jusqu à 300 mg/j selon uricémie/créatinine)',
    'Colchicine 1 mg J1 puis 0,5 mg x 2/j pendant 3–5 jours (crise de goutte aiguë)',
    'Kiné/rééducation : 10 séances pour renforcement péri-articulaire selon articulation atteinte',
  ]),
  'Dermatologie': toBullets([
    'Cétirizine 10 mg/j le soir (antihistaminique) pendant 7–14 jours si prurit/urticaire',
    'Betamethasone dipropionate 0,05 % crème : application fine 1x/j sur plaques actives (max 4 sem.)',
    'Fluconazole 150 mg dose unique oralement (dermatophytose/candida cutané localisé)',
    'Valaciclovir 1 g x 3/j pendant 7 jours si zona confirmé (débutée < 72 h des lésions)',
    'Emollient sans parfum x 2/j sur tout le corps en traitement de fond',
  ]),
  'Néphrologie': toBullets([
    'Amoxicilline-Clavulanate 1 g/125 mg x 2/j pendant 10–14 jours (pyélonéphrite non grave en relais IV)',
    'Ciprofloxacine 500 mg x 2/j per os pendant 7 jours si entérobactérie sensible sur ECBU',
    'Furosémide 40–80 mg/j (si surcharge hydrosodée associée à l IRA/SN)',
    'Régime : sel < 2 g/j si protéinurie, hydratation 1,5–2 L/j sauf anurie',
    'Contrôle biologique : créatinine, ECBU à J7 ; consultation néphro si DFG < 30',
  ]),
  'Gynécologie-Obstétrique': toBullets([
    'Amoxicilline 1 g x 3/j pendant 7 jours ou Cefixime 400 mg/j (infection urinaire grossesse)',
    'Progestérone micronisée 200 mg x 2/j par voie vaginale (MAP/risque accouchement prématuré)',
    'Acide folique 0,4–5 mg/j jusqu a 12 SA (prévention primaire/secondaire)',
    'Oxytocine 10 UI IM ou IV : uniquement par personnel soignant en contexte hémorragie du post-partum',
    'Suivi obstétrical intensifié : consultation sage-femme/obstétricien dans 1 semaine',
  ]),
  'Psychiatrie': toBullets([
    'Sertraline 50 mg/j le matin : titrer progressivement jusqu à 100–200 mg/j selon réponse (délai 4–6 sem.)',
    'Lorazépam 1 mg au coucher : max 2–4 semaines (insomnie/anxiété aiguë, pas de prescription prolongée)',
    'Aripiprazole 10 mg/j (psychose/trouble bipolaire) : titrer sous suivi psychiatrique strict',
    'Psychothérapie structurée (TCC) programmée : 12–16 séances selon protocole validé',
    'Consultation psychiatrie dans 2–4 semaines ; plan de crise remis + contacts urgences',
  ]),
  'Urgences et réanimation': toBullets([
    'Adrénaline 0,3–0,5 mg IM (choc anaphylactique) : répétable toutes les 5–15 min si nécessaire',
    'Prednisolone 1 mg/kg/j x 3–5 jours en relais après traitement de la réaction aiguë',
    'Cetirizine 10 mg/j x 7 jours (antihistaminique H1 en complément post-anaphylaxie)',
    'Check-list sortie : consultation allergologue dans 4–6 sem. ; prescription auto-injecteur adrénaline',
    'Bilan biologique à J7 : NFS, CRP selon contexte ; retour urgences si récurrence',
  ]),
  'Ophtalmologie': toBullets([
    'Tobramycine 0,3 % collyre : 1 goutte x 4/j pendant 7 jours (conjonctivite bactérienne)',
    'Latanoprost 0,005 % collyre : 1 goutte dans l œil atteint 1x le soir à vie (glaucome chronique)',
    'Fluorométholone 0,1 % collyre : 1 goutte x 4/j pendant 5–7 jours si uvéite légère',
    'Larmes artificielles sans conservateur x 4–6/j (syndrome sec oculaire chronique)',
    'Patchwork oculaire si plaie : ne pas retirer avant consultation ophtalmologique urgente',
  ]),
  'ORL': toBullets([
    'Amoxicilline 1 g x 3/j pendant 7 jours (sinusite bactérienne documentée ou > 10 jours)',
    'Ibuprofene 400 mg x 3/j pendant 5 jours (otalgie/pharyngite virale, alternative paracetamol)',
    'Prednisone 1 mg/kg/j pendant 5 jours (laryngite sous-glottique modérée ou choc laryngotrachéite)',
    'Rinçage nasal serum physiologique x 3/j (rhinosinusite, décongestionnement)',
    'Consultation ORL ou audiométrie si hypoacousie persistante > 3 semaines ou bouchon cholestéatome',
  ]),
  'Urologie': toBullets([
    'Cotrimoxazole forte (TMP 160/SMX 800 mg) x 2/j pendant 7–10 jours si prostatite/cystite masculin sensible',
    'Ciprofloxacine 500 mg x 2/j pendant 14 jours (prostatite bactérienne aiguë)',
    'Tamsulosine 0,4 mg/j le soir (rétention ou symptômes prostatiques) en attente d évaluation urologique',
    'Citrate de potassium 2 cp x 3/j (alcalinisation urines, lithiase oxalique) pendant 3–6 mois',
    'Consultation urologie dans 4 semaines ; échographie rénale si première lithiase ou infection compliquée',
  ]),
  'Oncologie': toBullets([
    'Ondansetron 8 mg x 2–3/j per os (antiémétique chimiothérapie induite, prémédication J0)',
    'Granisetron 2 mg/j per os + dexaméthasone 8 mg/j si protocole emetisant fort',
    'Acide folique 5 mg/j (supplémentation pendant chimiothérapie au méthotrexate)',
    'Paracetamol 1 g x 4/j en première intention douleur ; palier II/III selon évaluation oncologie',
    'Soins de bouche x 4/j avec bicarbonate de sodium 1,4 % (prévention mucite chimio/radiothérapie)',
  ]),
  'Hématologie': toBullets([
    'Sulfate ferreux 200 mg x 2/j entre les repas pendant 3–6 mois (anémie ferriprive, jusqu a normalisation ferritine)',
    'Acide folique 5 mg/j pendant 4 mois (carence en folates documentée)',
    'Hydroxycarbamide (hydroxyurée) 500–1 000 mg/j : uniquement sous supervision hématologique',
    'Aspirine 75 mg/j si polyglobulie ou thrombocytémie essentielle à risque thrombotique',
    'NFS de contrôle à 4 semaines ; consultation hématologie à 6 semaines avec bilan complet',
  ]),
  'Gériatrie': toBullets([
    'Revisiter et simplifier la liste médicamenteuse (déprescription si PIMs selon critères STOPP/START)',
    'Calcium 1 000 mg/j + Vitamine D3 800 UI/j (prévention ostéoporose/chutes sujet âgé)',
    'Rivastigmine 1,5 mg x 2/j aux repas (démence légère à modérée, titrer sur 4 semaines)',
    'Tramadol 50 mg x 2/j (douleur modérée, préférer à AINS chez sujet âgé, max 400 mg/j)',
    'Bilan gériatrique global à 1 mois : fragilité, nutrition (MNA), chutes, cognition (MMSE)',
  ]),
  'Néonatologie': toBullets([
    'Vitamine K1 1 mg IV ou IM à la naissance (prophylaxie hémorragie du nouveau-né)',
    'Amoxicilline 50 mg/kg/j IV en 2 injections + Gentamicine 4–5 mg/kg/j IV 1x/j (infection néonatale présumée)',
    'Glucose 10 % : bolus 2 mL/kg IV si hypoglycémie < 0,40 g/L, puis perfusion ajustée',
    'Surfactant exogène (Poractant alpha 200 mg/kg/dose IT) si détresse respiratoire néonatale par carence en surfactant',
    'Photothérapie intensive si bilirubine > seuil courbe OMS selon âge gestationnel et poids',
  ]),
};

const buildPathology2 = (raw: RawPathology, index: number): PathologyCatalogItem => {
  const slug = slugify(raw.title);
  const references = referencesByGroup[raw.groupe] || 'WHO guidance; CDC resources; NICE recommendations.';
  const dischargeOrder = dischargeOrderByGroup[raw.groupe] || toBullets([
    'Traitement adapté à la pathologie avec posologie, durée et précautions notées sur ordonnance.',
    'Consignes de surveillance écrites remises au patient et à l entourage.',
    'Consultation de suivi programmée dans 2 à 4 semaines.',
  ]);

  return {
    title: raw.title,
    slug,
    shortDescription: `Prise en charge pratique de ${raw.title.toLowerCase()} selon recommandations internationales.`,
    definition: toBullets([
      `${raw.title} est une pathologie qui nécessite une évaluation clinique structurée et une prise en charge adaptée.`,
      'La gravité est appréciée sur les signes cliniques, les comorbidités et le retentissement fonctionnel.',
      'L objectif est un diagnostic précoce et un traitement adapté au niveau de risque du patient.',
    ]),
    examinations: toBullets([
      'Anamnèse ciblée et examen clinique complet avec constantes vitales et score de gravité.',
      'Examens biologiques et/ou imagerie orientés par la présentation clinique et les drapeaux rouges.',
      'Réévaluation après traitement initial pour ajuster la conduite à tenir et dépister les complications.',
    ]),
    referentialDiagnosis: toBullets([
      'Diagnostic retenu sur faisceau clinico-paraclinique conforme aux recommandations de référence.',
      'Exclusion systématique des diagnostics différentiels urgents ou menaçant le pronostic vital.',
      'Stadification de la sévérité pour orienter la décision ambulatoire, hospitalisation ou urgence spécialisée.',
    ]),
    onSiteTreatment: toBullets([
      'Traitement initial symptomatique et étiologique selon protocole validé en vigueur.',
      'Correction des facteurs aggravants et prévention des complications immédiates.',
      'Orientation spécialisée rapide si critères de gravité ou échec du traitement initial.',
    ]),
    dischargeOrder,
    prevention: toBullets([
      'Éducation thérapeutique et renforcement de l observance médicamenteuse et des mesures non pharmacologiques.',
      'Mesures hygiéno-diététiques personnalisées et réduction des facteurs de risque modifiables.',
      'Dépistage précoce des rechutes et complications lors du suivi programmé.',
    ]),
    references,
    isFree: typeof raw.isFree === 'boolean' ? raw.isFree : index % 5 === 0,
    groupe: raw.groupe,
  };
};

const rawPathologies2: RawPathology[] = [
  // --- Maladies infectieuses (20) ---
  { title: 'Rickettsiose (fièvre boutonneuse)', groupe: 'Maladies infectieuses' },
  { title: 'Toxoplasmose cérébrale chez l immunodéprimé', groupe: 'Maladies infectieuses' },
  { title: 'Leishmaniose viscérale', groupe: 'Maladies infectieuses' },
  { title: 'Trypanosomiase africaine', groupe: 'Maladies infectieuses' },
  { title: 'Filariose lymphatique', groupe: 'Maladies infectieuses' },
  { title: 'Histoplasmose pulmonaire', groupe: 'Maladies infectieuses' },
  { title: 'Cryptosporidiose chez l immunodéprimé', groupe: 'Maladies infectieuses' },
  { title: 'Amibiase hépatique', groupe: 'Maladies infectieuses' },
  { title: 'Fièvre récurrente à tiques (Borrelia)', groupe: 'Maladies infectieuses' },
  { title: 'Brucellose', groupe: 'Maladies infectieuses' },
  { title: 'Pneumocystose (Pneumocystis jirovecii)', groupe: 'Maladies infectieuses' },
  { title: 'Cryptococcose méningée', groupe: 'Maladies infectieuses' },
  { title: 'Infection à CMV chez l immunodéprimé', groupe: 'Maladies infectieuses' },
  { title: 'Hépatite E', groupe: 'Maladies infectieuses' },
  { title: 'Fièvre Ebola (prise en charge de support)', groupe: 'Maladies infectieuses' },
  { title: 'Ankylostomose', groupe: 'Maladies infectieuses' },
  { title: 'Schistosomiase', groupe: 'Maladies infectieuses' },
  { title: 'Tétanos généralisé', groupe: 'Maladies infectieuses' },
  { title: 'Diphtérie', groupe: 'Maladies infectieuses' },
  { title: 'Infections à entérobactéries productrices de BLSE', groupe: 'Maladies infectieuses', isFree: true },

  // --- Cardiologie (15) ---
  { title: 'Choc cardiogénique', groupe: 'Cardiologie' },
  { title: 'Bloc auriculo-ventriculaire complet', groupe: 'Cardiologie' },
  { title: 'Tachycardie supraventriculaire paroxystique', groupe: 'Cardiologie' },
  { title: 'Cardiomyopathie hypertrophique', groupe: 'Cardiologie' },
  { title: 'Myocardite aiguë', groupe: 'Cardiologie' },
  { title: 'Sténose mitrale rhumatismale', groupe: 'Cardiologie' },
  { title: 'Insuffisance mitrale chronique', groupe: 'Cardiologie' },
  { title: 'Communication interauriculo-ventriculaire', groupe: 'Cardiologie' },
  { title: 'Anévrysme ventriculaire gauche', groupe: 'Cardiologie' },
  { title: 'Hypertension pulmonaire artérielle', groupe: 'Cardiologie' },
  { title: 'Insuffisance cardiaque à fraction d éjection préservée', groupe: 'Cardiologie' },
  { title: 'Artériopathie oblitérante des membres inférieurs', groupe: 'Cardiologie', isFree: true },
  { title: 'Syndrome de Wolff-Parkinson-White', groupe: 'Cardiologie' },
  { title: 'Athérosclérose multisites', groupe: 'Cardiologie' },
  { title: 'Rétrécissement aortique serré', groupe: 'Cardiologie' },

  // --- Pédiatrie (15) ---
  { title: 'Invagination intestinale aiguë', groupe: 'Pédiatrie' },
  { title: 'Syndrome néphrotique de l enfant', groupe: 'Pédiatrie' },
  { title: 'Diabète de type 1 de l enfant', groupe: 'Pédiatrie' },
  { title: 'Asthme de l enfant', groupe: 'Pédiatrie' },
  { title: 'Méningite bactérienne du nourrisson', groupe: 'Pédiatrie' },
  { title: 'Déficit immunitaire combiné sévère', groupe: 'Pédiatrie' },
  { title: 'Kawasaki', groupe: 'Pédiatrie' },
  { title: 'Purpura rhumatoïde (Schönlein-Henoch)', groupe: 'Pédiatrie', isFree: true },
  { title: 'Leucémie aiguë lymphoblastique de l enfant', groupe: 'Pédiatrie' },
  { title: 'Hypothyroïdie congénitale', groupe: 'Pédiatrie' },
  { title: 'Retard de croissance intra-utérin', groupe: 'Pédiatrie' },
  { title: 'Spina bifida', groupe: 'Pédiatrie' },
  { title: 'Hernies de l enfant', groupe: 'Pédiatrie' },
  { title: 'Pyélonéphrite de l enfant', groupe: 'Pédiatrie' },
  { title: 'Thalassémie majeure', groupe: 'Pédiatrie' },

  // --- Gastroentérologie (12) ---
  { title: 'Varices oesophagiennes hémorragiques', groupe: 'Gastroentérologie' },
  { title: 'Ascite cirrhotique réfractaire', groupe: 'Gastroentérologie' },
  { title: 'Hépatite auto-immune', groupe: 'Gastroentérologie' },
  { title: 'Appendicite aiguë', groupe: 'Gastroentérologie' },
  { title: 'Occlusion intestinale aiguë', groupe: 'Gastroentérologie' },
  { title: 'Diverticulite colique aiguë', groupe: 'Gastroentérologie' },
  { title: 'Hernie hiatale symptomatique', groupe: 'Gastroentérologie', isFree: true },
  { title: 'Iléus paralytique post-opératoire', groupe: 'Gastroentérologie' },
  { title: 'Hémorroïdes symptomatiques', groupe: 'Gastroentérologie' },
  { title: 'Maladie coeliaque', groupe: 'Gastroentérologie' },
  { title: 'Constipation chronique de l adulte', groupe: 'Gastroentérologie' },
  { title: 'Cancer colorectal (prise en charge initiale)', groupe: 'Gastroentérologie' },

  // --- Neurologie (12) ---
  { title: 'Maladie d Alzheimer', groupe: 'Neurologie' },
  { title: 'Démence vasculaire', groupe: 'Neurologie' },
  { title: 'Névralgie du trijumeau', groupe: 'Neurologie' },
  { title: 'Neuropathie optique', groupe: 'Neurologie', isFree: true },
  { title: 'Myasthénie', groupe: 'Neurologie' },
  { title: 'Tumeur cérébrale primitive (prise en charge initiale)', groupe: 'Neurologie' },
  { title: 'Encéphalite herpétique', groupe: 'Neurologie' },
  { title: 'Céphalée de tension chronique', groupe: 'Neurologie' },
  { title: 'Hydrocéphalie', groupe: 'Neurologie' },
  { title: 'Paralysie faciale périphérique (de Bell)', groupe: 'Neurologie' },
  { title: 'Neuropathie à VIH', groupe: 'Neurologie' },
  { title: 'AVC hémorragique', groupe: 'Neurologie' },

  // --- Pneumologie (10) ---
  { title: 'Épanchement pleural malin', groupe: 'Pneumologie' },
  { title: 'Aspergillose pulmonaire invasive', groupe: 'Pneumologie', isFree: true },
  { title: 'Pneumonie à COVID-19', groupe: 'Pneumologie' },
  { title: 'Hypertension pulmonaire thrombo-embolique chronique', groupe: 'Pneumologie' },
  { title: 'Sarcoïdose pulmonaire', groupe: 'Pneumologie' },
  { title: 'Silicose', groupe: 'Pneumologie' },
  { title: 'Hémoptysie importante', groupe: 'Pneumologie' },
  { title: 'Cancer bronchique non à petites cellules (CBNPC)', groupe: 'Pneumologie' },
  { title: 'Mucoviscidose adulte', groupe: 'Pneumologie' },
  { title: 'Pneumopathie interstitielle diffuse', groupe: 'Pneumologie' },

  // --- Endocrinologie (10) ---
  { title: 'Syndrome de Cushing', groupe: 'Endocrinologie' },
  { title: 'Phéochromocytome', groupe: 'Endocrinologie' },
  { title: 'Hyperaldostéronisme primaire', groupe: 'Endocrinologie' },
  { title: 'Hypoparathyroïdie post-chirurgicale', groupe: 'Endocrinologie', isFree: true },
  { title: 'Syndrome des ovaires polykystiques', groupe: 'Endocrinologie' },
  { title: 'Insuffisance hypophysaire', groupe: 'Endocrinologie' },
  { title: 'Acromégalie', groupe: 'Endocrinologie' },
  { title: 'Cancer thyroïdien différencié', groupe: 'Endocrinologie' },
  { title: 'Ostéomalacie par carence en vitamine D', groupe: 'Endocrinologie' },
  { title: 'Hypercalcémie maligne', groupe: 'Endocrinologie' },

  // --- Ophtalmologie (10) ---
  { title: 'Glaucome chronique à angle ouvert', groupe: 'Ophtalmologie' },
  { title: 'Rétinopathie diabétique', groupe: 'Ophtalmologie' },
  { title: 'Cataracte (prise en charge préopératoire)', groupe: 'Ophtalmologie', isFree: true },
  { title: 'Décollement de rétine', groupe: 'Ophtalmologie' },
  { title: 'Uvéite antérieure aiguë', groupe: 'Ophtalmologie' },
  { title: 'Dégénérescence maculaire liée à l âge (DMLA)', groupe: 'Ophtalmologie' },
  { title: 'Occlusion de l artère centrale de la rétine', groupe: 'Ophtalmologie' },
  { title: 'Kératocône', groupe: 'Ophtalmologie' },
  { title: 'Cellulite orbitaire', groupe: 'Ophtalmologie' },
  { title: 'Amblyopie de l enfant', groupe: 'Ophtalmologie' },

  // --- ORL (10) ---
  { title: 'Sinusite chronique avec polypes nasaux', groupe: 'ORL' },
  { title: 'Surdité de transmission', groupe: 'ORL' },
  { title: 'Acouphènes chroniques', groupe: 'ORL', isFree: true },
  { title: 'Angine ulcéreuse (mononucléose infectieuse)', groupe: 'ORL' },
  { title: 'Épistaxis récidivante', groupe: 'ORL' },
  { title: 'Corps étranger laryngé (prise en charge de l adulte)', groupe: 'ORL' },
  { title: 'Cancer du larynx (stadification initiale)', groupe: 'ORL' },
  { title: 'Mastoïdite aiguë', groupe: 'ORL' },
  { title: 'Trouble de déglutition (dysphagie oropharyngée)', groupe: 'ORL' },
  { title: 'Cholestéatome de l oreille moyenne', groupe: 'ORL' },

  // --- Urologie (10) ---
  { title: 'Hypertrophie bénigne de la prostate', groupe: 'Urologie', isFree: true },
  { title: 'Cancer de la prostate (dépistage/stadification initiale)', groupe: 'Urologie' },
  { title: 'Cancer de la vessie (prise en charge initiale)', groupe: 'Urologie' },
  { title: 'Prostatite chronique', groupe: 'Urologie' },
  { title: 'Torsion testiculaire', groupe: 'Urologie' },
  { title: 'Orchi-épididymite', groupe: 'Urologie' },
  { title: 'Rétention aiguë d urine', groupe: 'Urologie' },
  { title: 'Incontinence urinaire de la femme', groupe: 'Urologie' },
  { title: 'Hydronéphrose', groupe: 'Urologie' },
  { title: 'Sténose uréthrale', groupe: 'Urologie' },

  // --- Oncologie (10) ---
  { title: 'Cancer du sein (prise en charge initiale)', groupe: 'Oncologie', isFree: true },
  { title: 'Cancer du col utérin', groupe: 'Oncologie' },
  { title: 'Cancer du foie (carcinome hépatocellulaire)', groupe: 'Oncologie' },
  { title: 'Lymphome de Hodgkin', groupe: 'Oncologie' },
  { title: 'Lymphome non hodgkinien diffus à grandes cellules B', groupe: 'Oncologie' },
  { title: 'Mélanome cutané (stadification initiale)', groupe: 'Oncologie' },
  { title: 'Cancer pulmonaire à petites cellules', groupe: 'Oncologie' },
  { title: 'Cancer gastrique (prise en charge initiale)', groupe: 'Oncologie' },
  { title: 'Myélome multiple', groupe: 'Oncologie' },
  { title: 'Cancer du pancréas (prise en charge palliative initiale)', groupe: 'Oncologie' },

  // --- Hématologie (10) ---
  { title: 'Anémie hémolytique auto-immune', groupe: 'Hématologie' },
  { title: 'Purpura thrombopénique immunologique', groupe: 'Hématologie', isFree: true },
  { title: 'Leucémie myéloïde chronique', groupe: 'Hématologie' },
  { title: 'Leucémie aiguë myéloblastique de l adulte', groupe: 'Hématologie' },
  { title: 'Thrombophilie héréditaire (facteur V Leiden)', groupe: 'Hématologie' },
  { title: 'Polyglobulie de Vaquez', groupe: 'Hématologie' },
  { title: 'Thrombocytémie essentielle', groupe: 'Hématologie' },
  { title: 'Aplasie médullaire', groupe: 'Hématologie' },
  { title: 'Mononucléose infectieuse (EBV)', groupe: 'Hématologie' },
  { title: 'Coagulation intravasculaire disséminée (CIVD)', groupe: 'Hématologie' },

  // --- Gériatrie (10) ---
  { title: 'Syndrome de fragilité du sujet âgé', groupe: 'Gériatrie', isFree: true },
  { title: 'Démence à corps de Lewy', groupe: 'Gériatrie' },
  { title: 'Syndrome confusionnel du sujet âgé', groupe: 'Gériatrie' },
  { title: 'Chutes répétées chez le sujet âgé', groupe: 'Gériatrie' },
  { title: 'Malnutrition protéino-énergétique du sujet âgé', groupe: 'Gériatrie' },
  { title: 'Escarres de pression', groupe: 'Gériatrie' },
  { title: 'Iatrogénie médicamenteuse du sujet âgé', groupe: 'Gériatrie' },
  { title: 'Polyarthrite pseudo-goutteuse du sujet âgé', groupe: 'Gériatrie' },
  { title: 'Insuffisance cardiaque du sujet âgé (prise en charge spécifique)', groupe: 'Gériatrie' },
  { title: 'Dépression du sujet âgé', groupe: 'Gériatrie' },

  // --- Néonatologie (10) ---
  { title: 'Détresse respiratoire néonatale', groupe: 'Néonatologie', isFree: true },
  { title: 'Hypoglycémie néonatale', groupe: 'Néonatologie' },
  { title: 'Ictère néonatal pathologique', groupe: 'Néonatologie' },
  { title: 'Entérocolite ulcéro-nécrosante', groupe: 'Néonatologie' },
  { title: 'Infection néonatale précoce', groupe: 'Néonatologie' },
  { title: 'Encéphalopathie hypoxique-ischémique du nouveau-né', groupe: 'Néonatologie' },
  { title: 'Convulsions néonatales', groupe: 'Néonatologie' },
  { title: 'Grand prématuré (< 32 SA) : prise en charge initiale', groupe: 'Néonatologie' },
  { title: 'Hernie diaphragmatique congénitale', groupe: 'Néonatologie' },
  { title: 'Retard de fermeture du canal artériel', groupe: 'Néonatologie' },

  // --- Rhumatologie extra (16) ---
  { title: 'Spondylodiscite infectieuse', groupe: 'Rhumatologie', isFree: true },
  { title: 'Syndrome de Sjögren primaire', groupe: 'Rhumatologie' },
  { title: 'Sclérodermie systémique', groupe: 'Rhumatologie' },
  { title: 'Myosite inflammatoire', groupe: 'Rhumatologie' },
  { title: 'Fibromyalgie', groupe: 'Rhumatologie' },
  { title: 'Pseudopolyarthrite rhizomélique', groupe: 'Rhumatologie' },
  { title: 'Artérite à cellules géantes de Horton', groupe: 'Rhumatologie' },
  { title: 'Polyarthrite psoriasique', groupe: 'Rhumatologie', isFree: true },
  { title: 'Bursite de l épaule', groupe: 'Rhumatologie' },
  { title: 'Syndrome du canal carpien', groupe: 'Rhumatologie' },
  { title: 'Ostéonécrose aseptique de la tête fémorale', groupe: 'Rhumatologie' },
  { title: 'Maladie de Paget osseuse', groupe: 'Rhumatologie' },
  { title: 'Arthrite septique', groupe: 'Rhumatologie' },
  { title: 'Tendinopathie du tendon d Achille', groupe: 'Rhumatologie' },
  { title: 'Rachialgie inflammatoire juvénile', groupe: 'Rhumatologie' },
  { title: 'Osteoarthrite de la hanche (coxarthrose)', groupe: 'Rhumatologie', isFree: true },

  // --- Dermatologie extra (10) ---
  { title: 'Pemphigus vulgaire', groupe: 'Dermatologie', isFree: true },
  { title: 'Sarcome de Kaposi', groupe: 'Dermatologie' },
  { title: 'Lichénification chronique', groupe: 'Dermatologie' },
  { title: 'Mélanome malin en situ (prise en charge dermatologique)', groupe: 'Dermatologie' },
  { title: 'Carcinome basocellulaire', groupe: 'Dermatologie' },
  { title: 'Carcinome épidermoïde cutané', groupe: 'Dermatologie' },
  { title: 'Erythème polymorphe', groupe: 'Dermatologie' },
  { title: 'Syndrome de Stevens-Johnson', groupe: 'Dermatologie' },
  { title: 'Rosacée', groupe: 'Dermatologie', isFree: true },
  { title: 'Alopécie areata', groupe: 'Dermatologie' },

  // --- Gynécologie-Obstétrique extra (4) ---
  { title: 'Grossesse extra-utérine', groupe: 'Gynécologie-Obstétrique', isFree: true },
  { title: 'Fibromes utérins symptomatiques', groupe: 'Gynécologie-Obstétrique' },
  { title: 'Cancer de l endomètre (prise en charge initiale)', groupe: 'Gynécologie-Obstétrique' },
  { title: 'Syndrome des ovaires polykystiques (SOPK)', groupe: 'Gynécologie-Obstétrique' },

  // --- Urgences et réanimation extra (4) ---
  { title: 'Arrêt cardio-respiratoire (prise en charge post-réanimation)', groupe: 'Urgences et réanimation', isFree: true },
  { title: 'Hyperthermie maligne (coup de chaleur)', groupe: 'Urgences et réanimation' },
  { title: 'Noyade (prise en charge à l arrivée)', groupe: 'Urgences et réanimation' },
  { title: 'Hypothermie accidentelle sévère', groupe: 'Urgences et réanimation' },
  { title: 'Intoxication au monoxyde de carbone', groupe: 'Urgences et réanimation' },
  { title: 'Crush syndrome (rhabdomyolyse traumatique)', groupe: 'Urgences et réanimation' },
];

if (rawPathologies2.length !== 200) {
  throw new Error(`Le lot 2 doit contenir exactement 200 pathologies. Recu: ${rawPathologies2.length}`);
}

export const EXTRA_PATHOLOGIES_200: PathologyCatalogItem[] = rawPathologies2.map((raw, index) =>
  buildPathology2(raw, index),
);
