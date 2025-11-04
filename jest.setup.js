
import '@testing-library/jest-dom';


beforeAll(() => {
  
  const originalConsole = { ...console };
  
  
  jest.spyOn(console, 'log').mockImplementation(() => {});
  jest.spyOn(console, 'info').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'debug').mockImplementation(() => {});

  
  global.__ORIGINAL_CONSOLE__ = originalConsole;
});


afterAll(() => {
  
  const originalConsole = global.__ORIGINAL_CONSOLE__;
  if (originalConsole) {
    console.log = originalConsole.log;
    console.info = originalConsole.info;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.debug = originalConsole.debug;
    delete global.__ORIGINAL_CONSOLE__;
  }
});


jest.mock('@/lib/mongodb', () => ({
  __esModule: true,
  default: {
    connect: jest.fn(),
    db: jest.fn().mockReturnValue({
      collection: jest.fn().mockReturnValue({
        find: jest.fn(),
        findOne: jest.fn(),
        insertOne: jest.fn(),
        updateOne: jest.fn(),
        deleteOne: jest.fn()
      })
    })
  }
}));


jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn()
  }),
  useSearchParams: () => ({
    get: jest.fn()
  })
}));


expect.extend({
  toBeValidShelterMatch(received) {
    const pass = received !== null &&
      typeof received === 'object' &&
      typeof received.shelterId === 'string' &&
      typeof received.shelterName === 'string' &&
      typeof received.percentageMatch === 'number' &&
      Array.isArray(received.matchDetails) &&
      Array.isArray(received.failedCriteria) &&
      typeof received.shelterInfo === 'object';

    return {
      pass,
      message: () => pass
        ? 'Expected shelter match to not be valid'
        : 'Expected shelter match to be valid with required properties (shelterId, shelterName, percentageMatch, matchDetails, failedCriteria, shelterInfo)'
    };
  },
  toHaveValidMatchPercentage(received) {
    const pass = typeof received === 'number' &&
      received >= 0 &&
      received <= 100;

    return {
      pass,
      message: () => pass
        ? 'Expected match percentage to not be valid'
        : 'Expected match percentage to be a number between 0 and 100'
    };
  }
});


beforeAll(() => {
  
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});


afterEach(() => {
  jest.clearAllMocks();
}); 