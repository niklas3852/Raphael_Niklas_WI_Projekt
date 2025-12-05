# GetModuleUnits200ResponseInner

## Properties

| Name         | Type   |
| ------------ | ------ |
| `moduleNr`   | string |
| `unitNr`     | string |
| `unitName`   | string |
| `units`      | number |
| `moduleName` | string |
| `credits`    | number |

## Example

```typescript
import type { GetModuleUnits200ResponseInner } from ''

// TODO: Update the object below with actual values
const example = {
  "moduleNr": W3WI_109,
  "unitNr": W3WI_109.2,
  "unitName": Algorithmen und Datenstrukturen,
  "units": 30,
  "moduleName": Programmierung II,
  "credits": 5,
} satisfies GetModuleUnits200ResponseInner

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GetModuleUnits200ResponseInner
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
