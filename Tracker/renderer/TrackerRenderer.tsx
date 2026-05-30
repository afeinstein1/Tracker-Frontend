import { Tracker } from "@/Types/field"
import { TrackerSectionView } from "./SectionRenderer"


type Props = {
    tracker: Tracker
}

export function TrackerView({tracker}: Props) {
    return(
        <div>
            <h1>{tracker.title}</h1>
                {tracker.sections.map(section => (
                <TrackerSectionView key={section.id} section={section} />
                ))}

        </div>
    )
}