import { patcher, storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import { ReactNative as RN } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { arabicTranslations } from "./translations";

export const onLoad = () => {
  try {
    if (storage.enableArabic === undefined) storage.enableArabic = true;
    if (storage.enableRTL === undefined) storage.enableRTL = true;

    let applied = false;

    if (storage.enableArabic) {
      applied = patchI18nMessages();
    }

    if (storage.enableRTL && RN?.I18nManager) {
      try {
        RN.I18nManager.allowRTL(true);
        RN.I18nManager.forceRTL(true);
      } catch (e) {
        console.error("[Arabic Discord] Error setting RTL:", e);
      }
    }

    if (applied) {
      showToast("تم تفعيل التعريب بنجاح!", getAssetIDByName("Check"));
    } else {
      showToast("تعذر العثور على دالة النصوص (i18n)", getAssetIDByName("Small"));
    }
  } catch (err: any) {
    console.error("[Arabic Discord] Load Error:", err);
    showToast(`خطأ: ${err?.message || err}`, getAssetIDByName("Small"));
  }
};

function patchI18nMessages(): boolean {
  // البحث عن وحدة i18n المعتمدة في ديسكورد عبر أسمد الدوال وليس الخصائص الثابتة
  const i18nModule: any = 
    findByProps("getMessage") || 
    findByProps("getLocale") || 
    findByProps("defaultLocale");

  if (!i18nModule) return false;

  // 1. اعتراض دالة جلب النصوص ديناميكياً (الطريقة المعتمدة في الإضافات الحديثة)
  const targetMethod = i18nModule.getMessage ? "getMessage" : (i18nModule.get ? "get" : null);

  if (targetMethod && typeof i18nModule[targetMethod] === "function") {
    patcher.after(i18nModule, targetMethod, (args, res) => {
      const key = args[0];
      if (key && arabicTranslations[key]) {
        return arabicTranslations[key];
      }
      return res;
    });
    return true;
  }

  // 2. خيار احتياطي في حال وجود كائن Messages في إصدارات معينة
  if (i18nModule.Messages) {
    for (const key in arabicTranslations) {
      if (Object.prototype.hasOwnProperty.call(arabicTranslations, key)) {
        try {
          i18nModule.Messages[key] = arabicTranslations[key];
        } catch (e) {}
      }
    }
    return true;
  }

  return false;
}

export const onUnload = () => {
  try {
    patcher.unpatchAll();
    if (RN?.I18nManager) {
      RN.I18nManager.forceRTL(false);
    }
    showToast("تم إيقاف الإضافة", getAssetIDByName("Small"));
  } catch (e) {}
};

export { default as settings } from "./settings";
      
