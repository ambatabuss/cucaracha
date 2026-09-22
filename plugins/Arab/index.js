/**
 * تعريب ديسكورد — Discord Arabic Localization Plugin
 * متوافق مع Vendetta / Revenge / Bunny (وأي عميل تعديل يشارك واجهة الإضافات @vendetta/*)
 *
 * الفكرة:
 *  ديسكورد يخزّن كل نصوص الواجهة داخل كائن واحد (يُعرف عادة باسم "Messages")
 *  ضمن حزمة الـ Metro الداخلية للتطبيق. هذه الإضافة تبحث عن ذلك الكائن،
 *  ثم تستبدل المفاتيح الإنجليزية المعروفة بترجمتها العربية من dictionary أدناه.
 *
 * تنبيه مهم جدًا:
 *  أسماء المفاتيح الداخلية (مثل "SETTINGS" أو "LOG_OUT") هي ملك لديسكورد نفسه
 *  وقد تتغيّر مع أي تحديث للتطبيق. القاموس أدناه يحتوي على أمثلة شائعة يُرجّح
 *  بقاؤها لكنها غير مضمونة 100%. استخدم دالة dumpAvailableKeyCount() بالأسفل
 *  لتتأكد أن الإضافة "ترى" فعلاً كائن النصوص، ووسّع القاموس تدريجيًا حسب حاجتك.
 *  هذا العمل يشبه تمامًا كل مشاريع تعريب/تخصيص عملاء ديسكورد المعدّلة الأخرى:
 *  يحتاج صيانة دورية مع كل تحديث كبير لديسكورد.
 */

const { findByProps } = require("@vendetta/metro");
const { storage } = require("@vendetta/plugin");
const { showToast } = require("@vendetta/ui/toasts");

// ---------------------------------------------------------------------------
// 1) قاموس الترجمة — وسّعه كما تشاء (المفتاح بالإنجليزية = القيمة بالعربية)
// ---------------------------------------------------------------------------
const dictionary = {
  HOME: "الرئيسية",
  FRIENDS: "الأصدقاء",
  NITRO: "نيترو",
  SETTINGS: "الإعدادات",
  USER_SETTINGS: "إعدادات المستخدم",
  LOG_OUT: "تسجيل الخروج",
  SEARCH: "بحث",
  CANCEL: "إلغاء",
  SAVE_CHANGES: "حفظ التغييرات",
  DONE: "تم",
  EDIT: "تعديل",
  DELETE: "حذف",
  COPY: "نسخ",
  SEND: "إرسال",
  REPLY: "رد",
  PIN: "تثبيت",
  UNPIN: "إلغاء التثبيت",
  MUTE: "كتم",
  UNMUTE: "إلغاء الكتم",
  BLOCK: "حظر",
  UNBLOCK: "إلغاء الحظر",
  ADD_FRIEND: "إضافة صديق",
  NEW_MESSAGE: "رسالة جديدة",
  NOTIFICATIONS: "الإشعارات",
  PRIVACY: "الخصوصية",
  APPEARANCE: "المظهر",
  VOICE_AND_VIDEO: "الصوت والفيديو",
  ONLINE: "متصل",
  IDLE: "خامل",
  DO_NOT_DISTURB: "عدم الإزعاج",
  INVISIBLE: "غير ظاهر",
  MARK_AS_READ: "وضع علامة مقروء",
  ABOUT_ME: "نبذة عني",
  STATUS: "الحالة",
  CONNECT: "اتصال",
  DISCONNECT: "قطع الاتصال",
};

// ---------------------------------------------------------------------------
// 2) البحث عن الوحدة الداخلية التي تحمل نصوص الواجهة
// ---------------------------------------------------------------------------
function getMessagesModule() {
  return (
    findByProps("Messages", "getLocale") ||
    findByProps("Messages", "getAvailableLocales") ||
    findByProps("Messages")
  );
}

const originals = {};

function applyTranslations() {
  const mod = getMessagesModule();
  if (!mod || !mod.Messages) {
    showToast("تعذّر إيجاد وحدة النصوص (Messages) — يبدو أن بنية ديسكورد الداخلية تغيّرت.");
    return;
  }

  let changed = 0;
  for (const key in dictionary) {
    if (!(key in mod.Messages)) continue; // تجاهل أي مفتاح غير موجود حاليًا في هذا الإصدار
    if (!(key in originals)) {
      try {
        originals[key] = mod.Messages[key];
      } catch {
        continue;
      }
    }
    try {
      mod.Messages[key] = dictionary[key];
      changed++;
    } catch {
      // بعض المفاتيح قد تكون للقراءة فقط في بعض إصدارات ديسكورد
    }
  }

  if (storage.notifyOnLoad !== false) {
    showToast(changed > 0 ? `تم تعريب ${changed} من عناصر الواجهة.` : "لم يتم العثور على أي مفتاح مطابق، راجع README.md.");
  }
}

function restoreOriginals() {
  const mod = getMessagesModule();
  if (!mod || !mod.Messages) return;
  for (const key in originals) {
    try {
      mod.Messages[key] = originals[key];
    } catch {}
  }
}

// ---------------------------------------------------------------------------
// 3) أداة اختيارية للمطوّر: تُرجع عدد المفاتيح المتاحة فعليًا في نسختك الحالية
//    من التطبيق، لتتأكد أن البحث نجح قبل أن توسّع القاموس. يمكن استدعاؤها من
//    "Evaluate JS" في إعدادات المطوّر داخل Vendetta/Revenge.
// ---------------------------------------------------------------------------
function dumpAvailableKeyCount() {
  const mod = getMessagesModule();
  if (!mod || !mod.Messages) return 0;
  return Object.keys(mod.Messages).length;
}

// ---------------------------------------------------------------------------
// 4) دورة حياة الإضافة
// ---------------------------------------------------------------------------
module.exports = {
  onLoad: () => {
    applyTranslations();
  },
  onUnload: () => {
    restoreOriginals();
  },
};
      
