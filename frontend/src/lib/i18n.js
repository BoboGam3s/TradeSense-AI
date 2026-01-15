/**
 * TradeSense AI - Internationalization
 * Simple i18n implementation for FR, EN, AR
 */

export const translations = {
  fr: {
    // Navigation
    home: 'Accueil',
    dashboard: 'Tableau de Bord',
    leaderboard: 'Classement',
    pricing: 'Tarifs',
    login: 'Connexion',
    register: 'Inscription',
    logout: 'Déconnexion',
    
    // Hero section
    hero_title: 'TradeSense AI : La Première Prop Firm Assistée par IA pour l\'Afrique',
    hero_subtitle: 'Obtenez un financement jusqu\'à 100 000$ et tradez avec l\'assistance de l\'intelligence artificielle',
    hero_cta: 'Commencer Maintenant',
    
    // Plans
    starter: 'Starter',
    pro: 'Pro',
    elite: 'Elite',
    choose_plan: 'Choisir ce Plan',
    
    // Trading
    buy: 'Acheter',
    sell: 'Vendre',
    symbol: 'Symbole',
    price: 'Prix',
    quantity: 'Quantité',
    profit: 'Profit',
    loss: 'Perte',
    equity: 'Équité',
    balance: 'Solde',
    
    // Challenge
    challenge_status: 'Statut du Challenge',
    active: 'Actif',
    passed: 'Réussi',
    failed: 'Échoué',
    profit_target: 'Objectif de Profit',
    max_loss: 'Perte Maximale',
    
    // Common
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    cancel: 'Annuler',
    submit: 'Soumettre',
  },
  
  en: {
    // Navigation
    home: 'Home',
    dashboard: 'Dashboard',
    leaderboard: 'Leaderboard',
    pricing: 'Pricing',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    
    // Hero section
    hero_title: 'TradeSense AI: Africa\'s First AI-Powered Prop Firm',
    hero_subtitle: 'Get funded up to $100,000 and trade with AI assistance',
    hero_cta: 'Get Started Now',
    
    // Plans
    starter: 'Starter',
    pro: 'Pro',
    elite: 'Elite',
    choose_plan: 'Choose This Plan',
    
    // Trading
    buy: 'Buy',
    sell: 'Sell',
    symbol: 'Symbol',
    price: 'Price',
    quantity: 'Quantity',
    profit: 'Profit',
    loss: 'Loss',
    equity: 'Equity',
    balance: 'Balance',
    
    // Challenge
    challenge_status: 'Challenge Status',
    active: 'Active',
    passed: 'Passed',
    failed: 'Failed',
    profit_target: 'Profit Target',
    max_loss: 'Max Loss',
    
    // Common
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    cancel: 'Cancel',
    submit: 'Submit',
  },
  
  ar: {
    // Navigation  
    home: 'الرئيسية',
    dashboard: 'لوحة التحكم',
    leaderboard: 'المتصدرين',
    pricing: 'الأسعار',
    login: 'تسجيل الدخول',
    register: 'التسجيل',
    logout: 'تسجيل الخروج',
    
    // Hero section
    hero_title: 'TradeSense AI: أول شركة تداول بمساعدة الذكاء الاصطناعي في أفريقيا',
    hero_subtitle: 'احصل على تمويل يصل إلى 100000 دولار وتداول بمساعدة الذكاء الاصطناعي',
    hero_cta: 'ابدأ الآن',
    
    // Plans
    starter: 'المبتدئ',
    pro: 'المحترف',
    elite: 'النخبة',
    choose_plan: 'اختر هذه الخطة',
    
    // Trading
    buy: 'شراء',
    sell: 'بيع',
    symbol: 'الرمز',
    price: 'السعر',
    quantity: 'الكمية',
    profit: 'ربح',
    loss: 'خسارة',
    equity: 'الأسهم',
    balance: 'الرصيد',
    
    // Challenge
    challenge_status: 'حالة التحدي',
    active: 'نشط',
    passed: 'نجح',
    failed: 'فشل',
    profit_target: 'هدف الربح',
    max_loss: 'الحد الأقصى للخسارة',
    
    // Common
    loading: 'جاري التحميل...',
    error: 'خطأ',
    success: 'نجاح',
    cancel: 'إلغاء',
    submit: 'إرسال',
  },
};

export function useTranslation(locale = 'fr') {
  const t = (key) => {
    return translations[locale]?.[key] || key;
  };
  
  return { t, locale };
}

export function getDirection(locale) {
  return locale === 'ar' ? 'rtl' : 'ltr';
}
