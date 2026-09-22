import { storage } from "@vendetta/plugin";
import { after } from "@vendetta/patcher";
import { findByProps } from "@vendetta/metro";
import { ReactNative as RN, i18n } from "@vendetta/metro/common";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";
import { arabicTranslations } from "./translations";

type Unpatch = () => void;

const patches: Unpatch[] = [];
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

function safeFindByProps(...props: string[]) {
  for (const prop of props) {
    try {
      const result = findByProps(prop);
      if (result) return result;
    } catch (e) {
      console.warn(`[Arabic Discord] findByProps(${prop}) failed:`, e);
    }
  }

  return null;
}

export const onLoad = () => {
  try {
    if (storage.enableArabic === undefined) storage.enableArabic = true;
    if (storage.enableRTL === undefined) storage.enableRTL = true;
    if (storage.debugMode === undefined) storage.debugMode = false;

    // Prevent duplicate hooks when the plugin is reloaded without a full process restart.
    safeUnpatchAll();

    const success = storage.enableArabic ? patchTranslations() : false;

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

  // Use the imported module only when it actually looks like an i18n module.
  // Otherwise, continue searching instead of letting a truthy but unrelated i18n
  // export prevent the fallbacks from running.
  const importedI18n: any = i18n;
  const targetModule: any =
    importedI18n &&
    (importedI18n.Messages ||
      typeof importedI18n.getMessage === "function" ||
      typeof importedI18n.getParsedMessage === "function" ||
      typeof importedI18n.get === "function")
      ? importedI18n
      : safeFindByProps("getMessage", "getParsedMessage", "getLocale", "Messages");

  if (!targetModule) return false;

  if (targetModule.Messages) {
    for (const key of Object.keys(arabicTranslations)) {
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
        } catch {
          // Ignore an individual read-only translation key.
        }
      }
    }
  }

  // getParsedMessage may return a structured value, so only replace methods
  // that are expected to return the message string itself.
  for (const methodName of ["getMessage", "get"]) {
    if (typeof targetModule[methodName] !== "function") continue;

    try {
      const unpatch = after(methodName, targetModule, (args: any[], res: any) => {
        const key = args?.[0];

        if (typeof key === "string") {
          if (Object.prototype.hasOwnProperty.call(arabicTranslations, key)) {
            return arabicTranslations[key];
          }

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
  safeUnpatchAll();

  try {
    if (RN?.I18nManager) {
      RN.I18nManager.forceRTL(false);
      RN.I18nManager.allowRTL(false);
    }
  } catch (e) {
    console.error("[Arabic Discord] RTL Reset Error:", e);
  }

  try {
    showToast("تم إيقاف الإضافة", getAssetIDByName("Small"));
  } catch {
    // Toasts may be unavailable while the plugin host is shutting down.
  }
};

export { default as settings } from "./settings";
