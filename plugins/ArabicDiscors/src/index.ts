import { patcher, storage } from "@vendetta/plugin";
import { findByProps, metro } from "@vendetta/metro";
import { React, ReactNative as RN, i18n } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { arabicTranslations } from "./translations";

export const onLoad = () => {
  try {
    if (storage.enableArabic === undefined) storage.enableArabic = true;
    if (storage.enableRTL === undefined) storage.enableRTL = true;

    let appliedCount = 0;

    if (storage.enableArabic) {
      appliedCount = applyTranslations();
    }

    if (storage.enableRTL && RN?.I18nManager) {
      try {
        RN.I18nManager.allowRTL(true);
        RN.I18nManager.forceRTL(true);
      } catch (e) {
        console.error("[Arabic Discord] Error forcing RTL:", e);
      }
    }

    if (appliedCount > 0) {
      showToast(`تم تعريب ${appliedCount} نصاً بنجاح!`, getAssetIDByName("Check"));
    } else {
      showToast("تعذر العثور على وحدة النصوص (i18n)", getAssetIDByName("Small"));
    }
  } catch (err: any) {
    console.error("[Arabic Discord] Crash on load:", err);
    showToast(`خطأ: ${err?.message || err}`, getAssetIDByName("Small"));
  }
};

function findMessagesObject(): any {
  // 1. الفحص المباشر في كائن i18n البرمجي
  if ((i18n as any)?.Messages) return (i18n as any).Messages;
  if ((i18n as any)?.default?.Messages) return (i18n as any).default.Messages;

  // 2. البحث عن مفاتيح ترجمة شائعة ومضمونة في ديسكورد بشكل فردي
  const targetKeys = ["ACCOUNT", "SETTINGS", "BILLING_PAYMENTS", "MESSAGES"];
  
  for (const key of targetKeys) {
    try {
      const mod: any = findByProps(key);
      if (!mod) continue;

      if (mod.Messages) return mod.Messages;
      if (mod.default?.Messages) return mod.default.Messages;
      if (mod[key]) return mod;
    } catch (e) {}
  }

  // 3. فحص شامل لوحدات Metro المحملة في الذاكرة
  try {
    const modules = (metro as any).modules || (window as any).__r?.modules || {};
    for (const id in modules) {
      const exp = modules[id]?.publicModule?.exports;
      if (!exp) continue;

      if (exp.Messages && typeof exp.Messages === "object") return exp.Messages;
      if (exp.default?.Messages && typeof exp.default.Messages === "object") return exp.default.Messages;
      if (exp.ACCOUNT && exp.SETTINGS) return exp;
    }
  } catch (e) {}

  return null;
}

function applyTranslations(): number {
  const targetMessages = findMessagesObject();

  if (!targetMessages) {
    return 0;
  }

  let count = 0;

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
    
