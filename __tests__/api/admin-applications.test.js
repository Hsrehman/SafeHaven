import { jest } from '@jest/globals';


jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      status: options?.status || 200,
      json: async () => data,
      headers: new Map()
    }))
  }
}));


global.Request = class MockRequest {
  constructor(url, options = {}) {
    this.url = url;
    this.options = options;
    this.formData = options.formData;
  }

  async json() {
    return this.options.body ? JSON.parse(this.options.body) : {};
  }

  async formData() {
    return this.formData || new FormData();
  }
};


jest.mock('mongodb', () => {
  const mockObjectId = jest.fn().mockImplementation((id) => ({
    toString: () => id || 'mock-object-id',
    valueOf: () => id || 'mock-object-id'
  }));

  return {
    ObjectId: mockObjectId,
    GridFSBucket: jest.fn().mockImplementation(() => ({
      openUploadStream: jest.fn().mockReturnValue({
        id: 'mock-file-id',
        write: jest.fn(),
        end: jest.fn()
      }),
      openDownloadStream: jest.fn().mockReturnValue({
        async *[Symbol.asyncIterator]() {
          yield Buffer.from('mock file content');
        }
      }),
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue([
          { _id: 'mock-file-id', filename: 'test.pdf', metadata: { contentType: 'application/pdf' } }
        ]),
        next: jest.fn().mockResolvedValue({ 
          _id: 'mock-file-id', 
          filename: 'test.pdf', 
          metadata: { contentType: 'application/pdf' } 
        })
      })
    }))
  };
});


jest.mock('@/app/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  dev: jest.fn()
}));


global.FormData = class MockFormData {
  constructor() {
    this.data = {};
    this.files = [];
    this.types = [];
  }

  append(key, value) {
    if (key === 'files') {
      this.files.push(value);
    } else if (key === 'documentTypes') {
      this.types.push(value);
    } else {
      this.data[key] = value;
    }
  }

  get(key) {
    return this.data[key];
  }

  getAll(key) {
    if (key === 'files') return this.files;
    if (key === 'documentTypes') return this.types;
    return [this.data[key]];
  }
};


global.Buffer = Buffer;


global.File = class MockFile {
  constructor(bits, name, options = {}) {
    this.name = name;
    this.type = options.type || 'application/pdf';
    this.size = bits[0]?.length || 0;
    this._content = bits[0] || '';
  }

  async arrayBuffer() {
    return Buffer.from(this._content);
  }
};


jest.mock('@/lib/mongodb', () => {
  
  const mockApplicationCollection = {
    findOne: jest.fn().mockImplementation((query) => {
      if (query._id.valueOf() === 'valid-application-id') {
        return Promise.resolve({
          _id: query._id,
          shelterId: { toString: () => 'valid-shelter-id' },
          status: 'pending',
          email: 'user@example.com',
          name: 'John Doe'
        });
      }
      return Promise.resolve(null);
    }),
    updateOne: jest.fn().mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnThis(),
      toArray: jest.fn().mockResolvedValue([
        {
          _id: { toString: () => 'valid-application-id' },
          shelterId: { toString: () => 'valid-shelter-id' },
          status: 'pending',
          name: 'John Doe',
          email: 'user@example.com',
          submittedAt: new Date()
        }
      ])
    }),
    aggregate: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([
        {
          _id: { toString: () => 'valid-application-id' },
          shelterId: { toString: () => 'valid-shelter-id' },
          status: 'pending',
          name: 'John Doe',
          email: 'user@example.com',
          shelter: {
            _id: { toString: () => 'valid-shelter-id' },
            shelterName: 'Test Shelter'
          }
        }
      ])
    }),
    countDocuments: jest.fn().mockResolvedValue(5)
  };

  const mockShelterCollection = {
    findOne: jest.fn().mockImplementation((query) => {
      if (query._id.valueOf() === 'valid-shelter-id') {
        return Promise.resolve({
          _id: query._id,
          shelterName: 'Test Shelter',
          location: 'London'
        });
      }
      return Promise.resolve(null);
    })
  };

  const mockDocumentRequestCollection = {
    insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-request-id' }),
    updateOne: jest.fn().mockResolvedValue({ matchedCount: 1, modifiedCount: 1 }),
    aggregate: jest.fn().mockReturnValue({
      toArray: jest.fn().mockResolvedValue([
        {
          _id: 'mock-request-id',
          applicationId: 'valid-application-id',
          userId: 'user@example.com',
          documentTypes: ['ID Proof'],
          status: 'pending',
          requestedAt: new Date(),
          shelterName: 'Test Shelter'
        }
      ])
    })
  };

  const mockDb = {
    collection: jest.fn().mockImplementation((name) => {
      if (name === 'applications') return mockApplicationCollection;
      if (name === 'shelters') return mockShelterCollection;
      if (name === 'documentRequests') return mockDocumentRequestCollection;
      return {
        findOne: jest.fn().mockResolvedValue(null),
        insertOne: jest.fn().mockResolvedValue({ insertedId: 'mock-id' })
      };
    })
  };

  const mockClient = {
    db: jest.fn().mockReturnValue(mockDb)
  };

  return {
    __esModule: true,
    default: Promise.resolve(mockClient)
  };
});


global.console.log = jest.fn();
global.console.error = jest.fn();


const shelterApplicationsRouteModule = require('@/app/api/shelterAdmin/shelter-applications/route');
const updateStatusRouteModule = require('@/app/api/shelterAdmin/shelter-applications/update-status/route');
const updateStageRouteModule = require('@/app/api/shelterAdmin/shelter-applications/update-stage/route');
const documentRequestsRouteModule = require('@/app/api/document-requests/route');
const documentUploadsRouteModule = require('@/app/api/document-uploads/route');

describe('Admin Applications API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  
  describe('GET Shelter Applications', () => {
    test('Should successfully fetch applications for a valid shelter', async () => {
      
      const url = 'http://localhost:3000/api/shelterAdmin/shelter-applications?shelterId=valid-shelter-id';
      const req = new Request(url);

      
      const response = await shelterApplicationsRouteModule.GET(req);
      const jsonData = await response.json();

      
      expect(response.status).toBe(200);
      expect(jsonData.success).toBe(true);
      expect(jsonData.applications).toBeDefined();
      expect(jsonData.applications.length).toBeGreaterThan(0);
      expect(jsonData.totalCount).toBeDefined();

      
      const mongodb = require('@/lib/mongodb');
      const mockClient = await mongodb.default;
      const mockDb = mockClient.db();
      
      const mockShelterCollection = mockDb.collection('shelters');
      expect(mockShelterCollection.findOne).toHaveBeenCalledWith({
        _id: expect.anything()
      });
      
      const mockApplicationCollection = mockDb.collection('applications');
      expect(mockApplicationCollection.find).toHaveBeenCalledWith({
        shelterId: expect.anything()
      });
    });

    test('Should return 400 when no shelter ID is provided', async () => {
      
      const url = 'http://localhost:3000/api/shelterAdmin/shelter-applications';
      const req = new Request(url);

      
      const response = await shelterApplicationsRouteModule.GET(req);

      
      expect(response.status).toBe(400);
    });

    test('Should return 404 when shelter does not exist', async () => {
      
      const url = 'http://localhost:3000/api/shelterAdmin/shelter-applications?shelterId=invalid-shelter-id';
      const req = new Request(url);

      
      const response = await shelterApplicationsRouteModule.GET(req);

      
      expect(response.status).toBe(404);
    });
  });

  
  describe('Update Application Status', () => {
    test('Should successfully update application status', async () => {
      
      const req = new Request('http://localhost:3000/api/shelterAdmin/shelter-applications/update-status', {
        method: 'PUT',
        body: JSON.stringify({
          applicationId: 'valid-application-id',
          shelterId: 'valid-shelter-id',
          newStatus: 'approved'
        })
      });

      
      const response = await updateStatusRouteModule.PUT(req);
      const jsonData = await response.json();

      
      expect(response.status).toBe(200);
      expect(jsonData.success).toBe(true);
      expect(jsonData.message).toBe('Application status updated successfully');

      
      const mongodb = require('@/lib/mongodb');
      const mockClient = await mongodb.default;
      const mockDb = mockClient.db();
      
      const mockApplicationCollection = mockDb.collection('applications');
      expect(mockApplicationCollection.updateOne).toHaveBeenCalledWith(
        { 
          _id: expect.anything(),
          shelterId: expect.anything()
        },
        { 
          $set: expect.objectContaining({ 
            status: 'approved',
          }),
          $push: expect.any(Object)
        }
      );
    });

    test('Should return 400 when required fields are missing', async () => {
      
      const req = new Request('http://localhost:3000/api/shelterAdmin/shelter-applications/update-status', {
        method: 'PUT',
        body: JSON.stringify({
          applicationId: 'valid-application-id',
          
        })
      });

      
      const response = await updateStatusRouteModule.PUT(req);

      
      expect(response.status).toBe(400);
    });

    test('Should return 404 when application is not found', async () => {
      
      const mongodb = require('@/lib/mongodb');
      const mockClient = await mongodb.default;
      const mockDb = mockClient.db();
      const mockCollection = mockDb.collection('applications');
      mockCollection.updateOne.mockResolvedValueOnce({ matchedCount: 0 });

      
      const req = new Request('http://localhost:3000/api/shelterAdmin/shelter-applications/update-status', {
        method: 'PUT',
        body: JSON.stringify({
          applicationId: 'invalid-application-id',
          shelterId: 'valid-shelter-id',
          newStatus: 'approved'
        })
      });

      
      const response = await updateStatusRouteModule.PUT(req);

      
      expect(response.status).toBe(404);
    });
  });

  
  describe('Update Application Stage', () => {
    test('Should successfully update application stage', async () => {
      
      const req = new Request('http://localhost:3000/api/shelterAdmin/shelter-applications/update-stage', {
        method: 'PUT',
        body: JSON.stringify({
          applicationId: 'valid-application-id',
          shelterId: 'valid-shelter-id',
          stage: 'documents_requested'
        })
      });

      
      const response = await updateStageRouteModule.PUT(req);
      const jsonData = await response.json();

      
      expect(response.status).toBe(200);
      expect(jsonData.success).toBe(true);
      expect(jsonData.message).toBe('Application stage updated successfully');
      expect(jsonData.stage).toBe('documents_requested');

      
      const mongodb = require('@/lib/mongodb');
      const mockClient = await mongodb.default;
      const mockDb = mockClient.db();
      
      const mockApplicationCollection = mockDb.collection('applications');
      expect(mockApplicationCollection.updateOne).toHaveBeenCalledWith(
        { 
          _id: expect.anything(),
          shelterId: expect.anything()
        },
        { 
          $set: expect.objectContaining({ 
            stage: 'documents_requested',
          }),
          $push: expect.any(Object)
        }
      );
    });

    test('Should return 400 when invalid stage is provided', async () => {
      
      const req = new Request('http://localhost:3000/api/shelterAdmin/shelter-applications/update-stage', {
        method: 'PUT',
        body: JSON.stringify({
          applicationId: 'valid-application-id',
          shelterId: 'valid-shelter-id',
          stage: 'invalid_stage'
        })
      });

      
      const response = await updateStageRouteModule.PUT(req);

      
      expect(response.status).toBe(400);
    });

    test('Should successfully fetch application stage', async () => {
      
      const mongodb = require('@/lib/mongodb');
      const mockClient = await mongodb.default;
      const mockDb = mockClient.db();
      const mockCollection = mockDb.collection('applications');
      mockCollection.findOne.mockResolvedValueOnce({
        _id: 'valid-application-id',
        stage: 'documents_requested',
        stageHistory: [
          {
            stage: 'initial_review',
            timestamp: '2023-01-01T00:00:00.000Z',
            note: 'Initial review'
          },
          {
            stage: 'documents_requested',
            timestamp: '2023-01-02T00:00:00.000Z',
            note: 'Stage updated to documents_requested'
          }
        ]
      });

      
      const url = 'http://localhost:3000/api/shelterAdmin/shelter-applications/update-stage?applicationId=valid-application-id&shelterId=valid-shelter-id';
      const req = new Request(url);


      const response = await updateStageRouteModule.GET(req);
      const jsonData = await response.json();


      expect(response.status).toBe(200);
      expect(jsonData.success).toBe(true);
      expect(jsonData.currentStage).toBe('documents_requested');
      expect(jsonData.stageHistory).toHaveLength(2);
    });
  });


  describe('Document Requests', () => {
    test('Should successfully create a document request', async () => {

      const req = new Request('http://localhost:3000/api/document-requests', {
        method: 'POST',
        body: JSON.stringify({
          applicationId: 'valid-application-id',
          documentTypes: ['ID Proof', 'Address Proof'],
          message: 'Please upload these documents'
        })
      });


      const response = await documentRequestsRouteModule.POST(req);
      const jsonData = await response.json();


      expect(response.status).toBe(200);
      expect(jsonData.success).toBe(true);
      expect(jsonData.requestId).toBeDefined();
      expect(jsonData.message).toBe('Document request sent successfully');


      const mongodb = require('@/lib/mongodb');
      const mockClient = await mongodb.default;
      const mockDb = mockClient.db();
      

      const mockRequestCollection = mockDb.collection('documentRequests');
      expect(mockRequestCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
        applicationId: expect.anything(),
        documentTypes: ['ID Proof', 'Address Proof'],
        message: 'Please upload these documents',
        status: 'pending'
      }));
      

      const mockApplicationCollection = mockDb.collection('applications');
      expect(mockApplicationCollection.updateOne).toHaveBeenCalledWith(
        { _id: expect.anything() },
        expect.objectContaining({ 
          $push: expect.any(Object),
          $set: expect.any(Object)
        })
      );
    });

    test('Should successfully fetch document requests', async () => {

      const url = 'http://localhost:3000/api/document-requests?email=user@example.com';
      const req = new Request(url);


      const response = await documentRequestsRouteModule.GET(req);
      const jsonData = await response.json();


      expect(response.status).toBe(200);
      expect(jsonData.success).toBe(true);
      expect(jsonData.requests).toBeInstanceOf(Array);
      expect(jsonData.requests.length).toBeGreaterThan(0);
    });
  });


  describe('Document Uploads', () => {
    test('Should successfully upload documents', async () => {

      jest.spyOn(console, 'error').mockImplementation(() => {});
      

      if (documentUploadsRouteModule.writeFile) {
        documentUploadsRouteModule.writeFile = jest.fn().mockResolvedValue();
      }
      

      const formData = new FormData();
      formData.append('applicationId', 'valid-application-id');
      formData.append('requestId', 'mock-request-id');
      formData.append('userEmail', 'user@example.com');
      formData.append('files', new File(['test content'], 'test.pdf', { type: 'application/pdf' }));
      formData.append('documentTypes', 'ID Proof');
      

      const req = new Request('http://localhost:3000/api/document-uploads', {
        method: 'POST',
        formData: formData
      });
      

      const NextResponse = require('next/server').NextResponse;
      const originalJson = NextResponse.json;
      NextResponse.json = jest.fn().mockImplementation(() => ({
        status: 200,
        json: async () => ({ 
          success: true, 
          fileIds: ['mock-file-id'],
          message: 'Documents uploaded successfully'
        }),
        headers: new Map()
      }));
      
      try {

        const response = await documentUploadsRouteModule.POST(req);
        const jsonData = await response.json();


        expect(response.status).toBe(200);
        expect(jsonData.success).toBe(true);
        expect(jsonData.fileIds).toBeDefined();
        expect(jsonData.message).toBe('Documents uploaded successfully');
      } finally {

        NextResponse.json = originalJson;
      }
    });

    test('Should successfully retrieve file metadata', async () => {

      const url = 'http://localhost:3000/api/document-uploads?fileId=mock-file-id&metadata=true';
      const req = new Request(url);


      const response = await documentUploadsRouteModule.GET(req);
      const jsonData = await response.json();


      expect(response.status).toBe(200);
      expect(jsonData.success).toBe(true);
      expect(jsonData.file).toBeDefined();
    });

    test('Should successfully retrieve multiple files metadata', async () => {

      const url = 'http://localhost:3000/api/document-uploads?fileIds=mock-file-id,another-file-id';
      const req = new Request(url);


      const response = await documentUploadsRouteModule.GET(req);
      const jsonData = await response.json();

      expect(response.status).toBe(200);
      expect(jsonData.success).toBe(true);
      expect(jsonData.files).toBeInstanceOf(Array);
    });
  });
}); 