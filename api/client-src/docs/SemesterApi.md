# SemesterApi

All URIs are relative to *http://10.150.16.51/wi/api/v1*

| Method                                        | HTTP request      | Description          |
| --------------------------------------------- | ----------------- | -------------------- |
| [**getSemester**](SemesterApi.md#getsemester) | **GET** /semester | Liste aller semester |

## getSemester

> Array&lt;GetSemester200ResponseInner&gt; getSemester()

Liste aller semester

### Example

```ts
import { Configuration, SemesterApi } from "";
import type { GetSemesterRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new SemesterApi(config);

  try {
    const data = await api.getSemester();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

This endpoint does not need any parameter.

### Return type

[**Array&lt;GetSemester200ResponseInner&gt;**](GetSemester200ResponseInner.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description   | Response headers |
| ----------- | ------------- | ---------------- |
| **200**     | Semesterdaten | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
