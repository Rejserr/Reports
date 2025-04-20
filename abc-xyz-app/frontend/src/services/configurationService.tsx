import api from './api';

export interface Configuration {
  config_id: number;
  config_name: string;
  description?: string;
  abc_a_threshold: number;
  abc_b_threshold: number;
  xyz_x_threshold: number;
  xyz_y_threshold: number;
  lead_time_weeks: number;
  safety_stock_x_factor: number;
  safety_stock_y_factor: number;
  safety_stock_z_factor: number;
  max_qty_a_factor: number;
  max_qty_b_factor: number;
  max_qty_c_factor: number;
  is_default: boolean;
  created_by?: string;
  created_date: string;
  modified_by?: string;
  modified_date?: string;
}

export const getConfigurations = async (): Promise<Configuration[]> => {
  const response = await api.get('/configurations');
  return response.data;
};

export const getConfigurationById = async (id: number): Promise<Configuration> => {
  const response = await api.get(`/configurations/${id}`);
  return response.data;
};

export const getDefaultConfiguration = async (): Promise<Configuration> => {
  const response = await api.get('/configurations/default');
  return response.data;
};

export const createConfiguration = async (configuration: any): Promise<Configuration> => {
  const response = await api.post('/configurations', configuration);
  return response.data;
};

export const updateConfiguration = async (id: number, configuration: any): Promise<Configuration> => {
  const response = await api.put(`/configurations/${id}`, configuration);
  return response.data;
};

export interface ConfigurationCreate {
  config_name: string;
  description?: string;
  abc_a_threshold: number;
  abc_b_threshold: number;
  xyz_x_threshold: number;
  xyz_y_threshold: number;
  lead_time_weeks: number;
  safety_stock_x_factor: number;
  safety_stock_y_factor: number;
  safety_stock_z_factor: number;
  max_qty_a_factor: number;
  max_qty_b_factor: number;
  max_qty_c_factor: number;
  is_default: boolean;
}

export interface ConfigurationUpdate {
  config_name?: string;
  description?: string;
  abc_a_threshold?: number;
  abc_b_threshold?: number;
  xyz_x_threshold?: number;
  xyz_y_threshold?: number;
  lead_time_weeks?: number;
  safety_stock_x_factor?: number;
  safety_stock_y_factor?: number;
  safety_stock_z_factor?: number;
  max_qty_a_factor?: number;
  max_qty_b_factor?: number;
  max_qty_c_factor?: number;
  is_default?: boolean;
}

export const deleteConfiguration = async (id: number): Promise<void> => {
  await api.delete(`/configurations/${id}`);
};