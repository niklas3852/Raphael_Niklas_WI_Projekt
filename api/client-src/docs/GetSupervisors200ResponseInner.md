# GetSupervisors200ResponseInner

## Properties

| Name          | Type   |
| ------------- | ------ |
| `personnelId` | number |
| `name`        | string |
| `title`       | string |
| `firstname`   | string |
| `lastname`    | string |
| `max`         | number |
| `randomSel`   | number |
| `comment`     | string |
| `unitId`      | number |
| `cMatch`      | number |

## Example

```typescript
import type { GetSupervisors200ResponseInner } from ''

// TODO: Update the object below with actual values
const example = {
  "personnelId": 39,
  "name": Timo, Frank,
  "title": Dr.,
  "firstname": Timo,
  "lastname": Frank,
  "max": 5,
  "randomSel": 1,
  "comment": ja bitte,
  "unitId": 5,
  "cMatch": 1,
} satisfies GetSupervisors200ResponseInner

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GetSupervisors200ResponseInner
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
