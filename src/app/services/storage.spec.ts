import { TestBed } from '@angular/core/testing';
import { ScoreRecord } from './storage';
import { beforeEach, describe, it, expect } from '@jest/globals';

describe('Storage', () => {
  let service: Storage;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Storage);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

