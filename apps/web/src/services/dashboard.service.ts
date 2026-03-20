import { api } from "./api";

export const getPortfolio = async () => {
    const response = await api.get("/dashboard/portfolio");
    return response.data;
};
