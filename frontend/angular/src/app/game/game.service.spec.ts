import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GameService } from './game.service';

describe('GameService', () => {
  it('should call POST /api/games', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const service = TestBed.inject(GameService);
    const http = TestBed.inject(HttpTestingController);

    let result: unknown;
    service.create({ name: 'Ma partie' }).subscribe((r) => (result = r));

    const req = http.expectOne('/api/games');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ name: 'Ma partie' });
    const game = { id: 1, name: 'Ma partie', description: null, createdAt: '2026-10-05T00:00:00Z' };
    req.flush(game);
    expect(result).toEqual(game);
    http.verify();
  });

  it('should call GET /api/games', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const service = TestBed.inject(GameService);
    const http = TestBed.inject(HttpTestingController);

    let result: unknown;
    service.list().subscribe((r) => (result = r));

    const req = http.expectOne('/api/games');
    expect(req.request.method).toBe('GET');
    req.flush([]);
    expect(result).toEqual([]);
    http.verify();
  });
});
