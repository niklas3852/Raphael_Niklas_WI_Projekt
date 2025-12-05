# GetModuleLecturers200ResponseInner

## Properties

| Name           | Type   |
| -------------- | ------ |
| `firstname`    | string |
| `lastname`     | string |
| `moduleNr`     | string |
| `unitName`     | string |
| `unitNr`       | string |
| `semestername` | string |
| `courseNr`     | string |

## Example

```typescript
import type { GetModuleLecturers200ResponseInner } from ''

// TODO: Update the object below with actual values
const example = {
  "firstname": Oliver,
  "lastname": Kaiser,
  "moduleNr": W3WI_108,
  "unitName": Einführung in die Programmierung,
  "unitNr": W3WI_108.1,
  "semestername": WiSe 2021/22,
  "courseNr": HN-WWI23A1,
} satisfies GetModuleLecturers200ResponseInner

console.log(example)

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example)
console.log(exampleJSON)

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(exampleJSON) as GetModuleLecturers200ResponseInner
console.log(exampleParsed)
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
