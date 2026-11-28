import {
  clearAuth,
  setStoredCompanyId,
  setTokens,
  type AuthTokens,
} from "../auth-store";
import {
  ApiRequestError,
  apiClient,
  apiDownload,
  apiRequest,
  buildQuery,
} from "../client";

const API_URL = "http://localhost:3001/api/v1";

const tokens: AuthTokens = {
  accessToken: "access-1",
  refreshToken: "refresh-1",
  sessionId: "session-1",
  tokenType: "Bearer",
  accessTokenExpiresIn: "15m",
};

const refreshedTokens: AuthTokens = {
  accessToken: "access-2",
  refreshToken: "refresh-2",
  sessionId: "session-1",
  tokenType: "Bearer",
  accessTokenExpiresIn: "15m",
};

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(body),
  } as unknown as Response;
}

function fetchMock(): jest.Mock {
  return global.fetch as unknown as jest.Mock;
}

describe("api client", () => {
  beforeEach(() => {
    clearAuth();
    setTokens(tokens);
    setStoredCompanyId("company-1");
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    clearAuth();
  });

  it("maps frontend query params to the API's PaginationDto names", () => {
    expect(
      buildQuery({
        page: 2,
        limit: 25,
        sort: "lastName",
        order: "desc",
        search: "",
        departmentId: undefined,
      }),
    ).toBe("?page=2&limit=25&sortBy=lastName&sortOrder=desc");
  });

  it("sends auth and tenant headers and normalizes paginated responses", async () => {
    const meta = { page: 1, limit: 10, total: 1, totalPages: 1 };
    fetchMock().mockResolvedValueOnce(
      jsonResponse(200, {
        success: true,
        message: "Employees",
        data: [{ id: "EMP-001" }],
        meta,
      }),
    );

    const result = await apiClient.get("/companies/company-1/employees", {
      page: 1,
      limit: 10,
    });

    expect(fetchMock()).toHaveBeenCalledWith(
      `${API_URL}/companies/company-1/employees?page=1&limit=10`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: "Bearer access-1",
          "X-Company-Id": "company-1",
        }),
      }),
    );
    expect(result).toEqual({
      success: true,
      message: "Employees",
      data: { items: [{ id: "EMP-001" }], meta },
      meta,
    });
  });

  it("downloads CSV with auth, tenant headers and the server filename", async () => {
    fetchMock().mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: jest.fn().mockResolvedValue("section,name\nSummary,Clients\n"),
      headers: {
        get: (name: string) =>
          name === "content-disposition"
            ? 'attachment; filename="project-report-2026-11-27.csv"'
            : null,
      },
    } as unknown as Response);

    const result = await apiDownload(
      "/companies/company-1/reports/project-summary/export",
      { from: "2026-11-01", billable: "false" },
    );

    expect(fetchMock()).toHaveBeenCalledWith(
      `${API_URL}/companies/company-1/reports/project-summary/export?from=2026-11-01&billable=false`,
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: "text/csv",
          Authorization: "Bearer access-1",
          "X-Company-Id": "company-1",
        }),
      }),
    );
    expect(result).toEqual({
      content: "section,name\nSummary,Clients\n",
      fileName: "project-report-2026-11-27.csv",
    });
  });

  it("converts API field errors into the frontend error shape", async () => {
    fetchMock().mockResolvedValueOnce(
      jsonResponse(400, {
        success: false,
        message: "Validation failed",
        errors: [
          { field: "email", message: "must be an email" },
          { field: "email", message: "must be unique" },
        ],
      }),
    );

    await expect(apiRequest("/auth/login")).rejects.toMatchObject({
      name: "ApiRequestError",
      status: 400,
      response: {
        success: false,
        message: "Validation failed",
        errors: { email: ["must be an email", "must be unique"] },
      },
    });
  });

  it("refreshes an expired token once and retries the original request", async () => {
    fetchMock()
      .mockResolvedValueOnce(
        jsonResponse(401, { success: false, message: "Unauthorized" }),
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          success: true,
          message: "Tokens refreshed",
          data: refreshedTokens,
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(200, {
          success: true,
          message: "Employees",
          data: [],
        }),
      );

    const result = await apiRequest("/companies/company-1/employees");

    expect(fetchMock()).toHaveBeenCalledTimes(3);
    expect(fetchMock().mock.calls[1][0]).toBe(`${API_URL}/auth/refresh`);
    expect(fetchMock().mock.calls[2][1].headers.Authorization).toBe(
      "Bearer access-2",
    );
    expect(result.data).toEqual([]);
  });

  it("does not send auth headers when signed out", async () => {
    clearAuth();
    fetchMock().mockResolvedValueOnce(
      jsonResponse(200, { success: true, message: "OK", data: null }),
    );

    await apiRequest("/health");

    const headers = fetchMock().mock.calls[0][1].headers;
    expect(headers.Authorization).toBeUndefined();
    expect(headers["X-Company-Id"]).toBeUndefined();
  });

  it("surfaces a missing backend response as ApiRequestError", async () => {
    fetchMock().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockRejectedValue(new SyntaxError("not json")),
    });

    await expect(apiRequest("/health")).rejects.toBeInstanceOf(ApiRequestError);
  });
});
