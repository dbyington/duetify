import { TestBed, inject } from '@angular/core/testing';

import { DuetifyService } from './duetify.service';

describe('DuetifyService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DuetifyService]
    });
  });

  it('should be created', inject([DuetifyService], (service: DuetifyService) => {
    expect(service).toBeTruthy();
  }));
});
