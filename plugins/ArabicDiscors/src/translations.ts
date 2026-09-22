// ============================================================================
// لماذا نطابق هنا بـ"النص الإنجليزي الظاهر" وليس بمفتاح داخلي مثل "SERVERS"؟
//
// ديسكورد الحديث (حزمة @discord/intl الرسمية) يحوّل كل مفتاح رسالة إلى
// معرّف مُجزّأ (hash) عند البناء، فلا توجد طريقة موثوقة لتخمين اسم المفتاح
// وقت التشغيل. لكن **النص الإنجليزي النهائي** الذي يظهر في الواجهة ثابت
// ومعروف مسبقاً (لأننا نراه بأعيننا في التطبيق)، لذا هو أساس مطابقة أكثر
// موثوقية بكثير — وهو نفس الأسلوب الذي يعتمده مشروع ArabCord المفتوح المصدر.
//
// طريقة الإضافة والتوسعة:
//   1) فعّل storage.debugMode من إعدادات الإضافة.
//   2) راقب الـ console: سيطبع أي نص إنجليزي ظهر في التطبيق ولم يجد له
//      ترجمة هنا، بصيغة: [Arabic Discord] نص غير مترجم: "..."
//   3) انسخ النص كما هو حرفياً وأضفه كمفتاح جديد في الكائن أدناه.
//
// المطابقة غير حساسة لحالة الأحرف ولا للمسافات الزائدة بفضل getArabic()،
// لكن يُفضّل نسخ النص الإنجليزي كما يظهر تماماً لتفادي أي فروق دقيقة.
// ============================================================================

export const arabicTranslations: Record<string, string> = {
  // ===== التنقل العام =====
  "Servers": "السيرفرات",
  "Friends": "الأصدقاء",
  "Direct Messages": "الرسائل الخاصة",
  "Settings": "الإعدادات",
  "User Settings": "إعدادات المستخدم",
  "Search": "بحث",
  "Cancel": "إلغاء",
  "Save": "حفظ",
  "Save Changes": "حفظ التغييرات",
  "Edit": "تعديل",
  "Delete": "حذف",
  "Close": "إغلاق",
  "Back": "رجوع",
  "Done": "تم",
  "Continue": "متابعة",
  "Confirm": "تأكيد",
  "Submit": "إرسال",
  "Loading...": "جارٍ التحميل...",
  "Retry": "إعادة المحاولة",
  "Yes": "نعم",
  "No": "لا",
  "OK": "حسناً",
  "Home": "الرئيسية",
  "Explore": "استكشاف",

  // ===== الدردشة والرسائل =====
  "Message": "رسالة",
  "Messages": "الرسائل",
  "New Messages": "رسائل جديدة",
  "Mark as Read": "تحديد كـ مقروء",
  "Mark as Unread": "تحديد كـ غير مقروء",
  "Mark As Read": "تحديد كـ مقروء",
  "Reply": "رد",
  "Edit Message": "تعديل الرسالة",
  "Delete Message": "حذف الرسالة",
  "Copy Text": "نسخ النص",
  "Copy Message Link": "نسخ رابط الرسالة",
  "Copy ID": "نسخ المعرّف",
  "Pin Message": "تثبيت الرسالة",
  "Unpin Message": "إلغاء تثبيت الرسالة",
  "Pinned Messages": "الرسائل المثبتة",
  "Pins": "الرسائل المثبتة",
  "Add Reaction": "إضافة تفاعل",
  "Forward": "إعادة توجيه",
  "Report Message": "الإبلاغ عن الرسالة",
  "(edited)": "(معدّلة)",
  "Attach File": "إرفاق ملف",
  "Upload a File": "رفع ملف",
  "Files": "الملفات",
  "Media": "الوسائط",
  "Poll": "استطلاع",
  "Start Thread": "بدء موضوع",
  "Threads": "المواضيع",

  // ===== الحالة والتواجد =====
  "Online": "متصل",
  "Idle": "خامل",
  "Do Not Disturb": "الرجاء عدم الإزعاج",
  "Offline": "غير متصل",
  "Invisible": "مخفي",
  "Set Custom Status": "تعيين حالة مخصصة",
  "Add Status": "إضافة حالة",
  "Clear Status": "مسح الحالة",

  // ===== السيرفر والقنوات =====
  "Channels": "القنوات",
  "Text Channel": "قناة نصية",
  "Text Channels": "القنوات النصية",
  "Voice Channel": "قناة صوتية",
  "Voice Channels": "القنوات الصوتية",
  "Stage Channels": "قنوات الأحداث",
  "Category": "تصنيف",
  "Members": "الأعضاء",
  "Roles": "الأدوار",
  "Invite": "دعوة",
  "Invite People": "دعوة أشخاص",
  "Invite Members": "دعوة أعضاء",
  "Share Invite": "مشاركة الدعوة",
  "Create Channel": "إنشاء قناة",
  "Create Category": "إنشاء تصنيف",
  "Edit Channel": "تعديل القناة",
  "Delete Channel": "حذف القناة",
  "Server Settings": "إعدادات السيرفر",
  "Server Boost": "تعزيز السيرفر",
  "Leave Server": "مغادرة السيرفر",
  "Create Server": "إنشاء سيرفر",
  "Join Server": "الانضمام إلى سيرفر",
  "Community Server": "سيرفر مجتمعي",
  "Browse Channels": "تصفح القنوات",
  "Channels & Roles": "القنوات والأدوار",

  // ===== الصوت والفيديو =====
  "Mute": "كتم",
  "Unmute": "إلغاء الكتم",
  "Deafen": "كتم الصوت الوارد",
  "Undeafen": "إلغاء كتم الصوت الوارد",
  "Disconnect": "قطع الاتصال",
  "Video Call": "مكالمة فيديو",
  "Voice Call": "مكالمة صوتية",
  "Start Call": "بدء مكالمة",
  "Screen Share": "مشاركة الشاشة",
  "Stop Stream": "إيقاف البث",
  "Camera": "الكاميرا",
  "Microphone": "الميكروفون",

  // ===== قائمة إعدادات المستخدم =====
  "My Account": "حسابي",
  "Profiles": "الملفات الشخصية",
  "Edit Per-Server Profile": "تعديل الملف الشخصي لهذا السيرفر",
  "Privacy & Safety": "الخصوصية والأمان",
  "Family Center": "مركز الأسرة",
  "Authorized Apps": "التطبيقات المصرّح بها",
  "Connections": "الحسابات المرتبطة",
  "Devices": "الأجهزة",
  "Appearance": "المظهر",
  "Accessibility": "إمكانية الوصول",
  "Voice & Video": "الصوت والفيديو",
  "Text & Images": "النصوص والصور",
  "Notifications": "الإشعارات",
  "Keybinds": "اختصارات لوحة المفاتيح",
  "Language": "اللغة",
  "Streamer Mode": "وضع البث",
  "Advanced": "متقدم",
  "Advanced Settings": "إعدادات متقدمة",
  "Developer Mode": "وضع المطوّر",
  "Activity Privacy": "خصوصية النشاط",
  "Sessions": "الجلسات النشطة",
  "Subscriptions": "الاشتراكات",
  "Nitro": "نيترو",
  "Get Nitro": "احصل على نيترو",
  "Gift Inventory": "هدايا مستلمة",
  "Billing": "الفوترة",
  "Log Out": "تسجيل الخروج",
  "Change Password": "تغيير كلمة المرور",
  "Two-Factor Auth": "المصادقة الثنائية",
  "Username": "اسم المستخدم",
  "Email": "البريد الإلكتروني",
  "Phone Number": "رقم الهاتف",
  "Copy Username": "نسخ اسم المستخدم",
  "QR Code": "رمز الاستجابة السريعة",
  "About Me": "نبذة عني",
  "Member Since": "عضو منذ",
  "LaunchPad": "لوحة الانطلاق",
  "Suggested Friends": "أصدقاء مقترحون",

  // ===== الإشعارات =====
  "Enable Desktop Notifications": "تفعيل إشعارات سطح المكتب",
  "Enable Push Notifications": "تفعيل الإشعارات الفورية",
  "Mute Channel": "كتم القناة",
  "Mute Server": "كتم السيرفر",
  "Notification Settings": "إعدادات الإشعارات",
  "All Messages": "جميع الرسائل",
  "Only Mentions": "الإشارات فقط",
  "Nothing": "لا شيء",

  // ===== الخصوصية والإشراف =====
  "Block": "حظر",
  "Unblock": "إلغاء الحظر",
  "Blocked Users": "المستخدمون المحظورون",
  "Kick": "طرد",
  "Ban": "حظر دائم",
  "Timeout": "إسكات مؤقت",
  "Remove Timeout": "إلغاء الإسكات المؤقت",
  "Report": "إبلاغ",

  // ===== الأصدقاء =====
  "Add Friend": "إضافة صديق",
  "Add Friends": "إضافة أصدقاء",
  "Remove Friend": "إزالة صديق",
  "Pending": "قيد الانتظار",
  "All Friends": "جميع الأصدقاء",
  "Online Friends": "الأصدقاء المتصلون",
  "Accept": "قبول",
  "Ignore": "تجاهل",

  // ===== عام / أزرار متفرقة =====
  "Something went wrong": "حدث خطأ ما",
  "No results found": "لا توجد نتائج",
  "Upload": "رفع",
  "Download": "تنزيل",
  "Share": "مشاركة",
  "Copy": "نسخ",
  "Paste": "لصق",
  "Select All": "تحديد الكل",
  "Create": "إنشاء",
  "Remove": "إزالة",
  "Add": "إضافة",
  "More": "المزيد",
  "Show More": "عرض المزيد",
  "Show Less": "عرض أقل",
  "You": "أنت",
};

// ----------------------------------------------------------------------------
// محرك المطابقة: فهرس مُطبَّع (lowercase + trim) لمقاومة فروق حالة الأحرف
// والمسافات الزائدة التي قد يضيفها ديسكورد حول النص الأصلي
// ----------------------------------------------------------------------------
const normalizedLookup: Map<string, string> = new Map(
  Object.entries(arabicTranslations).map(([english, arabic]) => [
    english.trim().toLowerCase(),
    arabic,
  ])
);

/**
 * يرجع الترجمة العربية لنص إنجليزي إن وُجدت مطابقة تامة (بعد التطبيع)،
 * أو undefined إن لم توجد. لا يقوم بترجمة جزئية داخل الجمل لتفادي كسر
 * محتوى المستخدمين أو أسماء القنوات.
 */
export function getArabic(englishText: string): string | undefined {
  if (!englishText) return undefined;
  return normalizedLookup.get(englishText.trim().toLowerCase());
  }
