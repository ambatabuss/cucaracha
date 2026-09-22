import { React, ReactNative as RN } from "@vendetta/metro/common";
import { storage } from "@vendetta/plugin";
import { findByProps } from "@vendetta/metro";
import { showToast } from "@vendetta/ui/toasts";
import { useProxy } from "@vendetta/storage";
import { getAssetIDByName } from "@vendetta/ui/assets";

const { ScrollView } = findByProps("ScrollView");
const { TableRowGroup, TableSwitchRow, TableRow, Stack, TextInput } = findByProps(
  "TableSwitchRow",
  "TableRowGroup",
  "Stack",
  "TableRow",
  "TextInput"
);
const { Text } = findByProps("Text", "View");

export default function Settings() {
  useProxy(storage);
  const [, forceUpdate] = React.useReducer((x) => x + 1, 0);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 10 }}>
      <Stack spacing={8}>
        
        <TableRowGroup title="إعدادات التعريب العامة">
          <TableSwitchRow
            label="تفعيل التعريب"
            subLabel="تحويل واجهة ديسكورد إلى اللغة العربية"
            value={storage.enableArabic}
            onValueChange={(v: boolean) => {
              storage.enableArabic = v;
              forceUpdate();
              showToast("يرجى إعادة تشغيل التطبيق لتطبيق التغييرات الكاملة", getAssetIDByName("Warning"));
            }}
          />
          <TableSwitchRow
            label="دعم اتجاه الواجهة (RTL)"
            subLabel="تنسيق العناصر والواجهة من اليمين إلى اليسار"
            value={storage.enableRTL}
            onValueChange={(v: boolean) => {
              storage.enableRTL = v;
              forceUpdate();
              showToast("تتطلب تغييرات الاتجاه إعادة تشغيل التطبيق", getAssetIDByName("Warning"));
            }}
          />
        </TableRowGroup>

        <TableRowGroup title="معلومات الإضافة">
          <TableRow
            label="الحالة"
            subLabel={storage.enableArabic ? "مفعلة يعمل التعريب حالياً" : "معطلة"}
          />
        </TableRowGroup>

      </Stack>
    </ScrollView>
  );
}
