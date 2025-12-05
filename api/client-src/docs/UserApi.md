# UserApi

All URIs are relative to *http://10.150.16.51/wi/api/v1*

| Method                                          | HTTP request                                 | Description                              |
| ----------------------------------------------- | -------------------------------------------- | ---------------------------------------- |
| [**getLecturers**](UserApi.md#getlecturers)     | **GET** /lecturers                           | Liste aller dozenten                     |
| [**getSupervisors**](UserApi.md#getsupervisors) | **GET** /supervisors/{academicYear}/{unitId} | Betreuer für jahr und einheit            |
| [**getUser**](UserApi.md#getuser)               | **GET** /user                                | Informationen des angemeldeten benutzers |

## getLecturers

> Array&lt;GetLecturers200ResponseInner&gt; getLecturers()

Liste aller dozenten

### Example

```ts
import { Configuration, UserApi } from "";
import type { GetLecturersRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new UserApi(config);

  try {
    const data = await api.getLecturers();
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

[**Array&lt;GetLecturers200ResponseInner&gt;**](GetLecturers200ResponseInner.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description        | Response headers |
| ----------- | ------------------ | ---------------- |
| **200**     | Array von Dozenten | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getSupervisors

> Array&lt;GetSupervisors200ResponseInner&gt; getSupervisors(academicYear, unitId)

Betreuer für jahr und einheit

### Example

```ts
import { Configuration, UserApi } from "";
import type { GetSupervisorsRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new UserApi(config);

  const body = {
    // number
    academicYear: 56,
    // number
    unitId: 56,
  } satisfies GetSupervisorsRequest;

  try {
    const data = await api.getSupervisors(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name             | Type     | Description | Notes                     |
| ---------------- | -------- | ----------- | ------------------------- |
| **academicYear** | `number` |             | [Defaults to `undefined`] |
| **unitId**       | `number` |             | [Defaults to `undefined`] |

### Return type

[**Array&lt;GetSupervisors200ResponseInner&gt;**](GetSupervisors200ResponseInner.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description         | Response headers |
| ----------- | ------------------- | ---------------- |
| **200**     | Liste von Betreuern | -                |
| **405**     | Fehlende Parameter  | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getUser

> GetUser200Response getUser()

Informationen des angemeldeten benutzers

### Example

```ts
import { Configuration, UserApi } from "";
import type { GetUserRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new UserApi(config);

  try {
    const data = await api.getUser();
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

[**GetUser200Response**](GetUser200Response.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description           | Response headers |
| ----------- | --------------------- | ---------------- |
| **200**     | Benutzerinformationen | -                |
| **401**     | Ungültiger Schlüssel  | -                |
| **405**     | Methode nicht erlaubt | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
