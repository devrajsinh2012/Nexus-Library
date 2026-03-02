import { z } from 'zod';
import { insertBookSchema } from './schema';
import type { Book, Loan, Hold } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  unauthorized: z.object({ message: z.string() }),
};

export const api = {
  books: {
    list: {
      method: 'GET' as const,
      path: '/api/books' as const,
      input: z.object({ search: z.string().optional() }).optional(),
      responses: {
        200: z.array(z.custom<Book>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/books/:id' as const,
      responses: {
        200: z.custom<Book>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/books' as const,
      input: insertBookSchema,
      responses: {
        201: z.custom<Book>(),
        400: errorSchemas.validation,
      },
    },
    aiSummary: {
      method: 'POST' as const,
      path: '/api/books/:id/ai-summary' as const,
      responses: {
        200: z.object({ summary: z.string() }),
        404: errorSchemas.notFound,
      }
    }
  },
  loans: {
    list: {
      method: 'GET' as const,
      path: '/api/loans' as const,
      responses: {
        200: z.array(z.custom<Loan>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/loans' as const,
      input: z.object({ bookId: z.string() }),
      responses: {
        201: z.custom<Loan>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    return: {
      method: 'POST' as const,
      path: '/api/loans/:id/return' as const,
      responses: {
        200: z.custom<Loan>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      }
    }
  },
  holds: {
    list: {
      method: 'GET' as const,
      path: '/api/holds' as const,
      responses: {
        200: z.array(z.custom<Hold>()),
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/holds' as const,
      input: z.object({ bookId: z.string() }),
      responses: {
        201: z.custom<Hold>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
