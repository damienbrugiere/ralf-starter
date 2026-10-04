import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface CreateGameRequest {
  name: string;
  description?: string;
}

export interface Game {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly http = inject(HttpClient);

  create(request: CreateGameRequest): Observable<Game> {
    return this.http.post<Game>('/api/games', request);
  }
}
