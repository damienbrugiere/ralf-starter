import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HealthService } from './health.service';

describe('HealthService', () => {
  it('should call GET /api/health', () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const service = TestBed.inject(HealthService);
    const http = TestBed.inject(HttpTestingController);

    let result: unknown;
    service.check().subscribe((r) => (result = r));

    const req = http.expectOne('/api/health');
    expect(req.request.method).toBe('GET');
    req.flush({ status: 'UP', application: 'jdr-platform' });
    expect(result).toEqual({ status: 'UP', application: 'jdr-platform' });
    http.verify();
  });
});
