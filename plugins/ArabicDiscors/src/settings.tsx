import { React, ReactNative as RN } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import { useProxy } from "@vendetta/storage";
import { showToast } from "@vendetta/ui/toasts";
import { getAssetIDByName } from "@vendetta/ui/assets";

// findByProps قد يرجع undefined إذا لم توجد الوحدة (خصوصاً إن كانت
// الخصائص المطلوبة موزعة على وحدات مختلفة)، لذا نستخدم غلافاً آمناً
// يمنع انهيار الشاشة بالكامل ويرجع كائناً فارغاً بدلاً من ذلك
function safeFindByProps(...props: string[]): any {
  try {
    return findByProps(...props) ?? {};
  } catch (e) {
    console.error("[Arabic Discord] findByProps error:", e);
    return {};
  }
}

const { ScrollView } = safeFindByProps("ScrollView");
const { TableRowGroup, TableSwitchRow, TableRow } = safeFindByProps(
  "TableSwitchRow",
  "TableRowGroup",
  "TableRow"
);
const { Stack } = safeFindByProps("Stack");

export default function Settings() {
  // useProxy يجعل المكوّن يعيد الرسم تلقائياً عند تغيّر أي قيمة في storage،
  // لذا لا حاجة لـ useReducer/forceUpdate يدوياً بجانبه
  useProxy(storage);

  // واجهة احتياطية في حال تعذّر تحميل عناصر واجهة ديسكورد الأساسية
  if (!ScrollView || !TableRowGroup || !TableSwitchRow || !TableRow) {
    return (
      <RN.View style={{ flex: 1, padding: 16 }}>
        <RN.Text style={{ color: "#ED4245", fontSize: 14 }}>
          تعذر تحميل عناصر واجهة الإعدادات. جرّب إعادة تشغيل التطبيق، وإذا
          استمرت المشكلة فقد يكون ديسكورد قد غيّر أسماء الوحدات الداخلية.
        </RN.Text>
      </RN.View>
    );
  }

  const Wrap = Stack ?? RN.View;
  const wrapProps = Stack ? { spacing: 8 } : { style: { gap: 8 } };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <Wrap {...wrapProps}>
        <TableRowGroup title="إعدادات التعريب العامة">
          <TableSwitchRow
            label="تفعيل التعريب"
            subLabel="تحويل واجهة ديسكورد إلى اللغة العربية"
            value={!!storage.enableArabic}
            onValueChange={(v: boolean) => {
              storage.enableArabic = v;
              showToast(
                "يرجى إعادة تشغيل التطبيق لتطبيق التغييرات الكاملة",
                getAssetIDByName("Warning")
              );
            }}
          />
          <TableSwitchRow
            label="دعم اتجاه الواجهة (RTL)"
            subLabel="تنسيق العناصر والواجهة من اليمين إلى اليسار"
            value={!!storage.enableRTL}
            onValueChange={(v: boolean) => {
              storage.enableRTL = v;
              showToast(
                "تتطلب تغييرات الاتجاه إعادة تشغيل التطبيق",
                getAssetIDByName("Warning")
              );
            }}
          />
        </TableRowGroup>

        <TableRowGroup title="أدوات التطوير">
          <TableSwitchRow
            label="وضع التصحيح (Debug)"
            subLabel="تسجيل المفاتيح غير المترجمة في الـ console لمساعدتك على إضافتها"
            value={!!storage.debugMode}
            onValueChange={(v: boolean) => {
              storage.debugMode = v;
            }}
          />
        </TableRowGroup>

        <TableRowGroup title="معلومات الإضافة">
          <TableRow
            label="الحالة"
            subLabel={storage.enableArabic ? "مفعّلة، التعريب يعمل حالياً" : "معطّلة"}
          />
          <TableRow
            label="ملاحظة"
            subLabel="بعض النصوص لا تتغير فوراً وتحتاج إعادة تشغيل كاملة للتطبيق"
          />
        </TableRowGroup>
      </Wrap>
    </ScrollView>
  );
            }
