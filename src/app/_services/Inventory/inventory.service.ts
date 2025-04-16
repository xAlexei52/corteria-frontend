import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

interface InventoryItem {
  itemId: string;
  quantity: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private apiUrl = 'https://corteria-backend.onrender.com/api/inventory';

  constructor(private http: HttpClient) {}

  getInventory(): Observable<InventoryItem[]> {
    return this.http.get<any>(this.apiUrl).pipe(
      map(response => response.inventory.map((item: any) => ({
        itemId: item.itemId,
        quantity: item.quantity
      })))
    );
  }
}
