import axios from "axios";

export function fetchNews(params: any) {
  return axios.get("https://hn.algolia.com/api/v1/search", { params });
}

export function fetchDetails(itemId: string) {
  return axios.get(`https://hn.algolia.com/api/v1/items/${itemId}`);
}
