import type { CaseStudy } from '@/lib/types/case-study';

export const caseStudies: CaseStudy[] = [
  {
    id: '1',
    project_name_en: 'The Meridian Residences',
    project_name_ar: 'سكنيات ميريديان',
    before_en: [
      'Zero market awareness — new developer with no brand recognition',
      'No structured sales pipeline or lead management system',
      'Generic branding that blended with 50+ competing projects in the area',
      'Sales team operating without scripts, KPIs, or closing frameworks',
    ],
    before_ar: [
      'صفر وعي سوقي — مطور جديد بدون أي تعرف على العلامة',
      'لا يوجد نظام مبيعات منظم أو إدارة عملاء محتملين',
      'علامة تجارية عامة تمتزج مع أكثر من 50 مشروعاً منافساً في المنطقة',
      'فريق مبيعات يعمل بدون سيناريوهات أو مؤشرات أداء أو أُطر إغلاق',
    ],
    after_metrics: [
      { label_en: 'Units Sold', label_ar: 'وحدة مباعة', value: 204, suffix_en: '', suffix_ar: '' },
      { label_en: 'Conversion Rate', label_ar: 'معدل التحويل', value: 34, suffix_en: '%', suffix_ar: '%' },
      { label_en: 'Sales Velocity', label_ar: 'سرعة المبيعات', value: 28, suffix_en: ' units/mo', suffix_ar: ' وحدة/شهرياً' },
      { label_en: 'ROI on Marketing', label_ar: 'العائد على التسويق', value: 12, suffix_en: 'x', suffix_ar: 'x' },
    ],
    timeline_en: '9 months from launch to 85% sold',
    timeline_ar: '9 أشهر من الإطلاق حتى بيع 85%',
    slug: 'meridian-case-study',
  },
  {
    id: '2',
    project_name_en: 'Green Terraces',
    project_name_ar: 'التراسات الخضراء',
    before_en: [
      'Project stalled at 15% sales after 6 months with previous agency',
      'Lead quality was poor — 80% of inquiries were unqualified',
      'No clear value proposition differentiating from nearby competitors',
      'Disjointed digital presence with no performance tracking',
    ],
    before_ar: [
      'المشروع متوقف عند 15% مبيعات بعد 6 أشهر مع الوكالة السابقة',
      'جودة العملاء ضعيفة — 80% من الاستفسارات غير مؤهلة',
      'لا يوجد عرض قيمة واضح يميز عن المنافسين القريبين',
      'حضور رقمي مفكك بدون تتبع أداء',
    ],
    after_metrics: [
      { label_en: 'Total Sell-Out', label_ar: 'بيع كامل', value: 120, suffix_en: ' units', suffix_ar: ' وحدة' },
      { label_en: 'Conversion Rate', label_ar: 'معدل التحويل', value: 41, suffix_en: '%', suffix_ar: '%' },
      { label_en: 'Cost Per Lead', label_ar: 'تكلفة العميل', value: 65, suffix_en: '%  ↓ ', suffix_ar: ' ↓  %' },
      { label_en: 'Time to Sell-Out', label_ar: 'وقت البيع الكامل', value: 7, suffix_en: ' months', suffix_ar: ' أشهر' },
    ],
    timeline_en: 'Full sell-out in 7 months',
    timeline_ar: 'بيع كامل في 7 أشهر',
    slug: 'green-terraces-case-study',
  },
];
