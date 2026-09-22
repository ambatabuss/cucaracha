import { patcher, storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import { ReactNative as RN } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { arabicTranslations } from "./translations";

export const onLoad = () => {
  try {
    // 1. ضبط الخيارات الافتراضية
    if (storage.enableArabic === undefined) storage.enableArabic = true;
    if (storage.enableRTL === undefined) storage.enableRTL = true;

    let appliedCount = 0;

    if (storage.enableArabic) {
      appliedCount = applyTranslations();
    }

    // 2. تطبيق اتجاه الواجهة بأمان
    if (storage.enableRTL && RN?.I18nManager) {
      try {
        RN.I18nManager.allowRTL(true);
        RN.I18nManager.forceRTL(true);
      } catch (e) {
        console.error("[Arabic Discord] Error forcing RTL:", e);
      }
    }

    // 3. إظهار النتيجة
    if (appliedCount > 0) {
      showToast(`تم تعريب ${appliedCount} نصاً!`, getAssetIDByName("Check"));
    } else {
      showToast("لم يتم العثور على وحدة النصوص", getAssetIDByName("Small"));
    }
  } catch (err: any) {
    console.error("[Arabic Discord] Crash on load:", err);
    showToast(`خطأ في الإضافة: ${err?.message || err}`, getAssetIDByName("Small"));
  }
};

function applyTranslations(): number {
  let count = 0;

  // البحث عن وحدة النصوص
  const i18nModule: any = 
    findByProps("Messages", "getLocale") || 
    findByProps("Messages");

  if (!i18nModule || !i18nModule.Messages) {
    return 0;
  }

  const messages = i18nModule.Messages;

  for (const key in arabicTranslations) {
    if (Object.prototype.hasOwnProperty.call(arabicTranslations, key)) {
      try {
        messages[key] = arabicTranslations[key];
        count++;
      } catch (e) {
        try {
          Object.defineProperty(messages, key, {
            value: arabicTranslations[key],
            writable: true,
            configurable: true,
            enumerable: true
          });
          count++;
        } catch (err) {}
      }
    }
  }

  return count;
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
        
