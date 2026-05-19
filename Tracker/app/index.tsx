import { CheckboxFieldView } from "@/components/CheckboxField";
import { Meter } from "@/components/Meter";
import { NumberFieldView } from "@/components/NumberField";
import { CheckboxField, NumberField } from "@/Types/field";
import { Text, View } from "react-native";

export default function Index() {
  const test = {
  id: "1",
  label: "Words",
  weight: 1,
  type: "checkbox",
  checked: true
  } satisfies CheckboxField

  const test2 = {
  id: "2",
  label: "Words2",
  weight: 1,
  type: "number",
  value: 2
  } satisfies NumberField

  
  return (
    
    <View>
      <View style={{ alignItems: "center", marginTop: 40 }}>
        <Meter
          label="Total Progress"
          maxValue={500}
          value={250}
          formatOptions={{style: "percent"}} />
      </View>
      <CheckboxFieldView field={test} />
      <NumberFieldView field={test2} />

      
    </View>
  );
}
