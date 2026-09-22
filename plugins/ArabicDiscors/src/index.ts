import { storage } from "@vendetta/plugin";
import { after, unpatchAll } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";
import { ReactNative as RN, i18n } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { arabicTranslations } from "./translations";

export const onLoad = () => {
  try {
    if (storage.enableArabic === undefined) storage.enableArabic = true;
    if (storage.enableRTL === undefined) storage.enableRTL = true;

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

    if (success) {
      showToast("تم تفعيل التعريب بنجاح!", getAssetIDByName("Check"));
    } else {
      showToast("تم التفعيل (بانتظار تحميل النصوص)", getAssetIDByName("Check"));
    }
  } catch (err: any) {
    console.error("[Arabic Discord] Load Error:", err);
    showToast(`خطأ: ${err?.message || err}`, getAssetIDByName("Small"));
  }
};

function patchTranslations(): boolean {
  let isPatched = false;

  // تحديد كائن i18n المطلوب
  const targetModule: any = i18n || findByProps("getMessage") || findByProps("getLocale");

  if (!targetModule) return false;

  // 1. تعديل كائن Messages المباشر إن وجد
  if (targetModule.Messages) {
    for (const key in arabicTranslations) {
      if (Object.prototype.hasOwnProperty.call(arabicTranslations, key)) {
        try {
          Object.defineProperty(targetModule.Messages, key, {
            get: () => arabicTranslations[key],
            configurable: true,
            enumerable: true
          });
          isPatched = true;
        } catch (e) {
          try {
            targetModule.Messages[key] = arabicTranslations[key];
            isPatched = true;
          } catch (err) {}
        }
      }
    }
  }

  // 2. اعتراض دوال جلب النصوص باستخدام @vendetta/patcher
  const methodsToPatch = ["getMessage", "getParsedMessage", "get"];

  for (const methodName of methodsToPatch) {
    if (typeof targetModule[methodName] === "function") {
      try {
        after(methodName, targetModule, (args, res) => {
          const key = args[0];
          if (key && arabicTranslations[key]) {
            return arabicTranslations[key];
          }
          return res;
        });
        isPatched = true;
      } catch (e) {
        console.error(`[Arabic Discord] Failed to patch ${methodName}:`, e);
      }
    }
  }

  return isPatched;
}

export const onUnload = () => {
  try {
    unpatchAll();
    if (RN?.I18nManager) {
      RN.I18nManager.forceRTL(false);
    }
    showToast("تم إيقاف الإضافة", getAssetIDByName("Small"));
  } catch (e) {}
};

export { default as settings } from "./settings";
          
