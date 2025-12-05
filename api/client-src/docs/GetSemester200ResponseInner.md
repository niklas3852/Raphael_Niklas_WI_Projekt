# GetSemester200ResponseInner

## Properties

| Name        | Type   |
| ----------- | ------ |
| `name`      | string |
| `nameShort` | string |
| `startDate` | Date   |
| `endDate`   | Date   |
| `cycle`     | string |
| `type`      | string |

## Example

```typescript
import type { GetSemester200ResponseInner } from ''

// TODO: Update the object below with actual values
const example = {
  "name": Sommersemester 2022,
  "nameShort": SoSe 2022,
  "startDate": Mon Mar 28 02:00:00 CEST 2022,
  "endDate": Sun Jun 19 02:00:00 CEST 2022,
  "cycle": A,
  "type": Theorie,
} satisfies GetSemester200ResponseInner

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GetSemester200ResponseInner
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
