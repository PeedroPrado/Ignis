import { Polygon } from "leaflet";
export class Risco {
    id: number;
    data: Date;
    geometria: Polygon; // geometry(point, 4326)
    estado_id: number;
    bioma_id: number;
    risco_fogo: number; 
  
    constructor(id: number, data: Date, geometria: Polygon, estado_id: number, bioma_id: number, risco_fogo: number) {
      this.id = id;
      this.data = data;
      this.geometria = geometria;
      this.estado_id = estado_id;
      this.bioma_id = bioma_id;
      this.risco_fogo = risco_fogo;
    }
  }
  
