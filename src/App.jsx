import { useState } from "react"
import { Sheet } from "./Sheet"

const initialData = [];

for (let row = 0; row < 1000; row++) {
  const rowData = [];
  for (let col = 0; col < 1000; col++) {
    rowData.push(`${col + 1}`);
  }
  initialData.push(rowData);
}


export const App = () => {
  const [displayData, setDisplayData] = useState(initialData)

  const onChange = (changes) => {
    const newData = [...displayData];

    for (let change of changes) {
      if (!newData[change.y]) {
        newData[change.y] = [];
      }

      newData[change.y][change.x] = change.value;
    }
    setDisplayData(newData);
  }

  return (
    <Sheet displayData={displayData} onChange={onChange} />
  )
}
