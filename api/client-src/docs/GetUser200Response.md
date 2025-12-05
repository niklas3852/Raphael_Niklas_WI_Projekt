# GetUser200Response

## Properties

| Name              | Type   |
| ----------------- | ------ |
| `id`              | number |
| `title`           | string |
| `firstname`       | string |
| `lastname`        | string |
| `gender`          | string |
| `salutationShort` | string |
| `salutationFull`  | string |
| `roleNow`         | string |
| `personnelId`     | number |
| `matriNr`         | number |
| `courseId`        | number |
| `fieldId`         | number |

## Example

```typescript
import type { GetUser200Response } from ''

// TODO: Update the object below with actual values
const example = {
  "id": 12,
  "title": Dr.,
  "firstname": Carla,
  "lastname": Bauer,
  "gender": F,
  "salutationShort": Frau,
  "salutationFull": Sehr geehrte Frau Bauer,
  "roleNow": MA,
  "personnelId": 12345,
  "matriNr": 46302,
  "courseId": 12,
  "fieldId": 7,
} satisfies GetUser200Response

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GetUser200Response
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
