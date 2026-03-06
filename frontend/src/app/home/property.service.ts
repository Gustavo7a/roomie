import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable} from 'rxjs';
import {environment} from '../../enviroments/enviroment';
import {Property} from '../models/property';

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/api/properties`;

  buscarComFiltros(filtros: Record<string, string>): Observable<Property[]> {
    let params = new HttpParams();

    Object.keys(filtros).forEach(key => {
      if (filtros[key]) {
        params = params.append(key, filtros[key]);
      }
    });
    return this.http.get<Property[]>(this.apiUrl, {params});
  }

}
