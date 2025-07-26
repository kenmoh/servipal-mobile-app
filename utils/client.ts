import authStorage from "@/storage/authStorage";
import { create } from "apisauce";

export const apiClient = create({
  baseURL: "https://api.servi-pal.com/api",
});

apiClient.addAsyncRequestTransform(async (request) => {
  const authToken = await authStorage.getToken();
  if (!authToken) return;
  request.headers!["Authorization"] = "Bearer " + authToken;
});

export const mapboxClient = create({
  baseURL: "https://api.mapbox.com",
});
