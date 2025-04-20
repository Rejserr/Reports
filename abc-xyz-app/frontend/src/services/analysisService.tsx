import api from './api';

export interface AnalysisRequest {
  analysis_name: string;
  config_id: number;
  start_date?: string;
  end_date?: string;
  warehouse_zones?: string[];
  item_codes?: string[];
}

export interface AnalysisResult {
  result_id: number;
  analysis_name: string;
  analysis_date: string;
  config_id: number;
  total_items: number;
  a_items: number;
  b_items: number;
  c_items: number;
  x_items: number;
  y_items: number;
  z_items: number;
}

export interface AnalysisSummary {
  result_id: number;
  analysis_name: string;
  analysis_date: string;
  total_items: number;
  abc_distribution: {
    A: number;
    B: number;
    C: number;
  };
  xyz_distribution: {
    X: number;
    Y: number;
    Z: number;
  };
}

export interface ResultDetail {
  detail_id: number;
  result_id: number;
  item_code: string;
  item_name: string;
  warehouse_zone: string;
  abc_class: string;
  xyz_class: string;
  total_turnover: number;
  total_quantity: number;
  percentage_of_turnover: number;
  cumulative_percentage: number;
  coefficient_variation: number;
  avg_monthly_qty: number;
  min_qty_monthly: number;
  max_qty_monthly: number;
  rank: number;
}

export const runAnalysis = async (request: AnalysisRequest) => {
  const response = await api.post('/analysis/run', request);
  return response.data;
};

export const getAnalyses = async () => {
  const response = await api.get('/analysis');
  return response.data;
};

export const getAnalysisById = async (id: number) => {
  const response = await api.get(`/analysis/${id}`);
  return response.data;
};

export const getAnalysisDetails = async (
  id: number, 
  abcClass?: 'A' | 'B' | 'C', 
  xyzClass?: 'X' | 'Y' | 'Z',
  skip: number = 0,
  limit: number = 100
) => {
  let url = `/analysis/${id}/details?skip=${skip}&limit=${limit}`;
  
  if (abcClass) {
    url += `&abc_class=${abcClass}`;
  }
  
  if (xyzClass) {
    url += `&xyz_class=${xyzClass}`;
  }
  
  const response = await api.get(url);
  return response.data;
};

export const deleteAnalysis = async (id: number) => {
  const response = await api.delete(`/analysis/${id}`);
  return response.data;
};

// Dodaj ovu funkciju u analysisService.tsx
export const runABCXYZScript = async (params: any) => {
  const response = await api.post('/analysis/run-script', params);
  return response.data;
};
// Dodaj ovu funkciju u analysisService.tsx
export const getAnalysesByDateRange = async (startDate: string, endDate: string) => {
  const response = await api.get(`/analysis?start_date=${startDate}&end_date=${endDate}`);
  return response.data;
};