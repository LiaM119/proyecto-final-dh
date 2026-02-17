// src/api/http.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
export const AUTH_TOKEN_KEY = "turmalin:token";

function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

function buildHeaders({ json = true, extraHeaders } = {}) {
  const token = getToken();

  return {
    ...(json ? { "Content-Type": "application/json" } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(extraHeaders || {}),
  };
}

async function parseResponse(res) {
  const contentType = res.headers.get("content-type") || "";

  if (res.status === 204) return null;

  if (contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      return null;
    }
  }

  try {
    return await res.text();
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, options);

  const data = await parseResponse(res);

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && data.message) ||
      (typeof data === "string" && data) ||
      `Error HTTP ${res.status}`;

    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const http = {
  get: (path, { headers } = {}) =>
    request(path, {
      method: "GET",
      headers: buildHeaders({ json: false, extraHeaders: headers }),
    }),

  del: (path, { headers } = {}) =>
    request(path, {
      method: "DELETE",
      headers: buildHeaders({ json: false, extraHeaders: headers }),
    }),

  postJson: (path, body, { headers } = {}) =>
    request(path, {
      method: "POST",
      headers: buildHeaders({ json: true, extraHeaders: headers }),
      body: JSON.stringify(body),
    }),

  putJson: (path, body, { headers } = {}) =>
    request(path, {
      method: "PUT",
      headers: buildHeaders({ json: true, extraHeaders: headers }),
      body: JSON.stringify(body),
    }),

  patchJson: (path, body, { headers } = {}) =>
    request(path, {
      method: "PATCH",
      headers: buildHeaders({ json: true, extraHeaders: headers }),
      body: JSON.stringify(body),
    }),

  postForm: (path, formData, { headers } = {}) =>
    request(path, {
      method: "POST",
      headers: buildHeaders({ json: false, extraHeaders: headers }),
      body: formData,
    }),

  putForm: (path, formData, { headers } = {}) =>
    request(path, {
      method: "PUT",
      headers: buildHeaders({ json: false, extraHeaders: headers }),
      body: formData,
    }),
};

export { request };
