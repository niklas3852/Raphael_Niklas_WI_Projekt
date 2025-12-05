# GetCourses200ResponseInner

## Properties

| Name         | Type   |
| ------------ | ------ |
| `courseNr`   | string |
| `yearName`   | string |
| `studyfield` | string |

## Example

```typescript
import type { GetCourses200ResponseInner } from ''

// TODO: Update the object below with actual values
const example = {
  "courseNr": HN-WWI22A1,
  "yearName": Jahrgang 2022,
  "studyfield": Business Engineering,
} satisfies GetCourses200ResponseInner

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GetCourses200ResponseInner
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
