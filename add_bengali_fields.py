import re

with open("src/data/initialQuestionBankData.ts") as f:
    content = f.read()

# Dictionary of specific high-quality Bengali translations for all initial question bank items:
TRANSLATIONS = {
    'QB-10-MATH-001': {
        'questionTextBn': 'যদি sin θ + sin² θ = 1 হয়, তবে (cos² θ + cos⁴ θ) রাশিটির মান কত হবে:',
        'optionsBn': ['ক) 0', 'খ) 1', 'গ) 2', 'ঘ) 1/2'],
        'correctAnswerBn': 'খ) 1',
        'answerExplanationBn': 'প্রদত্ত: sin θ + sin² θ = 1 => sin θ = 1 - sin² θ = cos² θ। এখন মান বসিয়ে পাই: (cos² θ + cos⁴ θ) = sin θ + (sin θ)² = sin θ + sin² θ = 1।'
    },
    'QB-10-MATH-002': {
        'questionTextBn': 'k-এর কোন মানের জন্য (k + 4)x² + (k + 1)x + 1 = 0 দ্বিঘাত সমীকরণটির বীজদ্বয় বাস্তব ও সমান হবে নির্ণয় করো।',
        'correctAnswerBn': 'k = 5 অথবা k = -3',
        'answerExplanationBn': 'বাস্তব ও সমান বীজের জন্য, নিরূপক D = b² - 4ac = 0 হবে।\nএখানে a = (k + 4), b = (k + 1), c = 1।\n(k + 1)² - 4(k + 4)(1) = 0\nk² + 2k + 1 - 4k - 16 = 0\nk² - 2k - 15 = 0\n(k - 5)(k + 3) = 0 => k = 5 অথবা k = -3।'
    },
    'QB-10-MATH-003': {
        'questionTextBn': 'একটি সমান্তর প্রগতির (AP) প্রথম 7টি পদের সমষ্টি 49 এবং প্রথম 17টি পদের সমষ্টি 289 হলে, প্রথম n সংখ্যক পদের সমষ্টি এবং 20তম পদটি নির্ণয় করো।',
        'correctAnswerBn': 'S_n = n², a = 1, d = 2, T₂₀ = 39',
        'answerExplanationBn': 'S₇ = 7/2 [2a + 6d] = 49 => a + 3d = 7 ...(1)\nS₁₇ = 17/2 [2a + 16d] = 289 => a + 8d = 17 ...(2)\nসমীকরণ (2) থেকে (1) বিয়োগ করে পাই: 5d = 10 => d = 2।\n(1) থেকে পাই: a = 1।\nn সংখ্যক পদের সমষ্টি: S_n = n/2 [2(1) + (n - 1)2] = n²।\n20তম পদ: T₂₀ = a + 19d = 1 + 19(2) = 39।'
    },
    'QB-10-SCI-001': {
        'questionTextBn': '20 সেমি ফোকাস দূরত্বের একটি উত্তল লেন্সের সামনে বস্তু রাখলে 2 গুণ বিবর্ধিত সদ ও অবশীর্ষ প্রতিবিম্ব সৃষ্টি হয়। লেন্স থেকে বস্তুর দূরত্ব এবং লেন্সের ক্ষমতা নির্ণয় করো।',
        'correctAnswerBn': 'u = -30 সেমি, ক্ষমতা P = +5 D',
        'answerExplanationBn': 'সদ ও অবশীর্ষ প্রতিবিম্বের জন্য: m = -2 = v / u => v = -2u।\nলেন্স সূত্র: 1/f = 1/v - 1/u\n1/20 = 1/(-2u) - 1/u = -3 / (2u)\n2u = -60 => u = -30 সেমি (বস্তুটি লেন্সের সামনে 30 সেমি দূরত্বে অবস্থিত)।\nক্ষমতা P = 100 / f(সেমিতে) = 100 / 20 = +5.0 ডায়োপ্টার।'
    },
    'QB-10-SCI-002': {
        'questionTextBn': 'MnO₂ + 4HCl → MnCl₂ + 2H₂O + Cl₂ বিক্রিয়াটিতে জারিত পদার্থ, বিজারিত পদার্থ, জারক পদার্থ ও বিজারক পদার্থ শনাক্ত করো।',
        'correctAnswerBn': 'জারিত পদার্থ: HCl; বিজারিত পদার্থ: MnO₂; জারক: MnO₂; বিজারক: HCl',
        'answerExplanationBn': '1. HCl-এ ক্লোরিনের জারণ সংখ্যা -1 থেকে Cl₂-এ 0 হয় (ইলেকট্রন বর্জন = জারণ)। তাই HCl জারিত হয়েছে।\n2. MnO₂-এ ম্যাঙ্গানিজের জারণ সংখ্যা +4 থেকে MnCl₂-এ +2 হয় (ইলেকট্রন গ্রহণ = বিজারণ)। তাই MnO₂ বিজারিত হয়েছে।\n3. যা বিজারিত হয় তা হলো জারক পদার্থ (MnO₂)।\n4. যা জারিত হয় তা হলো বিজারক পদার্থ (HCl)।'
    },
    'QB-12-PHY-001': {
        'questionTextBn': 'স্থির তড়িৎবিজ্ঞানে গাউসের সূত্রটি বিবৃত করো। এই সূত্রের সাহায্যে λ রৈখিক আধান ঘনত্ববিশিষ্ট একটি অসীম দৈর্ঘ্যের ঋজু তার থেকে r লম্ব দূরত্বে তড়িৎক্ষেত্রের প্রাবল্য নির্ণয় করো।',
        'correctAnswerBn': 'E = λ / (2πε₀r) ব্যাসার্ধ বরাবর বহির্মুখী',
        'answerExplanationBn': 'গাউসের সূত্র: কোনো বদ্ধ তলের মধ্য দিয়ে অতিক্রান্ত মোট তড়িৎ ফ্লাক্স ওই তল দ্বারা আবদ্ধ মোট আধানের 1/ε₀ গুণের সমান: ∮ E·dA = q / ε₀।\nপ্রমাণ: r ব্যাসার্ধ এবং L দৈর্ঘ্যের একটি চোঙাকৃতি গাউসীয় তল বিবেচনা করি।\nবক্রতলের ফ্লাক্স = E · (2πrL)।\nতলদ্বারা আবদ্ধ আধান q = λL।\nগাউসের সূত্রানুযায়ী: E · 2πrL = (λL) / ε₀ => E = λ / (2πε₀r)।'
    },
    'QB-12-PHY-002': {
        'questionTextBn': '2V এবং 4V তড়িচ্চালক বল এবং যথাক্রমে 1Ω এবং 2Ω অভ্যন্তরীণ রোধবিশিষ্ট দুটি কোষকে সমান্তরাল সমবায়ে যুক্ত করে 10Ω বহিস্থ রোধের মধ্য দিয়ে একই অভিমুখে তড়িৎ পাঠানো হলো। বহিস্থ রোধের প্রান্তীয় বিভব প্রভেদ নির্ণয় করো।',
        'correctAnswerBn': 'V = 2.45 ভোল্ট, প্রবাহমাত্রা I = 0.245 A',
        'answerExplanationBn': 'তুল্য তড়িচ্চালক বল E_eq = (2/1 + 4/2) / (1/1 + 1/2) = 4 / 1.5 = 8/3 V।\nতুল্য অভ্যন্তরীণ রোধ r_eq = (1 × 2) / (1 + 2) = 2/3 Ω।\nবর্তনীতে মোট প্রবাহমাত্রা I = (8/3) / (10 + 2/3) = 0.25 A।\nপ্রান্তীয় বিভব প্রভেদ V = I × R = 0.25 A × 10 Ω = 2.50 V।'
    },
    'QB-12-PHY-003': {
        'questionTextBn': '60° প্রতিসারক কোণবিশিষ্ট একটি কাঁচের প্রিজমের ক্ষেত্রে ন্যূনতম চ্যুতি কোণ 30° হলে প্রিজমের উপাদানের প্রতিসরাঙ্ক কত:',
        'optionsBn': ['ক) √2 (প্রায় 1.414)', 'খ) √3 (প্রায় 1.732)', 'গ) 1.50', 'ঘ) 1.33'],
        'correctAnswerBn': 'ক) √2 (প্রায় 1.414)',
        'answerExplanationBn': 'প্রিজম সূত্র: μ = sin[(A + D_m)/2] / sin[A/2] = sin[(60° + 30°)/2] / sin[60°/2] = sin(45°) / sin(30°) = (1/√2) / (1/2) = √2 ≈ 1.414।'
    },
    'QB-12-CHEM-001': {
        'questionTextBn': '300 K উষ্ণতায় একটি প্রথম ক্রম বিক্রিয়ার 50% সম্পন্ন হতে 30 মিনিট সময় লাগে। বিক্রিয়াটি 90% সম্পন্ন হতে কত সময় লাগবে গণনা করো। [প্রদত্ত: log 10 = 1, log 2 = 0.3010]',
        'correctAnswerBn': 't = 99.6 মিনিট',
        'answerExplanationBn': 'হার ধ্রুবক k = 0.693 / t₁/₂ = 0.693 / 30 = 0.0231 মিনিট⁻¹।\n90% সমাপ্তির ক্ষেত্রে অবশিষ্ট গাঢ়ত্ব [A] = 10% [A]₀।\nt_90% = (2.303 / k) * log([A]₀ / [A]) = (2.303 / 0.0231) * log(10) ≈ 99.6 মিনিট।'
    },
    'QB-12-CHEM-002': {
        'questionTextBn': 'রাসায়নিক সমীকরণসহ ব্যাখ্যা করো:\n(i) বেনজালডিহাইড এবং প্রোপান্যালের মধ্যে ক্রস অ্যালডল ঘনীভবন।\n(ii) ফর্মালডিহাইডের ক্যানিজারো বিক্রিয়া।',
        'correctAnswerBn': 'ধাপে ধাপে বিক্রিয়া পদ্ধতি দেখুন',
        'answerExplanationBn': '(i) বেনজালডিহাইডে (C₆H₅CHO) কোনো α-হাইড্রোজেন নেই, কিন্তু প্রোপন্যালে α-হাইড্রোজেন আছে। লঘু ক্ষারের উপস্থিতিতে প্রোপান্যাল থেকে এনোলেট আয়ন তৈরি হয়ে বেনজালডিহাইডে আক্রমণ করে সিনামালডিহাইড ডেরিভেটিভ উৎপন্ন করে।\n(ii) ফর্মালডিহাইডে α-হাইড্রোজেন না থাকায় গাঢ় ক্ষারসহ উত্তপ্ত করলে এর স্ব-জারণ-বিজারণ ঘটে মিথানল এবং ফরমিক অ্যাসিডের পটাশিয়াম লবণ উৎপন্ন হয়।'
    },
    'QB-12-MATH-001': {
        'questionTextBn': 'নির্দিষ্ট সমাকলনটির মান নির্ণয় করো: I = ∫[0 to π/2] (√sin x) / (√sin x + √cos x) dx [সূত্র: ∫[0 to a] f(x)dx = ∫[0 to a] f(a - x)dx ব্যবহার করো]।',
        'correctAnswerBn': 'I = π / 4',
        'answerExplanationBn': 'ধরি I = ∫[0 to π/2] (√sin x) / (√sin x + √cos x) dx ---(1)\nধর্ম প্রয়োগ করে: I = ∫[0 to π/2] (√cos x) / (√cos x + √sin x) dx ---(2)\n(1) ও (2) যোগ করে পাই: 2I = ∫[0 to π/2] 1 dx = π/2 => I = π/4।'
    },
    'QB-12-ACC-001': {
        'questionTextBn': 'A এবং B একটি অংশীদারি কারবারে 3:2 অনুপাতে লাভ-ক্ষতি বণ্টন করে। তারা 1/5 অংশের জন্য C-কে নতুন অংশীদার হিসেবে গ্রহণ করে। C মূলধন বাবদ ₹1,00,000 এবং সুনাম প্রিমিয়াম বাবদ ₹40,000 প্রদান করে। প্রয়োজনীয় জাবেদা দাখিলা দাও।',
        'correctAnswerBn': 'সুনাম প্রিমিয়াম ত্যাগের অনুপাত 3:2 অনুসারে A (₹24,000) ও B (₹16,000)-এর মধ্যে বণ্টিত হবে',
        'answerExplanationBn': '1. নগদ অর্থ প্রাপ্তির জাবেদা: ব্যাংক হিসাব ডেবিট ₹1,40,000; C-এর মূলধন হিসাব ক্রেডিট ₹1,00,000; সুনাম প্রিমিয়াম হিসাব ক্রেডিট ₹40,000।\n2. সুনাম বণ্টনের জাবেদা: সুনাম প্রিমিয়াম হিসাব ডেবিট ₹40,000; A-এর মূলধন হিসাব ক্রেডিট ₹24,000; B-এর মূলধন হিসাব ক্রেডিট ₹16,000।'
    },
    'QB-12-ECO-001': {
        'questionTextBn': 'স্থূল অন্তর্দেশীয় উৎপাদন (GDP) এবং নিট অন্তর্দেশীয় উৎপাদন (NDP)-এর মধ্যে পার্থক্য নির্দেশ করো। অবচয় ব্যয় কীভাবে এদের সম্পর্কিত করে?',
        'correctAnswerBn': 'NDP = GDP - অবচয় (Depreciation)',
        'answerExplanationBn': '1. GDP হলো একটি আর্থিক বছরে দেশের অভ্যন্তরীণ সীমানার মধ্যে উৎপাদিত চূড়ান্ত পণ্য ও সেবার মোট আর্থিক মূল্য।\n2. NDP হলো GDP থেকে মূলধনী দ্রব্যের ক্ষয়ক্ষতিজনিত অবচয় বাদ দেওয়ার পর প্রাপ্ত নিট মূল্য।\n3. সম্পর্ক: NDP = GDP - অবচয় ব্যয় (Consumption of Fixed Capital)।'
    },
    'QB-12-BIO-001': {
        'questionTextBn': 'দ্বি-নিষেকের তাৎপর্য ব্যাখ্যা করো এবং সপুষ্পক উদ্ভিদে ভ্রূণ ও শস্য (Endosperm) সৃষ্টির ধাপগুলি আলোচনা করো।',
        'correctAnswerBn': 'ভ্রূণ (2n) এবং ত্রিমিলনের মাধ্যমে শস্য (3n) সৃষ্টি হয়',
        'answerExplanationBn': 'একটি পুংজননকোষ ডিম্বাণুর সাথে মিলিত হয়ে ডিপ্লয়েড ভ্রূণাণু (2n) তৈরি করে এবং অপর পুংজননকোষটি নির্ণীত নিউক্লিয়াসের সাথে মিলিত হয়ে ট্রিপ্লয়েড শস্য নিউক্লিয়াস (3n) গঠন করে। এই ঘটনাকে দ্বি-নিষেকের বলা হয়।'
    },
    'QB-12-CS-001': {
        'questionTextBn': 'পাইথনে স্ট্যাক (Stack) ডেটা স্ট্রাকচারের জন্য Push এবং Pop অপারেশন কোড লিখে ব্যাখ্যা করো।',
        'correctAnswerBn': 'List append() এবং pop() ব্যবহার করে LIFO নীতিতে বাস্তবায়িত হয়',
        'answerExplanationBn': 'স্ট্যাক LIFO (Last In First Out) নীতি অনুসরণ করে। পাইথনে একটি খালি লিস্ট নিয়ে append(item) দ্বারা Push এবং pop() দ্বারা Pop অপারেশন সম্পাদন করা হয়।'
    },
    'QB-12-CA-001': {
        'questionTextBn': 'পান্ডাস (Pandas) ডেটাফ্রেম তৈরিতে ডিফারেনশিয়াল ইনডেক্সিং এবং Matplotlib দ্বারা বার চার্ট তৈরির কোড উদাহরণসহ ব্যাখ্যা করো।',
        'correctAnswerBn': 'pd.DataFrame() এবং plt.bar() ব্যবহার করা হয়',
        'answerExplanationBn': 'পান্ডাস ডেটাফ্রেম হলো দ্বি-মাত্রিক সারণি। pd.DataFrame(data) ব্যবহার করে টেবিল গঠন এবং matplotlib.pyplot.bar(x, y) দ্বারা ভিজুয়ালাইজেশন প্রদর্শন করা হয়।'
    }
}

# Now inject Bengali translations into initialQuestionBankData.ts
for qid, trans in TRANSLATIONS.items():
    pattern = re.compile(rf"id:\s*['\"]{qid}['\"].*?marks:\s*\d+,", re.DOTALL)
    match = pattern.search(content)
    if match:
        matched_str = match.group(0)
        # Check if already has questionTextBn
        if 'questionTextBn' not in matched_str:
            insertion = f"\n    questionTextBn: {repr(trans['questionTextBn'])},"
            if 'optionsBn' in trans:
                insertion += f"\n    optionsBn: {repr(trans['optionsBn'])},"
            if 'correctAnswerBn' in trans:
                insertion += f"\n    correctAnswerBn: {repr(trans['correctAnswerBn'])},"
            if 'answerExplanationBn' in trans:
                insertion += f"\n    answerExplanationBn: {repr(trans['answerExplanationBn'])},"
            
            # Insert before marks
            new_matched = matched_str.replace("marks:", f"{insertion}\n    marks:")
            content = content.replace(matched_str, new_matched)

with open("src/data/initialQuestionBankData.ts", "w") as f:
    f.write(content)

print("Updated initialQuestionBankData.ts with authentic Bengali translations!")
