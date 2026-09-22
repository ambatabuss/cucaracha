import { storage } from "@vendetta/plugin";
import { after } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";
import { ReactNative as RN, i18n } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { getArabic } from "./translations";

// ============================================================================
// ملاحظة مهمة عن البنية (مبنية على دراسة مشروع ArabCord ومحرك @discord/intl):
//
// ديسكورد الحديث لا يخزّن النصوص بمفاتيح واضحة مثل "SERVERS" وقت التشغيل.
// حزمة @discord/intl الرسمية تحوّل كل مفتاح رسالة (مثل HELLO_WORLD) إلى
// معرّف مُجزّأ (hash) عند البناء، لذا اعتراض الدالة بالاعتماد على "المفتاح"
// (args[0]) غير موثوق لأننا لا نعرف اسم المفتاح الحقيقي وقت التشغيل.
//
// الحل الأكثر موثوقية: نترك ديسكورد يحسب النص الإنجليزي كما يفعل عادة،
// ثم نعترض *القيمة الناتجة* (res) ونقارنها بقاموس نصوص إنجليزية معروفة.
// هذا يعمل بغض النظر عن آلية الـ hashing الداخلية لأن النص الظاهر في
// الواجهة ثابت ومعروف مسبقاً.
// ============================================================================

type Unpatch = () => void;

const patches: Unpatch[] = [];
const loggedMissingStrings = new Set<string>();

function safeUnpatchAll() {
  while (patches.length) {
    const unpatch = patches.pop();
    try {
      unpatch?.();
    } catch (e) {
      console.error("[Arabic Discord] Unpatch Error:", e);
    }
  }
}

export const onLoad = () => {
  try {
    if (storage.enableArabic === undefined) storage.enableArabic = true;
    // درس مستفاد من ArabCord: فرض RTL على كامل الواجهة يكسر عناصر مثل
    // أيقونات شريط السيرفرات ومفاتيح التبديل (Switch)، لذا يبقى معطّلاً
    // افتراضياً وتجريبياً (BETA) حتى يفعّله المستخدم بنفسه بوعي.
    if (storage.enableRTL === undefined) storage.enableRTL = false;
    if (storage.debugMode === undefined) storage.debugMode = false;

    let success = false;

    if (storage.enableArabic) {
      success = patchTranslations();
    }

    if (storage.enableRTL && RN?.I18nManager) {
      try {
        RN.I18nManager.allowRTL(true);
        RN.I18nManager.forceRTL(true);
      } catch (e) {
        console.error("[Arabic Discord] Error enabling RTL:", e);
      }
    }

    if (!storage.enableArabic) {
      showToast("الإضافة نشطة، لكن التعريب معطّل من الإعدادات", getAssetIDByName("Small"));
    } else if (success) {
      showToast("تم تفعيل التعريب بنجاح!", getAssetIDByName("Check"));
    } else {
      showToast("تعذر تفعيل التعريب: لم يتم العثور على وحدة i18n", getAssetIDByName("Small"));
    }
  } catch (err: any) {
    console.error("[Arabic Discord] Load Error:", err);
    showToast(`خطأ: ${err?.message || err}`, getAssetIDByName("Small"));
  }
};

/**
 * يحاول تعريب النصوص عبر مسارين متوازيين (بنفس فلسفة ArabCord):
 *  1) discord-intl: اعتراض الدوال التي تُرجع النص النهائي (string/format/get...)
 *  2) Messages map: تعديل القيم مباشرة إن وُجد كائن Messages قديم الطراز
 * وفي الحالتين تتم المطابقة بمحتوى النص الإنجليزي الناتج، وليس بالمفتاح.
 */
function patchTranslations(): boolean {
  let isPatched = false;

  const targetModule: any =
    i18n ||
    findByProps("getMessage") ||
    findByProps("getLocale") ||
    findByProps("Messages") ||
    findByProps("string", "format");

  if (!targetModule) return false;

  // 1) مسار Messages القديم: نطابق حسب *قيمة* كل مفتاح الحالية، لا اسمه
  if (targetModule.Messages) {
    for (const key of Object.keys(targetModule.Messages)) {
      try {
        const currentValue = targetModule.Messages[key];
        if (typeof currentValue !== "string") continue;

        const arabic = getArabic(currentValue);
        if (!arabic) continue;

        try {
          Object.defineProperty(targetModule.Messages, key, {
            get: () => arabic,
            configurable: true,
            enumerable: true,
          });
        } catch (e) {
          targetModule.Messages[key] = arabic;
        }
        isPatched = true;
      } catch (e) {
        // تجاهل مفتاح واحد فقط عند الفشل، لا نوقف بقية العملية
      }
    }
  }

  // 2) مسار discord-intl / الدوال المباشرة: نعترض القيمة المُرجَعة (res)
  const methodsToPatch = [
    "getMessage",
    "getParsedMessage",
    "get",
    "string",
    "format",
    "formatToPlainString",
    "t",
  ];

  for (const methodName of methodsToPatch) {
    if (typeof targetModule[methodName] !== "function") continue;

    try {
      const unpatch = after(methodName, targetModule, (_args: any[], res: any) => {
        if (typeof res !== "string") return res;

        const arabic = getArabic(res);
        if (arabic) return arabic;

        if (storage.debugMode && res.length < 80 && !loggedMissingStrings.has(res)) {
          loggedMissingStrings.add(res);
          console.log(`[Arabic Discord] نص غير مترجم: "${res}"`);
        }

        return res;
      });

      patches.push(unpatch);
      isPatched = true;
    } catch (e) {
      console.error(`[Arabic Discord] Failed to patch ${methodName}:`, e);
    }
  }

  return isPatched;
}

export const onUnload = () => {
  try {
    safeUnpatchAll();
  } catch (e) {
    console.error("[Arabic Discord] Unpatch Error:", e);
  }

  try {
    if (RN?.I18nManager) {
      RN.I18nManager.forceRTL(false);
    }
  } catch (e) {
    console.error("[Arabic Discord] RTL Reset Error:", e);
  }

  try {
    showToast("تم إيقاف الإضافة", getAssetIDByName("Small"));
  } catch (e) {}
};

export { default as settings } from "./Settings";
              
