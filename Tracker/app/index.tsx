import { CheckboxFieldView } from "@/components/CheckboxField";
import { Meter } from "@/components/Meter";
import { ProgressNumber } from "@/components/NumberField";
import { CheckboxField, NumberField, Tracker } from "@/Types/field";
import {TrackerView } from "@/renderer/TrackerRenderer"
import { Text, View } from "react-native";


const dummyTracker: Tracker = {
  id: "1",
  title: "Hollow Knight 112%",
  sections: [
    {
      id: "s1",
      title: "Bosses",
      fields: [
        { id: "f1", label: "Mantis Lords", type: "checkbox", checked: false, weight: 1 },
        { id: "f2", label: "Hornet", type: "checkbox", checked: false, weight: 1 },
      ]
    },
    {
      id: "s2",
      title: "Collectibles",
      fields: [
        { id: "f3", label: "Grubs", type: "number", value: 0, max: 46, weight: 1 },
      ]
    }
  ]
}


export default function Index() {
    return <TrackerView tracker={dummyTracker} />
}
