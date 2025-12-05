# GetResearchMathWished200ResponseInner

## Properties

| Name               | Type   |
| ------------------ | ------ |
| `researchId`       | number |
| `matchWishLast`    | string |
| `matchWishFirst`   | string |
| `matchWishId`      | number |
| `personFromId`     | number |
| `personnelWhoId`   | number |
| `priority`         | number |
| `_true`            | number |
| `matchWisherLast`  | string |
| `matchWisherFirst` | string |

## Example

```typescript
import type { GetResearchMathWished200ResponseInner } from "";

// TODO: Update the object below with actual values
const example = {
  researchId: 6,
  matchWishLast: Horn,
  matchWishFirst: Claudia,
  matchWishId: 49,
  personFromId: 29,
  personnelWhoId: 29,
  priority: 5,
  _true: 0,
  matchWisherLast: Kaiser,
  matchWisherFirst: Oliver,
} satisfies GetResearchMathWished200ResponseInner;

console.log(example);

// Convert the instance to a JSON string
const exampleJSON: string = JSON.stringify(example);
console.log(exampleJSON);

// Parse the JSON string back to an object
const exampleParsed = JSON.parse(
  exampleJSON,
) as GetResearchMathWished200ResponseInner;
console.log(exampleParsed);
```

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
