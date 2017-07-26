import { TestBed, inject } from '@angular/core/testing';

import { SpotifyApiService } from './spotify-api.service';

describe('SpotifyApiService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SpotifyApiService]
    });
  });

  it('should be created', inject([SpotifyApiService], (service: SpotifyApiService) => {
    expect(service).toBeTruthy();
  }));
});
