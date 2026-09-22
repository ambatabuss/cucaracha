import { patcher, storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { arabicTranslations } from "./translations";

const { I18nManager } = RN;

export const onLoad = () => {
  // ضبط الخيارات الافتراضية
  if (storage.enableArabic === undefined) storage.enableArabic = true;
  if (storage.enableRTL === undefined) storage.enableRTL = true;

  if (storage.enableArabic) {
    applyTranslations();
  }

  if (storage.enableRTL) {
    try {
      I18nManager.forceRTL(true);
    } catch (e) {
      console.error("[Arabic Discord] Error forcing RTL:", e);
    }
  }

  showToast("تم تفعيل الإضافة - يرجى إعادة تشغيل التطبيق", getAssetIDByName("Check"));
};

function applyTranslations() {
  // جلب وحدة i18n داخل الدالة لضمان التحميل الكامل لـ Metro Modules
  const i18n = findByProps("Messages", "getLocale");

  if (!i18n || !i18n.Messages) {
    console.error("[Arabic Discord] Could not locate i18n Messages module.");
    return;
  }

  // استبدال Getters النصوص المترجمة
  for (const key in arabicTranslations) {
    if (Object.prototype.hasOwnProperty.call(arabicTranslations, key)) {
      try {
        Object.defineProperty(i18n.Messages, key, {
          get: () => arabicTranslations[key],
          configurable: true,
          enumerable: true
        });
      } catch (e) {
        // في حال كان المفتاح مقفلاً، يتم التعديل المباشر
        i18n.Messages[key] = arabicTranslations[key];
      }
    }
  }
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
