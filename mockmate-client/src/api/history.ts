import { fetchWithAuth } from "./fetchWithAuth";

export const getInterviewHistory = async () => {
  const res = await fetchWithAuth("/interview/history", {
    method: "GET",
  });

  return res.json();
};