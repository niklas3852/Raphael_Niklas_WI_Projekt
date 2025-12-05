# GetLecturers200ResponseInner

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

## Example

```typescript
import type { GetLecturers200ResponseInner } from ''

// TODO: Update the object below with actual values
const example = {
  "id": 35,
  "title": Dipl.Ing.,
  "firstname": Michael,
  "lastname": Brandt,
  "gender": M,
  "salutationShort": Herr,
  "salutationFull": Sehr geehrter Herr Brandt,
  "roleNow": DOZ,
  "personnelId": 5,
} satisfies GetLecturers200ResponseInner

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GetLecturers200ResponseInner
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
