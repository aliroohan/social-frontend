import { TestBed } from '@angular/core/testing';

import { LoginDetailService } from './login-detail.service';

describe('LoginDetailService', () => {
  let service: LoginDetailService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoginDetailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
