import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DocumentService } from './document.service';
import { DocumentDTO } from '../models/document.model';

describe('DocumentService', () => {
  let service: DocumentService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DocumentService]
    });

    service = TestBed.inject(DocumentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch documents with page and size params', (done) => {
  const fakeResponse = {
    content: [] as DocumentDTO[],
    totalPages: 0,
    totalElements: 0,
    size: 10,
    number: 0,
    numberOfElements: 0,
    first: true,
    last: true,
    empty: true
  };

  service.getDocuments(0, 10, null).subscribe(res => { 
    expect(res).toEqual(fakeResponse);
    done();
  });

  const req = httpMock.expectOne(r => r.url.includes('/documents') && r.params.get('page') === '0' && r.params.get('size') === '10');
  expect(req.request.method).toBe('GET');
  req.flush(fakeResponse);
});

it('should return empty page on error', (done) => {
  service.getDocuments(0, 5, null).subscribe(res => { 
    expect(res.content).toEqual([]);
    expect(res.totalElements).toBe(0);
    done();
  });

  const req = httpMock.expectOne(r => r.url.includes('/documents'));
  req.error(new ErrorEvent('network'));
});
});
