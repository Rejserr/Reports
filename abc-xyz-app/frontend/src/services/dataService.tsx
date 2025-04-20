import api from './api';

export const getWarehouseZones = async (): Promise<string[]> => {
  const response = await api.get('/dashboard/warehouse-distribution');
  return response.data.map((item: any) => item.WarehouseZone);
};

export const getItems = async (): Promise<Array<{ ItemCode: string; ItemName: string }>> => {
  const response = await api.get('/dashboard/top-items?limit=1000');
  return response.data;
};

export const getDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};

export const getPickingTrend = async (days: number = 30) => {
  const response = await api.get(`/dashboard/picking-trend?days=${days}`);
  return response.data;
};

export const getTopItems = async (limit: number = 10) => {
  const response = await api.get(`/dashboard/top-items?limit=${limit}`);
  return response.data;
};

export const getWarehouseDistribution = async () => {
  const response = await api.get('/dashboard/warehouse-distribution');
  return response.data;
};

export const getAbcXyzDistribution = async (resultId: number) => {
  const response = await api.get(`/dashboard/abc-xyz-distribution?result_id=${resultId}`);
  return response.data;
};

export const getParetoChart = async (resultId: number) => {
  const response = await api.get(`/dashboard/pareto-chart?result_id=${resultId}`);
  return response.data;
};

export const getMonthlyTrend = async (resultId: number, itemCodes?: string[]) => {
  let url = `/dashboard/monthly-trend?result_id=${resultId}`;
  
  if (itemCodes && itemCodes.length > 0) {
    url += `&item_codes=${itemCodes.join(',')}`;
  }
  
  const response = await api.get(url);
  return response.data;
};