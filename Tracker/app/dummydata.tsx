import { TrackerView } from "@/renderer/TrackerRenderer"
import { Tracker } from "@/Types/field"
import { supabase } from '../lib/supabase'
import { useEffect, useState } from "react"
import { UserResponse } from "@supabase/supabase-js"



const dummyTracker: Tracker = {
  id: "1",
  title: "Hollow Knight 112%",
  tabs: [
    {
      id: "t1",
      title: "Bosses",
      sections: [
        {
          id: "s1",
          title: "Main Bosses",
          fields: [
            { id: "f1", label: "Mantis Lords", type: "checkbox", checked: false, weight: 1 },
            { id: "f2", label: "Hornet", type: "checkbox", checked: false, weight: 2 },
            { id: "f3", label: "Hollow Knight", type: "checkbox", checked: false, weight: 3 },
          ]
        }
      ]
    },
    {
      id: "t2",
      title: "Collectibles",
      sections: [
        {
          id: "s2",
          title: "Grubs",
          fields: [
            { id: "f4", label: "Grubs Rescued", type: "number", value: 0, max: 46, weight: 1 },
          ]
        },
        {
          id: "s3",
          title: "Charms",
          fields: [
            { id: "f5", label: "Wayward Compass", type: "checkbox", checked: false, weight: 1 },
            { id: "f6", label: "Gathering Swarm", type: "checkbox", checked: false, weight: 1 },
          ]
        }
      ]
    }
  ]
}

export default function Index() {
  const [user, setUser] = useState<UserResponse | null >(null)
  useEffect(()=> {
    supabase.auth.getUser().then((data)=>{
      setUser(data)
    })
  })
    return (
      <>
      <h1>{user?.data.user?.id}</h1> 
    <TrackerView tracker={dummyTracker} />
    </>
    )
  }
