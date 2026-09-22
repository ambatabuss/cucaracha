import { storage } from "@vendetta/plugin";
import { after } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";
import { ReactNative as RN, i18n } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { arabicTranslations } from "./translations";

type Unpatch = () => void;

// نخزّن هنا كل دوال إلغاء التصحيح التي يرجعها @vendetta/patcher
// (المكتبة لا تصدّر unpatchAll، لذا يجب تتبعها يدوياً)
const patches: Unpatch[] = [];

// مجموعة لتتبع المفاتيح التي طُلبت ولم نجد لها ترجمة، لتفادي تكرار
// نفس الرسالة في الـ console مئات المرات
const loggedMissingKeys = new Set<string>();

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
    if (storage.enableRTL === undefined) storage.enableRTL = true;
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

function patchTranslations(): boolean {
  let isPatched = false;

  // تحديد كائن i18n المطلوب مع عدة بدائل احتياطية
  const targetModule: any =
    i18n ||
    findByProps("getMessage") ||
    findByProps("getLocale") ||
    findByProps("Messages");

  if (!targetModule) return false;

  // 1. تعديل كائن Messages المباشر إن وجد
  if (targetModule.Messages) {
    for (const key in arabicTranslations) {
      if (!Object.prototype.hasOwnProperty.call(arabicTranslations, key)) continue;

      try {
        Object.defineProperty(targetModule.Messages, key, {
          get: () => arabicTranslations[key],
          configurable: true,
          enumerable: true,
        });
        isPatched = true;
      } catch (e) {
        try {
          targetModule.Messages[key] = arabicTranslations[key];
          isPatched = true;
        } catch (err) {
          // تجاهل مفتاح واحد إن تعذر تعديله، ولا نوقف بقية العملية
        }
      }
    }
  }

  // 2. اعتراض دوال جلب النصوص باستخدام @vendetta/patcher
  const methodsToPatch = ["getMessage", "getParsedMessage", "get"];

  for (const methodName of methodsToPatch) {
    if (typeof targetModule[methodName] !== "function") continue;

    try {
      const unpatch = after(methodName, targetModule, (args: any[], res: any) => {
        const key = args?.[0];

        if (typeof key === "string") {
          if (arabicTranslations[key]) {
            return arabicTranslations[key];
          }

          // وضع التصحيح: يساعدك على معرفة المفاتيح الحقيقية غير المترجمة
          if (storage.debugMode && !loggedMissingKeys.has(key)) {
            loggedMissingKeys.add(key);
            console.log(`[Arabic Discord] مفتاح غير مترجم: "${key}" ->`, res);
          }
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
      
