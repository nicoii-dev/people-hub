const rawApiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api/v1";
const rawUseMock = process.env.NEXT_PUBLIC_USE_MOCK_DATA ?? "true";

export const env = {
  apiUrl: rawApiUrl.replace(/\/$/, ""),
  useMockData: rawUseMock !== "false",
  storagePrefix: "people-hub:mock:v1",
} as const;
