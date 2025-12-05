# GetResearches200ResponseInner

## Properties

| Name              | Type   |
| ----------------- | ------ |
| `researchId`      | number |
| `title`           | string |
| `personnelId`     | number |
| `unitName`        | string |
| `matriNr`         | number |
| `studentPersonId` | number |
| `studentFirst`    | string |
| `studentLast`     | string |
| `courseNr`        | string |
| `problem`         | string |
| `methodology`     | string |
| `goal`            | string |

## Example

```typescript
import type { GetResearches200ResponseInner } from ''

// TODO: Update the object below with actual values
const example = {
  "researchId": 8,
  "title": Robotik im Pflegebereich,
  "personnelId": 7,
  "unitName": PA2,
  "matriNr": 429673,
  "studentPersonId": 8,
  "studentFirst": Paul,
  "studentLast": Seidel,
  "courseNr": HN-WWI24A2,
  "problem": Personalmangel in Pflegeeinrichtungen.,
  "methodology": Experteninterviews,
  "goal": Konzept für robotische Assistenzsysteme entwickeln.,
} satisfies GetResearches200ResponseInner

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GetResearches200ResponseInner
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
