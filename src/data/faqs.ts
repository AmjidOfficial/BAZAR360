export interface FAQItem {
  id: string;
  questionEn: string;
  questionUr: string;
  answerEn: string;
  answerUr: string;
  category: 'general' | 'buying' | 'selling' | 'peshawar_kpk' | 'verification' | 'dealers';
}

export const CENTRAL_FAQS: FAQItem[] = [
  {
    id: 'faq-what-is-bazar360',
    category: 'general',
    questionEn: 'What is Bazar360.online?',
    questionUr: 'بازار 360 کیا ہے؟',
    answerEn: 'Bazar360 is Pakistan\'s modern digital automotive marketplace and showroom network, specially optimized for Peshawar, KPK, and nationwide automotive commerce. It connects verified car dealerships, individual buyers, and private sellers with zero commission on direct inquiries.',
    answerUr: 'بازار 360 پاکستان کا جدید ڈیجیٹل آٹوموٹیو مارکیٹ پلیس اور شو روم نیٹ ورک ہے، جو خاص طور پر پشاور، خیبر پختونخوا اور ملک بھر کے لیے ڈیزائن کیا گیا ہے۔ یہ تصدیق شدہ شو رومز اور خریداروں کو براہ راست جوڑتا ہے۔'
  },
  {
    id: 'faq-how-to-buy-peshawar',
    category: 'peshawar_kpk',
    questionEn: 'How can I buy a used or imported car in Peshawar through Bazar360?',
    questionUr: 'پشاور میں بازار 360 کے ذریعے گاڑی کیسے خریدی جائے؟',
    answerEn: 'Browse live inventory from verified Peshawar showrooms (such as Auto Choice Peshawar on Ring Road / University Road) and private sellers. You can filter by make, model, year, transmission, and budget, inspect detailed HD photos, and click the direct WhatsApp or Call button to negotiate directly with the seller.',
    answerUr: 'پشاور کے تصدیق شدہ شو رومز اور پرائیویٹ سیلرز کی لائیو گاڑیاں دیکھیں۔ اپنی پسند کی گاڑی منتخب کریں اور براہ راست واٹس ایپ یا کال کے ذریعے رابطہ کریں۔'
  },
  {
    id: 'faq-post-vehicle-ad',
    category: 'selling',
    questionEn: 'How can I post an ad to sell my car on Bazar360?',
    questionUr: 'بازار 360 پر اپنی گاڑی کا اشتہار کیسے لگائیں؟',
    answerEn: 'Click the "Post Free Ad" button, enter your vehicle details (Make, Model, Year, Mileage, Registration City, Price, and Condition), upload clear vehicle photos, and submit. Once verified, your ad will go live instantly on the Bazar360 marketplace.',
    answerUr: 'مفت اشتہار لگائیں پر کلک کریں، گاڑی کی تفصیلات، قیمت اور تصاویر درج کریں اور جمع کرائیں۔ تصدیق کے بعد اشتہار لائیو ہو جائے گا۔'
  },
  {
    id: 'faq-showroom-verification',
    category: 'verification',
    questionEn: 'How are showrooms and car listings verified on Bazar360?',
    questionUr: 'شو رومز اور گاڑیوں کی تصدیق کیسے کی جاتی ہے؟',
    answerEn: 'Verified Showrooms are vetted through physical address checks, dealer registration documents, and verified contact numbers. Certified vehicle listings undergo rigorous document validation (Excise registration, Token Tax status, and physical condition checks) to protect buyers from fraud.',
    answerUr: 'تصدیق شدہ شو رومز کی فزیکل لوکیشن، ایکسائز کاغذات اور رابطہ نمبرز کی جانچ پڑتال کے بعد تصدیقی بیج دیا جاتا ہے۔'
  },
  {
    id: 'faq-charges-fees',
    category: 'general',
    questionEn: 'Does Bazar360 charge any commission on car sales?',
    questionUr: 'کیا بازار 360 گاڑی کی فروخت پر کمیشن لیتا ہے؟',
    answerEn: 'No. Bazar360 operates on a direct buyer-seller marketplace model. Browsing cars, contacting showrooms, chatting on WhatsApp, and standard ad postings are 100% free with 0% commission fees.',
    answerUr: 'نہیں! بازار 360 خریداروں اور شو رومز کے درمیان براہ راست رابطے کی سہولت دیتا ہے اور اس پر کوئی پوشیدہ فیس یا کمیشن نہیں ہے۔'
  },
  {
    id: 'faq-inspection-services',
    category: 'buying',
    questionEn: 'Can I book a pre-purchase vehicle inspection in Peshawar / KPK?',
    questionUr: 'کیا میں گاڑی خریدنے سے قبل معائنہ (انسپکشن) بک کروا سکتا ہوں؟',
    answerEn: 'Yes. You can request our comprehensive 200+ point inspection service covering engine compression, suspension, transmission diagnostics, body paint thickness, and chassis integrity with an official digital inspection report.',
    answerUr: 'جی ہاں! آپ 200+ پوائنٹس پر مشتمل مکمل ڈیجیٹل انسپکشن سروس بک کر سکتے ہیں جس میں انجن، پینٹ اور باڈی چیک شامل ہے۔'
  },
  {
    id: 'faq-token-tax-documents',
    category: 'buying',
    questionEn: 'How do I check Token Tax and Registration status for vehicles listed in KPK?',
    questionUr: 'خیبر پختونخوا میں گاڑی کے ٹوکن ٹیکس اور رجسٹریشن کی معلومات کیسے دیکھیں؟',
    answerEn: 'Every verified listing on Bazar360 displays clear document badges including Token Tax status (Up-to-date / Lifetime paid), Registration province (KPK / Islamabad / Punjab / Sindh), and original Smart Card / Return File availability.',
    answerUr: 'ہر تصدیق شدہ گاڑی کی تفصیلات میں ٹوکن ٹیکس کی صورتحال، رجسٹریشن کا صوبہ اور اوریجنل فائل کی معلومات درج ہوتی ہیں۔'
  },
  {
    id: 'faq-dealership-digital-portal',
    category: 'dealers',
    questionEn: 'How can Peshawar car dealers create a digital showroom storefront on Bazar360?',
    questionUr: 'کار ڈیلرز اپنا ڈیجیٹل شو روم پورٹل کیسے حاصل کر سکتے ہیں؟',
    answerEn: 'Automotive dealers can register via the Showroom Portal to get a dedicated branded microsite with custom URL, inventory management, digital business card, QR code share, WhatsApp lead routing, and customer CRM tools.',
    answerUr: 'ڈیلرز شو روم پورٹل کے ذریعے رجسٹر ہو کر اپنا برانڈڈ مائیکرو پیج، ڈیجیٹل بزنس کارڈ، اور انوینٹری مینجمنٹ سسٹم حاصل کر سکتے ہیں۔'
  }
];
