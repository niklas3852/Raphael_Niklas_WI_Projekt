# LecturesApi

All URIs are relative to *http://10.150.16.51/wi/api/v1*

| Method                                                            | HTTP request                               | Description                    |
| ----------------------------------------------------------------- | ------------------------------------------ | ------------------------------ |
| [**getCourses**](LecturesApi.md#getcourses)                       | **GET** /courses/{date}                    | Liste der kurse zu einem datum |
| [**getModuleLecturers**](LecturesApi.md#getmodulelecturers)       | **GET** /module_lecturer                   | Dozenten zu moduleinheiten     |
| [**getModuleUnits**](LecturesApi.md#getmoduleunits)               | **GET** /module_units                      | Liste der moduleinheiten       |
| [**getResearchMathWished**](LecturesApi.md#getresearchmathwished) | **GET** /research-matchwishes/{researchId} | Matchwishes für eine forschung |
| [**getResearches**](LecturesApi.md#getresearches)                 | **GET** /researches/{date}                 | Forschungen ab einem datum     |

## getCourses

> Array&lt;GetCourses200ResponseInner&gt; getCourses(date)

Liste der kurse zu einem datum

### Example

```ts
import { Configuration, LecturesApi } from "";
import type { GetCoursesRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new LecturesApi(config);

  const body = {
    // Date
    date: 2013 - 10 - 20,
  } satisfies GetCoursesRequest;

  try {
    const data = await api.getCourses(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name     | Type   | Description | Notes                     |
| -------- | ------ | ----------- | ------------------------- |
| **date** | `Date` |             | [Defaults to `undefined`] |

### Return type

[**Array&lt;GetCourses200ResponseInner&gt;**](GetCourses200ResponseInner.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description             | Response headers |
| ----------- | ----------------------- | ---------------- |
| **200**     | Kursdaten               | -                |
| **405**     | Ungültiges Datumsformat | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getModuleLecturers

> Array&lt;GetModuleLecturers200ResponseInner&gt; getModuleLecturers()

Dozenten zu moduleinheiten

### Example

```ts
import { Configuration, LecturesApi } from "";
import type { GetModuleLecturersRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new LecturesApi(config);

  try {
    const data = await api.getModuleLecturers();
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

[**Array&lt;GetModuleLecturers200ResponseInner&gt;**](GetModuleLecturers200ResponseInner.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description     | Response headers |
| ----------- | --------------- | ---------------- |
| **200**     | Module Dozenten | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getModuleUnits

> Array&lt;GetModuleUnits200ResponseInner&gt; getModuleUnits()

Liste der moduleinheiten

### Example

```ts
import { Configuration, LecturesApi } from "";
import type { GetModuleUnitsRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new LecturesApi(config);

  try {
    const data = await api.getModuleUnits();
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

[**Array&lt;GetModuleUnits200ResponseInner&gt;**](GetModuleUnits200ResponseInner.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description    | Response headers |
| ----------- | -------------- | ---------------- |
| **200**     | Moduleinheiten | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getResearchMathWished

> Array&lt;GetResearchMathWished200ResponseInner&gt; getResearchMathWished(researchId)

Matchwishes für eine forschung

### Example

```ts
import { Configuration, LecturesApi } from "";
import type { GetResearchMathWishedRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new LecturesApi(config);

  const body = {
    // number
    researchId: 56,
  } satisfies GetResearchMathWishedRequest;

  try {
    const data = await api.getResearchMathWished(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name           | Type     | Description | Notes                     |
| -------------- | -------- | ----------- | ------------------------- |
| **researchId** | `number` |             | [Defaults to `undefined`] |

### Return type

[**Array&lt;GetResearchMathWished200ResponseInner&gt;**](GetResearchMathWished200ResponseInner.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description           | Response headers |
| ----------- | --------------------- | ---------------- |
| **200**     | Liste der Matchwishes | -                |
| **405**     | Fehlende ResearchId   | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)

## getResearches

> Array&lt;GetResearches200ResponseInner&gt; getResearches(date)

Forschungen ab einem datum

### Example

```ts
import { Configuration, LecturesApi } from "";
import type { GetResearchesRequest } from "";

async function example() {
  console.log("🚀 Testing  SDK...");
  const config = new Configuration({
    // To configure API key authorization: ApiKeyAuth
    apiKey: "YOUR API KEY",
  });
  const api = new LecturesApi(config);

  const body = {
    // Date
    date: 2013 - 10 - 20,
  } satisfies GetResearchesRequest;

  try {
    const data = await api.getResearches(body);
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}

// Run the test
example().catch(console.error);
```

### Parameters

| Name     | Type   | Description | Notes                     |
| -------- | ------ | ----------- | ------------------------- |
| **date** | `Date` |             | [Defaults to `undefined`] |

### Return type

[**Array&lt;GetResearches200ResponseInner&gt;**](GetResearches200ResponseInner.md)

### Authorization

[ApiKeyAuth](../README.md#ApiKeyAuth)

### HTTP request headers

- **Content-Type**: Not defined
- **Accept**: `application/json`

### HTTP response details

| Status code | Description           | Response headers |
| ----------- | --------------------- | ---------------- |
| **200**     | Liste von Forschungen | -                |
| **405**     | Fehlendes Datum       | -                |

[[Back to top]](#) [[Back to API list]](../README.md#api-endpoints) [[Back to Model list]](../README.md#models) [[Back to README]](../README.md)
