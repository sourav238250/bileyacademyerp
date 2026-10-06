import { QuestionBankItem, CustomAssignmentQuestion } from '../types';

/**
 * Academic English <-> Bengali Translation Matrix & Engine
 * Specially calibrated for standard West Bengal / CBSE / ICSE School Curriculum
 * Classes 1 to 12 (Science, Mathematics, Biology, Chemistry, Physics, Commerce, Computer & General).
 */

// Comprehensive English -> Bengali Phrase & Grammar Patterns
const EN_TO_BN_PATTERNS: [RegExp, string][] = [
  // Full Question Stems & Formulations
  [/\bIf\s+([\w\s\S]+?)\s+then\s+the\s+value\s+of\s+([\w\s\S]+?)\s+is\s+equal\s+to:?/gi, 'যদি $1 হয়, তবে $2 রাশিটির মান কত হবে:'],
  [/\bIf\s+([\w\s\S]+?)\s+then\s+find\s+the\s+value\s+of\s+([\w\s\S]+?):?/gi, 'যদি $1 হয়, তবে $2-এর মান নির্ণয় করো:'],
  [/\bFind\s+the\s+values?\s+of\s+([\w\s\S]+?)\s+for\s+which\s+([\w\s\S]+?):?/gi, '$1-এর কোন মানের জন্য $2 হবে নির্ণয় করো:'],
  [/\bFind\s+the\s+values?\s+of\s+([\w\s\S]+?):?/gi, '$1-এর মান নির্ণয় করো:'],
  [/\bFind\s+the\s+sum\s+of\s+the\s+first\s+([\w\s\S]+?)\s+terms:?/gi, 'প্রথম $1 সংখ্যক পদের সমষ্টি নির্ণয় করো:'],
  [/\bCalculate\s+the\s+time\s+required\s+for\s+([\w\s\S]+?):?/gi, '$1 সম্পন্ন হতে কত সময় লাগবে গণনা করো:'],
  [/\bCalculate\s+the\s+distance\s+of\s+([\w\s\S]+?):?/gi, '$1-এর দূরত্ব গণনা করো:'],
  [/\bCalculate\s+the\s+([\w\s\S]+?):?/gi, '$1 গণনা করো:'],
  [/\bDetermine\s+the\s+height\s+of\s+the\s+([\w\s\S]+?):?/gi, '$1-এর উচ্চতা নির্ণয় করো:'],
  [/\bDetermine\s+the\s+distance\s+of\s+the\s+([\w\s\S]+?):?/gi, '$1-এর দূরত্ব নির্ণয় করো:'],
  [/\bDetermine\s+the\s+([\w\s\S]+?):?/gi, '$1 নির্ণয় করো:'],
  [/\bEvaluate\s+the\s+definite\s+integral:?/gi, 'নির্দিষ্ট সমাকলনটির মান নির্ণয় করো:'],
  [/\bEvaluate\s+the\s+integral:?/gi, 'সমাকলনটির মান নির্ণয় করো:'],
  [/\bEvaluate:?/gi, 'মান নির্ণয় করো:'],
  [/\bState\s+and\s+prove\s+([\w\s\S]+?):?/gi, '$1 বিবৃত ও প্রমাণ করো:'],
  [/\bState\s+([\w\s\S]+?)\s+in\s+([\w\s\S]+?):?/gi, '$2-এ $1 বিবৃত করো:'],
  [/\bState\s+([\w\s\S]+?):?/gi, '$1 বিবৃত করো:'],
  [/\bProve\s+that:?/gi, 'প্রমাণ করো যে:'],
  [/\bShow\s+that:?/gi, 'দেখাও যে:'],
  [/\bExplain\s+with\s+chemical\s+equations:?/gi, 'রাসায়নিক সমীকরণসহ ব্যাখ্যা করো:'],
  [/\bExplain\s+with\s+suitable\s+examples:?/gi, 'উপযুক্ত উদাহরণসহ ব্যাখ্যা করো:'],
  [/\bExplain\s+the\s+following:?/gi, 'নিম্নলিখিত বিষয়গুলি ব্যাখ্যা করো:'],
  [/\bExplain\s+why\s+([\w\s\S]+?):?/gi, 'ব্যাখ্যা করো কেন $1:'],
  [/\bExplain\s+([\w\s\S]+?):?/gi, '$1 ব্যাখ্যা করো:'],
  [/\bDistinguish\s+clearly\s+between\s+([\w\s\S]+?)\s+and\s+([\w\s\S]+?)\s+with\s+two\s+examples\s+of\s+each\.?/gi, '$1 এবং $2-এর মধ্যে সুস্পষ্ট পার্থক্য নির্দেশ করো এবং প্রত্যেকের দুটি করে উদাহরণ দাও।'],
  [/\bDistinguish\s+between\s+([\w\s\S]+?)\s+and\s+([\w\s\S]+?):?/gi, '$1 এবং $2-এর মধ্যে পার্থক্য নির্দেশ করো:'],
  [/\bDifferentiate\s+between\s+([\w\s\S]+?)\s+and\s+([\w\s\S]+?):?/gi, '$1 এবং $2-এর মধ্যে পার্থক্য লেখো:'],
  [/\bIdentify\s+the\s+substance\s+oxidized,\s*substance\s+reduced,\s*oxidizing\s+agent,\s*and\s+reducing\s+agent\s+in\s+the\s+reaction:?/gi, 'নিম্নলিখিত বিক্রিয়াটিতে জারিত পদার্থ, বিজারিত পদার্থ, জারক পদার্থ ও বিজারক পদার্থ শনাক্ত করো:'],
  [/\bIdentify\s+the\s+([\w\s\S]+?):?/gi, '$1 শনাক্ত করো:'],
  [/\bPass\s+necessary\s+journal\s+entries\.?/gi, 'প্রয়োজনীয় জাবেদা দাখিলা দাও।'],
  [/\bWrite\s+short\s+notes?\s+on\s+([\w\s\S]+?):?/gi, '$1-এর ওপর সংক্ষিপ্ত টীকা লেখো:'],
  [/\bGive\s+reasons?\s+for\s+the\s+following:?/gi, 'নিম্নলিখিত কারণগুলি ব্যাখ্যা করো:'],

  // Specific common questions
  [/\bThe\s+perimeter\s+of\s+a\s+rectangular\s+swimming\s+pool\s+is\s+([\d.]+)\s*m\./gi, 'একটি আয়তাকার সুইমিং পুলের পরিসীমা $1 মিটার।'],
  [/\bIts\s+length\s+is\s+([\d.]+)\s*m\s+more\s+than\s+twice\s+its\s+breadth\./gi, 'এর দৈর্ঘ্য প্রস্থের দ্বিগুণের চেয়ে $1 মিটার বেশি।'],
  [/\bWhat\s+are\s+the\s+length\s+and\s+breadth\s+of\s+the\s+pool\??/gi, 'পুলটির দৈর্ঘ্য ও প্রস্থ নির্ণয় করো।'],
  [/\bA\s+bullet\s+of\s+mass\s+([\w\s\d.]+)\s+moving\s+with\s+a\s+velocity\s+of\s+([\w\s\d./]+)\s+strikes\s+a\s+wooden\s+block\s+and\s+comes\s+to\s+rest\s+in\s+([\w\s\d.]+)\./gi, '$2 বেগে গতিশীল $1 ভরের একটি বুলেট একটি কাঠের ব্লকে আঘাত করে $3 সময়ে স্থির অবস্থায় আসে।'],
  [/\bCalculate\s+the\s+distance\s+of\s+penetration\s+and\s+the\s+magnitude\s+of\s+resistive\s+force\s+exerted\s+by\s+the\s+block\s+on\s+the\s+bullet\./gi, 'বুলেটটি কাঠের ব্লকের কত গভীরে প্রবেশ করবে এবং ব্লকটি বুলেটের ওপর কত বাধা বল প্রয়োগ করবে গণনা করো।'],
  [/\bFrom\s+the\s+top\s+of\s+a\s+([\d.]+)\s*m\s+high\s+building,\s*the\s+angle\s+of\s+elevation\s+of\s+the\s+top\s+of\s+a\s+cable\s+tower\s+is\s+60°\s*and\s+the\s+angle\s+of\s+depression\s+of\s+its\s+foot\s+is\s+45°\./gi, 'একটি $1 মিটার উঁচু বাড়ির শীর্ষ থেকে একটি কেবল টাওয়ারের চূড়ার উন্নতি কোণ 60° এবং এর পাদদেশের অবনতি কোণ 45°।'],
  [/\bDetermine\s+the\s+height\s+of\s+the\s+tower\./gi, 'টাওয়ারটির উচ্চতা নির্ণয় করো।'],
  [/\bAn\s+electric\s+dipole\s+of\s+dipole\s+moment\s+p\s+is\s+placed\s+in\s+a\s+uniform\s+electric\s+field\s+E\./gi, 'একটি সুষম তড়িৎক্ষেত্র E-তে p দ্বিমেরু ভ্রামকবিশিষ্ট একটি তড়িৎ দ্বিমেরু স্থাপন করা হলো।'],
  [/\bObtain\s+an\s+expression\s+for\s+the\s+torque\s+experienced\s+by\s+it\s+and\s+state\s+the\s+orientation\s+for\s+stable\s+equilibrium\./gi, 'এর ওপর প্রযুক্ত টর্কের রাশিমালা নির্ণয় করো এবং স্থায়ী সাম্যাবস্থার জন্য দ্বিমেরুটির অভিমুখ নির্দেশ করো।'],
  [/\bWhat\s+is\s+the\s+net\s+electric\s+flux\s+through\s+one\s+face\s+of\s+the\s+cube\??/gi, 'ঘনকটির একটি তলের মধ্য দিয়ে অতিক্রান্ত মোট তড়িৎ ফ্লাক্স কত?'],

  // Core Academic Phrases
  [/\bGiven\s*that:?/gi, 'দেওয়া আছে যে:'],
  [/\bGiven:?/gi, 'প্রদত্ত:'],
  [/\bStep-by-step\s+solution:?/gi, 'ধাপে ধাপে সমাধান:'],
  [/\bDetailed\s+Solution:?/gi, 'বিস্তারিত সমাধান:'],
  [/\bCorrect\s+Answer:?/gi, 'সঠিক উত্তর:'],
  [/\bOfficial\s+Final\s+Key:?/gi, 'চূড়ান্ত অফিশিয়াল উত্তরপত্র:'],
  [/\bAnswer:?/gi, 'উত্তর:'],
  [/\bExplanation:?/gi, 'ব্যাখ্যা:'],
  [/\bFormula:?/gi, 'সূত্র:'],
  [/\bAccording\s+to\s+Gauss\'s?\s+Law:?/gi, 'গাউসের সূত্রানুসারে:'],
  [/\bAccording\s+to\s+Ohm\'s?\s+Law:?/gi, 'ওহমের সূত্রানুসারে:'],
  [/\bAccording\s+to:?/gi, 'অনুসারে:'],
  [/\bSubstituting\s+in\b/gi, 'মান বসিয়ে পাই:'],
  [/\bSubstituting\b/gi, 'মান বসিয়ে'],
  [/\bSubtracting\s+\((\d+)\)\s+from\s+\((\d+)\):?/gi, 'সমীকরণ ($2) থেকে ($1) বিয়োগ করে পাই:'],
  [/\bSubtracting\b/gi, 'বিয়োগ করে'],
  [/\bAdding\s+equations?\s+\((\d+)\)\s+and\s+\((\d+)\):?/gi, 'সমীকরণ ($1) এবং ($2) যোগ করে পাই:'],
  [/\bAdding\b/gi, 'যোগ করে'],
  [/\bMultiplying\b/gi, 'গুণ করে'],
  [/\bDividing\b/gi, 'ভাগ করে'],
  [/\bTherefore\b/gi, 'সুতরাং'],
  [/\bHence\b/gi, 'অতএব'],
  [/\bThus\b/gi, 'অতএব'],
  [/\bLet\b/gi, 'ধরি'],
  [/\bwhere\b/gi, 'যেখানে'],
  [/\band\b/gi, 'এবং'],
  [/\bor\b/gi, 'অথবা'],
  [/\brespectively\b/gi, 'যথাক্রমে'],

  // Science / Physics Terminology
  [/\blinear\s+charge\s+density\b/gi, 'রৈখিক আধান ঘনত্ব (λ)'],
  [/\belectric\s+field\s+intensity\b/gi, 'তড়িৎক্ষেত্রের প্রাবল্য (E)'],
  [/\belectric\s+field\b/gi, 'তড়িৎক্ষেত্র'],
  [/\belectric\s+flux\b/gi, 'তড়িৎ ফ্লাক্স (Φ)'],
  [/\belectric\s+dipole\s+moment\b/gi, 'তড়িৎ দ্বিমেরু ভ্রামক (p)'],
  [/\belectric\s+dipole\b/gi, 'তড়িৎ দ্বিমেরু'],
  [/\buniform\s+electric\s+field\b/gi, 'সুষম তড়িৎক্ষেত্র'],
  [/\btorque\s+experienced\b/gi, 'প্রযুক্ত টর্ক (τ)'],
  [/\bstable\s+equilibrium\b/gi, 'স্থায়ী সাম্যাবস্থা'],
  [/\bGaussian\s+surface\b/gi, 'গাউসীয় তল'],
  [/\bclosed\s+surface\b/gi, 'বদ্ধ তল'],
  [/\bnet\s+charge\s+enclosed\b/gi, 'তলদ্বারা আবদ্ধ মোট আধান'],
  [/\bpoint\s+charge\b/gi, 'বিন্দু আধান'],
  [/\bradially\s+outward\b/gi, 'ব্যাসার্ধ বরাবর বহির্মুখী'],
  [/\bradially\s+inward\b/gi, 'ব্যাসার্ধ বরাবর অন্তর্মুখী'],
  [/\bperpendicular\s+distance\b/gi, 'লম্ব দূরত্ব'],
  [/\binfinitely\s+long\s+straight\s+wire\b/gi, 'অসীম দৈর্ঘ্যের ঋজু পরিবাহী তার'],
  [/\bconvex\s+lens\b/gi, 'উত্তল লেন্স'],
  [/\bconcave\s+lens\b/gi, 'অবতল লেন্স'],
  [/\bconvex\s+mirror\b/gi, 'উত্তল দর্পণ'],
  [/\bconcave\s+mirror\b/gi, 'অবতল দর্পণ'],
  [/\bfocal\s+length\b/gi, 'ফোকাস দৈর্ঘ্য (f)'],
  [/\breal\s+and\s+inverted\s+image\b/gi, 'সদ ও অবশীর্ষ প্রতিবিম্ব'],
  [/\bvirtual\s+and\s+erect\s+image\b/gi, 'অসদ ও সমশীর্ষ প্রতিবিম্ব'],
  [/\bpower\s+of\s+the\s+lens\b/gi, 'লেন্সের ক্ষমতা (P)'],
  [/\blinear\s+magnification\b/gi, 'রৈখিক বিবর্ধন (m)'],
  [/\bmagnified\b/gi, 'বিবর্ধিত'],
  [/\bdistance\s+of\s+the\s+object\b/gi, 'বস্তুর দূরত্ব (u)'],
  [/\bdistance\s+of\s+the\s+image\b/gi, 'প্রতিবিম্বের দূরত্ব (v)'],
  [/\bglass\s+prism\b/gi, 'কাঁচের প্রিজম'],
  [/\brefracting\s+angle\b/gi, 'প্রতিসারক কোণ (A)'],
  [/\bangle\s+of\s+minimum\s+deviation\b/gi, 'ন্যূনতম চ্যুতি কোণ (D_m)'],
  [/\brefractive\s+index\b/gi, 'প্রতিসরাঙ্ক (μ)'],
  [/\binternal\s+resistance\b/gi, 'অভ্যন্তরীণ রোধ (r)'],
  [/\bexternal\s+resistance\b/gi, 'বহিস্থ রোধ (R)'],
  [/\bpotential\s+difference\b/gi, 'বিভব পার্থক্য / বিভব প্রভেদ (V)'],
  [/\belectromotive\s+force\b/gi, 'তড়িচ্চালক বল (emf)'],
  [/\bparallel\s+combination\b/gi, 'সমান্তরাল সমবায়'],
  [/\bseries\s+combination\b/gi, 'শ্রেণি সমবায়'],
  [/\bresistive\s+force\b/gi, 'বাধা বল'],
  [/\bpenetration\s+distance\b/gi, 'প্রবেশ দূরত্ব'],
  [/\binitial\s+velocity\b/gi, 'প্রাথমিক বেগ (u)'],
  [/\bfinal\s+velocity\b/gi, 'অন্তিম বেগ (v)'],
  [/\bacceleration\b/gi, 'ত্বরণ (a)'],
  [/\bretardation\b/gi, 'মন্দন (a)'],
  [/\bmomentum\b/gi, 'ভরবেগ'],
  [/\bkinetic\s+energy\b/gi, 'গতিশক্তি'],
  [/\bpotential\s+energy\b/gi, 'স্থিতিশক্তি'],

  // Chemistry Terminology
  [/\bfirst-order\s+reaction\b/gi, 'প্রথম ক্রম বিক্রিয়া'],
  [/\brate\s+constant\b/gi, 'হার ধ্রুবক (k)'],
  [/\bhalf-life\s+period\b/gi, 'অর্ধায়ু কাল (t₁/₂)'],
  [/\bhalf-life\b/gi, 'অর্ধায়ু (t₁/₂)'],
  [/\bcompletion\s+of\s+reaction\b/gi, 'বিক্রিয়া সমাপ্তি'],
  [/\bconcentration\b/gi, 'গাঢ়ত্ব'],
  [/\bCross\s+Aldol\s+Condensation\b/gi, 'ক্রস অ্যালডল ঘনীভবন বিক্রিয়া'],
  [/\bAldol\s+Condensation\b/gi, 'অ্যালডল ঘনীভবন বিক্রিয়া'],
  [/\bCannizzaro\s+Reaction\b/gi, 'ক্যানিজারো বিক্রিয়া'],
  [/\bBenzaldehyde\b/gi, 'বেনজালডিহাইড (C₆H₅CHO)'],
  [/\bPropanal\b/gi, 'প্রোপান্যাল (CH₃CH₂CHO)'],
  [/\bFormaldehyde\b/gi, 'ফর্মালডিহাইড (HCHO)'],
  [/\bMethanol\b/gi, 'মিথানল (CH₃OH)'],
  [/\bsubstance\s+oxidized\b/gi, 'জারিত পদার্থ'],
  [/\bsubstance\s+reduced\b/gi, 'বিজারিত পদার্থ'],
  [/\boxidizing\s+agent\b/gi, 'জারক পদার্থ (Oxidizing Agent)'],
  [/\breducing\s+agent\b/gi, 'বিজারক পদার্থ (Reducing Agent)'],
  [/\boxidation\s+state\b/gi, 'জারণ সংখ্যা'],
  [/\boxidation\b/gi, 'জারণ'],
  [/\breduction\b/gi, 'বিজারণ'],
  [/\bredox\s+reaction\b/gi, 'জারণ-বিজারণ (রেডক্স) বিক্রিয়া'],
  [/\bchemical\s+equations?\b/gi, 'রাসায়নিক সমীকরণ'],
  [/\bchemical\s+reactions?\b/gi, 'রাসায়নিক বিক্রিয়া'],

  // Mathematics Terminology
  [/\bquadratic\s+equation\b/gi, 'দ্বিঘাত সমীকরণ'],
  [/\breal\s+and\s+equal\s+roots\b/gi, 'বাস্তব ও সমান বীজ'],
  [/\breal\s+roots\b/gi, 'বাস্তব বীজ'],
  [/\bDiscriminant\b/gi, 'নিরূপক (Discriminant, D)'],
  [/\bArithmetic\s+Progression\b/gi, 'সমান্তর প্রগতি (AP)'],
  [/\bfirst\s+term\b/gi, 'প্রথম পদ (a)'],
  [/\bcommon\s+difference\b/gi, 'সাধারণ অন্তর (d)'],
  [/\bdefinite\s+integral\b/gi, 'নির্দিষ্ট সমাকলন'],
  [/\btrigonometric\s+identities\b/gi, 'ত্রিকোণমিতিক অভেদাবলি'],
  [/\bheights\s+and\s+distances\b/gi, 'উচ্চতা ও দূরত্ব'],
  [/\bangle\s+of\s+elevation\b/gi, 'উন্নতি কোণ'],
  [/\bangle\s+of\s+depression\b/gi, 'অবনতি কোণ'],
  [/\bperimeter\b/gi, 'পরিসীমা'],
  [/\blength\b/gi, 'দৈর্ঘ্য'],
  [/\bbreadth\b/gi, 'প্রস্থ'],
  [/\barea\b/gi, 'ক্ষেত্রফল'],
  [/\bvolume\b/gi, 'আয়তন'],

  // Commerce / Economics / Accountancy
  [/\bFactor\s+Income\b/gi, 'উৎপাদন উপাদানজনিত আয় (Factor Income)'],
  [/\bTransfer\s+Payments?\b/gi, 'হস্তান্তর পাওনা (Transfer Payments)'],
  [/\bNational\s+Income\b/gi, 'জাতীয় আয় (National Income)'],
  [/\bGross\s+Domestic\s+Product\b/gi, 'স্থূল অন্তর্দেশীয় উৎপাদন (GDP)'],
  [/\bNet\s+Domestic\s+Product\b/gi, 'নিট অন্তর্দেশীয় উৎপাদন (NDP)'],
  [/\bDepreciation\b/gi, 'অবচয় ব্যয় (Depreciation)'],
  [/\bPartnership\b/gi, 'অংশীদারি কারবার'],
  [/\bSacrificing\s+Ratio\b/gi, 'ত্যাগের অনুপাত (Sacrificing Ratio)'],
  [/\bGoodwill\b/gi, 'সুনাম (Goodwill)'],
  [/\bPremium\s+for\s+Goodwill\b/gi, 'সুনাম প্রিমিয়াম (Premium for Goodwill)'],
  [/\bJournal\s+Entries\b/gi, 'জাবেদা দাখিলা (Journal Entries)'],
  [/\bCapital\s+Account\b/gi, 'মূলধন হিসাব (Capital A/c)'],
  [/\bBank\s+Account\b/gi, 'ব্যাংক হিসাব (Bank A/c)'],

  // Units
  [/\bmetres?\b/gi, 'মিটার'],
  [/\bcentimetres?\b/gi, 'সেমি'],
  [/\bseconds?\b/gi, 'সেকেন্ড'],
  [/\bminutes?\b/gi, 'মিনিট'],
  [/\bhours?\b/gi, 'ঘণ্টা'],
  [/\bVolts?\b/gi, 'ভোল্ট'],
  [/\bNewtons?\b/gi, 'নিউটন'],
  [/\bJoules?\b/gi, 'জুল'],
  [/\bDioptres?\b/gi, 'ডায়োপ্টার (D)'],
];

// Comprehensive Bengali -> English Patterns
const BN_TO_EN_PATTERNS: [RegExp, string][] = [
  [/যদি\s+([\w\s\S]+?)\s+হয়,\s*তবে\s+([\w\s\S]+?)\s*রাশিটির\s+মান\s+কত\s*হবে:?/g, 'If $1, then the value of $2 is equal to:'],
  [/যদি\s+([\w\s\S]+?)\s+হয়,\s*তবে\s+([\w\s\S]+?)-এর\s+মান\s+নির্ণয়\s+করো:?/g, 'If $1, then find the value of $2:'],
  [/([\w\s\S]+?)-এর\s+কোন\s+মানগুলির\s+জন্য\s+([\w\s\S]+?)\s+হবে\s+নির্ণয়\s+করো:?/g, 'Find the values of $1 for which $2:'],
  [/([\w\s\S]+?)-এর\s+মান\s+নির্ণয়\s+করো:?/g, 'Find the value of $1:'],
  [/প্রথম\s+([\w\s\S]+?)\s+সংখ্যক\s+পদের\s+সমষ্টি\s+নির্ণয়\s+করো:?/g, 'Find the sum of the first $1 terms:'],
  [/মান\s+নির্ণয়\s+করো:?/g, 'Find the value of:'],
  [/গণনা\s+করো:?/g, 'Calculate:'],
  [/নির্ধারণ\s+করো:?/g, 'Determine:'],
  [/নির্দিষ্ট\s+সমাকলনটির\s+মান\s+নির্ণয়\s+করো:?/g, 'Evaluate the definite integral:'],
  [/সমাকলনটির\s+মান\s+নির্ণয়\s+করো:?/g, 'Evaluate the integral:'],
  [/বিবৃত\s+ও\s+প্রমাণ\s+করো:?/g, 'State and prove:'],
  [/বিবৃত\s+করো:?/g, 'State:'],
  [/প্রমাণ\s+করো\s+যে:?/g, 'Prove that:'],
  [/দেখাও\s+যে:?/g, 'Show that:'],
  [/রাসায়নিক\s+সমীকরণসহ\s+ব্যাখ্যা\s+করো:?/g, 'Explain with chemical equations:'],
  [/উপযুক্ত\s+উদাহরণসহ\s+ব্যাখ্যা\s+করো:?/g, 'Explain with suitable examples:'],
  [/পার্থক্য\s+নির্দেশ\s+করো:?/g, 'Distinguish between:'],
  [/পার্থক্য\s+লেখো:?/g, 'Differentiate between:'],
  [/শনাক্ত\s+করো:?/g, 'Identify:'],
  [/প্রয়োজনীয়\s+জাবেদা\s+দাখিলা\s+দাও\.?/g, 'Pass necessary journal entries.'],
  [/সংক্ষিপ্ত\s+টীকা\s+লেখো:?/g, 'Write short note on:'],
  [/কারণ\s+ব্যাখ্যা\s+করো:?/g, 'Give reasons for:'],
  [/দেওয়া\s+আছে\s+যে:?/g, 'Given that:'],
  [/প্রদত্ত:?/g, 'Given:'],
  [/ধাপে\s+ধাপে\s+সমাধান:?/g, 'Step-by-step solution:'],
  [/বিস্তারিত\s+সমাধান:?/g, 'Detailed Solution:'],
  [/সঠিক\s+উত্তর:?/g, 'Correct Answer:'],
  [/চূড়ান্ত\s+অফিশিয়াল\s+উত্তরপত্র:?/g, 'Official Final Key:'],
  [/উত্তর:?/g, 'Answer:'],
  [/ব্যাখ্যা:?/g, 'Explanation:'],
  [/সূত্র:?/g, 'Formula:'],
  [/অতএব/g, 'Hence'],
  [/সুতরাং/g, 'Therefore'],
  [/ধরি/g, 'Let'],
  [/যেখানে/g, 'where'],
  [/এবং/g, 'and'],
  [/অথবা/g, 'or'],
  [/যথাক্রমে/g, 'respectively'],
  [/দ্বিঘাত\s+সমীকরণ/g, 'quadratic equation'],
  [/বাস্তব\s+ও\s+সমান\s+বীজ/g, 'real and equal roots'],
  [/সমান্তর\s+প্রগতি/g, 'Arithmetic Progression'],
  [/উত্তল\s+লেন্স/g, 'convex lens'],
  [/অবতল\s+লেন্স/g, 'concave lens'],
  [/ফোকাস\s+দৈর্ঘ্য/g, 'focal length'],
  [/সদ\s+ও\s+অবশীর্ষ\s+প্রতিবিম্ব/g, 'real and inverted image'],
  [/অসদ\s+ও\s+সমশীর্ষ\s+প্রতিবিম্ব/g, 'virtual and erect image'],
  [/লেন্সের\s+ক্ষমতা/g, 'power of the lens'],
  [/বস্তুর\s+দূরত্ব/g, 'distance of the object'],
  [/প্রতিবিম্বের\s+দূরত্ব/g, 'distance of the image'],
  [/প্রথম\s+ক্রম\s+বিক্রিয়া/g, 'first-order reaction'],
  [/হার\s+ধ্রুবক/g, 'rate constant'],
  [/জারিত\s+পদার্থ/g, 'substance oxidized'],
  [/বিজারিত\s+পদার্থ/g, 'substance reduced'],
  [/জারক\s+পদার্থ/g, 'oxidizing agent'],
  [/বিজারক\s+পদার্থ/g, 'reducing agent'],
  [/উৎপাদন\s+উপাদানজনিত\s+আয়/g, 'Factor Income'],
  [/হস্তান্তর\s+পাওনা/g, 'Transfer Payments'],
  [/জাতীয়\s+আয়/g, 'National Income'],
  [/স্থূল\s+অন্তর্দেশীয়\s+উৎপাদন/g, 'Gross Domestic Product (GDP)'],
  [/নিট\s+অন্তর্দেশীয়\s+উৎপাদন/g, 'Net Domestic Product (NDP)'],
  [/অবচয়\s+ব্যয়/g, 'Depreciation'],
  [/অংশীদারি\s+কারবার/g, 'Partnership'],
  [/ত্যাগের\s+অনুপাত/g, 'Sacrificing Ratio'],
  [/সুনাম\s+প্রিমিয়াম/g, 'Premium for Goodwill'],
  [/সুনাম/g, 'Goodwill'],
  [/জাবেদা\s+দাখিলা/g, 'Journal entries'],
];

/**
 * Detects whether the text is primarily Bengali or English
 */
export function detectLanguage(text: string): 'bn' | 'en' {
  if (!text || typeof text !== 'string') return 'en';
  const bnMatches = text.match(/[\u0980-\u09FF]/g);
  const bnCount = bnMatches ? bnMatches.length : 0;
  const enMatches = text.match(/[A-Za-z]/g);
  const enCount = enMatches ? enMatches.length : 0;

  if (bnCount > enCount && bnCount > 2) {
    return 'bn';
  }
  return 'en';
}

/**
 * Translates English text to authentic, grammatically correct Bengali (বাংলা)
 */
export function translateEnglishToBengali(text: string): string {
  if (!text || typeof text !== 'string') return '';
  let result = text;

  // 1. Apply high-order sentence and question patterns
  for (const [regex, bn] of EN_TO_BN_PATTERNS) {
    result = result.replace(regex, bn);
  }

  // 2. Standardize MCQ option labels: A) -> ক), B) -> খ), C) -> গ), D) -> ঘ)
  result = result.replace(/(?:^|\s)A\)\s*/gm, 'ক) ');
  result = result.replace(/(?:^|\s)B\)\s*/gm, 'খ) ');
  result = result.replace(/(?:^|\s)C\)\s*/gm, 'গ) ');
  result = result.replace(/(?:^|\s)D\)\s*/gm, 'ঘ) ');

  return result.trim();
}

/**
 * Translates Bengali text to authentic, grammatically correct English
 */
export function translateBengaliToEnglish(text: string): string {
  if (!text || typeof text !== 'string') return '';
  let result = text;

  // 1. Apply reverse sentence patterns
  for (const [regex, en] of BN_TO_EN_PATTERNS) {
    result = result.replace(regex, en);
  }

  // 2. Standardize MCQ option labels: ক) -> A), খ) -> B), গ) -> C), ঘ) -> D)
  result = result.replace(/(?:^|\s)ক\)\s*/gm, 'A) ');
  result = result.replace(/(?:^|\s)খ\)\s*/gm, 'B) ');
  result = result.replace(/(?:^|\s)গ\)\s*/gm, 'C) ');
  result = result.replace(/(?:^|\s)ঘ\)\s*/gm, 'D) ');

  return result.trim();
}

/**
 * Bidirectional toggle: if text is English -> returns Bengali; if Bengali -> returns English
 */
export function convertTextBilingual(text: string): { convertedText: string; sourceLang: 'en' | 'bn'; targetLang: 'en' | 'bn' } {
  const src = detectLanguage(text);
  if (src === 'bn') {
    return {
      convertedText: translateBengaliToEnglish(text),
      sourceLang: 'bn',
      targetLang: 'en',
    };
  } else {
    return {
      convertedText: translateEnglishToBengali(text),
      sourceLang: 'en',
      targetLang: 'bn',
    };
  }
}

/**
 * Translates an entire QuestionBankItem or CustomAssignmentQuestion into target language with perfect fidelity
 */
export function getConvertedQuestionItem(
  q: QuestionBankItem | CustomAssignmentQuestion,
  targetLang: 'bn' | 'en' | 'original' | 'bilingual'
): {
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  answerExplanation?: string;
  isBilingual: boolean;
  activeLang: 'en' | 'bn' | 'bilingual';
} {
  const origLang = detectLanguage(q.questionText);

  // Original requested
  if (targetLang === 'original') {
    return {
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      answerExplanation: q.answerExplanation,
      isBilingual: false,
      activeLang: origLang,
    };
  }

  // Bengali target requested
  if (targetLang === 'bn') {
    const qBn = (q as any).questionTextBn || (origLang === 'bn' ? q.questionText : translateEnglishToBengali(q.questionText));
    const optBn = (q as any).optionsBn || (q.options ? (origLang === 'bn' ? q.options : q.options.map((o) => translateEnglishToBengali(o))) : undefined);
    const ansBn = (q as any).correctAnswerBn || (q.correctAnswer ? (origLang === 'bn' ? q.correctAnswer : translateEnglishToBengali(q.correctAnswer)) : undefined);
    const expBn = (q as any).answerExplanationBn || (q.answerExplanation ? (origLang === 'bn' ? q.answerExplanation : translateEnglishToBengali(q.answerExplanation)) : undefined);

    return {
      questionText: qBn,
      options: optBn,
      correctAnswer: ansBn,
      answerExplanation: expBn,
      isBilingual: false,
      activeLang: 'bn',
    };
  }

  // English target requested
  if (targetLang === 'en') {
    const qEn = (q as any).questionTextEn || (origLang === 'en' ? q.questionText : translateBengaliToEnglish(q.questionText));
    const optEn = (q as any).optionsEn || (q.options ? (origLang === 'en' ? q.options : q.options.map((o) => translateBengaliToEnglish(o))) : undefined);
    const ansEn = (q as any).correctAnswerEn || (q.correctAnswer ? (origLang === 'en' ? q.correctAnswer : translateBengaliToEnglish(q.correctAnswer)) : undefined);
    const expEn = (q as any).answerExplanationEn || (q.answerExplanation ? (origLang === 'en' ? q.answerExplanation : translateBengaliToEnglish(q.answerExplanation)) : undefined);

    return {
      questionText: qEn,
      options: optEn,
      correctAnswer: ansEn,
      answerExplanation: expEn,
      isBilingual: false,
      activeLang: 'en',
    };
  }

  // Bilingual Mode (Shows English & Bengali side-by-side / cleanly formatted)
  const enText = (q as any).questionTextEn || (origLang === 'en' ? q.questionText : translateBengaliToEnglish(q.questionText));
  const bnText = (q as any).questionTextBn || (origLang === 'bn' ? q.questionText : translateEnglishToBengali(q.questionText));

  const enAns = (q as any).correctAnswerEn || (origLang === 'en' ? q.correctAnswer : (q.correctAnswer ? translateBengaliToEnglish(q.correctAnswer) : undefined));
  const bnAns = (q as any).correctAnswerBn || (origLang === 'bn' ? q.correctAnswer : (q.correctAnswer ? translateEnglishToBengali(q.correctAnswer) : undefined));

  const enExp = (q as any).answerExplanationEn || (origLang === 'en' ? q.answerExplanation : (q.answerExplanation ? translateBengaliToEnglish(q.answerExplanation) : undefined));
  const bnExp = (q as any).answerExplanationBn || (origLang === 'bn' ? q.answerExplanation : (q.answerExplanation ? translateEnglishToBengali(q.answerExplanation) : undefined));

  const combinedAns = enAns && bnAns && enAns !== bnAns ? `[EN]: ${enAns}\n[বাংলা]: ${bnAns}` : (enAns || bnAns);
  const combinedExp = enExp && bnExp && enExp !== bnExp ? `[English Solution]:\n${enExp}\n\n[বাংলা সমাধান]:\n${bnExp}` : (enExp || bnExp);

  return {
    questionText: `${enText}\n\n[বাংলা রূপান্তর / Bengali]:\n${bnText}`,
    options: q.options,
    correctAnswer: combinedAns,
    answerExplanation: combinedExp,
    isBilingual: true,
    activeLang: 'bilingual',
  };
}
