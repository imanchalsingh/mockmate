const BASE_URL = "http://localhost:5000/api";

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
) => {
  const token = localStorage.getItem("token");

  return fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });
};