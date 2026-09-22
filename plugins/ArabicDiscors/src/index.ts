import { patcher, storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import { React, ReactNative as RN } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { arabicTranslations } from "./translations";

const { I18nManager } = RN;
const Messages = findByProps("Messages", "getLocale");
const i18nModule = findByProps("i18n");

export const onLoad = () => {
  // تفعيل خيار الترجمة افتراضياً في الذاكرة
  if (storage.enableArabic === undefined) storage.enableArabic = true;
  if (storage.enableRTL === undefined) storage.enableRTL = true;

  if (storage.enableArabic) {
    applyTranslations();
  }

  if (storage.enableRTL && !I18nManager.isRTL) {
    try {
      I18nManager.forceRTL(true);
    } catch (e) {
      console.error("[Discord Arabic] Failed to force RTL layout", e);
    }
  }

  showToast("تم تفعيل تعريب ديسكورد بنجاح", getAssetIDByName("Check"));
};

function applyTranslations() {
  if (!Messages) return;

  // استبدال مفاتيح النصوص بالترجمة العربية
  for (const key in arabicTranslations) {
    if (Object.prototype.hasOwnProperty.call(Messages, key)) {
      Object.defineProperty(Messages, key, {
        value: arabicTranslations[key],
        configurable: true,
        writable: true
      });
    }
  }

  // الاعتراض على دالة الجلب المباشر للنصوص
  if (i18nModule && i18nModule.Messages) {
    patcher.after(i18nModule, "get", (args, res) => {
      const key = args[0];
      if (arabicTranslations[key]) {
        return arabicTranslations[key];
      }
      return res;
    });
  }
}

export const onUnload = () => {
  // إلغاء كل التعديلات عند إيقاف الإضافة
  patcher.unpatchAll();

  if (I18nManager.isRTL) {
    I18nManager.forceRTL(false);
  }

  showToast("تم إيقاف تعريب ديسكورد", getAssetIDByName("Small"));
};

export { default as settings } from "./settings";
