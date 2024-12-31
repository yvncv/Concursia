export interface Ubigeo {
    departamento: string;
    provincia: string;
    distrito: string;
    nombre: string;
  }
  
  /**
   * Función para obtener los datos de ubigeo desde el CDN.
   */
  export const fetchUbigeoINEI = async (): Promise<Ubigeo[]> => {
    const url = 'https://cdn.jsdelivr.net/npm/ubigeo-peru@2.0.2/src/ubigeo-reniec.json';
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error al obtener los datos: ${response.statusText}`);
      }
      const data: Ubigeo[] = await response.json();
      return data;
    } catch (error) {
      console.error('Error al obtener los datos de Ubigeo:', error);
      throw error;
    }
  };