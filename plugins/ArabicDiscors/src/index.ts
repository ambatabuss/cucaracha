import { patcher, storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { arabicTranslations } from "./translations";

const { I18nManager } = RN;

export const onLoad = () => {
  // ضبط القيم الافتراضية
  if (storage.enableArabic === undefined) storage.enableArabic = true;
  if (storage.enableRTL === undefined) storage.enableRTL = true;

  let appliedCount = 0;

  if (storage.enableArabic) {
    appliedCount = applyTranslations();
  }

  if (storage.enableRTL) {
    try {
      I18nManager.allowRTL(true);
      I18nManager.forceRTL(true);
    } catch (e) {
      console.error("[Arabic Discord] Error forcing RTL:", e);
    }
  }

  // إشعار تشخيصي لمعرفة النتيجة فور فتح التطبيق
  if (appliedCount > 0) {
    showToast(`تم تعريب ${appliedCount} نصاً بنجاح!`, getAssetIDByName("Check"));
  } else {
    showToast("تعذر الوصول لوحدة النصوص (i18n)!", getAssetIDByName("Small"));
  }
};

function applyTranslations(): number {
  // البحث عن وحدة النصوص عبر عدة طرق لضمان التوافق مع التحديثات الجديدة
  const i18nModule: any = 
    findByProps("Messages", "getLocale") || 
    findByProps("Messages") || 
    findByProps("getMessage");

  if (!i18nModule) {
    console.error("[Arabic Discord] i18n module not found");
    return 0;
  }

  let count = 0;

  // 1. تعديل كائن Messages المباشر
  const targetMessages = i18nModule.Messages || i18nModule;
  if (targetMessages) {
    for (const key in arabicTranslations) {
      if (Object.prototype.hasOwnProperty.call(arabicTranslations, key)) {
        try {
          Object.defineProperty(targetMessages, key, {
            get: () => arabicTranslations[key],
            set: () => {},
            configurable: true,
            enumerable: true
          });
          count++;
        } catch (e) {
          try {
            targetMessages[key] = arabicTranslations[key];
            count++;
          } catch (err) {}
        }
      }
    }
  }

  // 2. الاعتراض على دالة جلب النصوص إن وجدت
  const fnName = i18nModule.getMessage ? "getMessage" : (i18nModule.get ? "get" : null);
  if (fnName && typeof i18nModule[fnName] === "function") {
    patcher.after(i18nModule, fnName, (args, res) => {
      const key = args[0];
      if (key && arabicTranslations[key]) {
        return arabicTranslations[key];
      }
      return res;
    });
  }

  return count;
}

export const onUnload = () => {
  patcher.unpatchAll();

  try {
    I18nManager.forceRTL(false);
  } catch (e) {
    console.error("[Arabic Discord] Error resetting RTL:", e);
  }

  showToast("تم إيقاف التعريب", getAssetIDByName("Small"));
};

export { default as settings } from "./settings";
  
