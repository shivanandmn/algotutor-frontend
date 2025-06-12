if (!process.env.NEXT_PUBLIC_API_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_URL environment variable is not set. ' +
    'Please set it in your .env.local file.'
  );
}

export const config = {
  api: {
    url: process.env.NEXT_PUBLIC_API_URL,
    baseUrl: '/api/v1',
    endpoints: {
      questions: '/questions',
      codeSubmit: '/code/submit'
    },
    cors: {
      allowOrigin: '*',
      allowMethods: 'GET, POST, PUT, DELETE, OPTIONS',
      allowHeaders: 'Content-Type, Authorization',
      maxAge: '86400'
    }
  },
  app: {
    name: 'Algorithm Tutor',
    description: 'Learn algorithms and data structures through interactive coding challenges',
  },
  theme: {
    difficulty: {
      easy: {
        color: 'green',
        bg: 'bg-green-100',
        text: 'text-green-800',
      },
      medium: {
        color: 'yellow',
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
      },
      hard: {
        color: 'red',
        bg: 'bg-red-100',
        text: 'text-red-800',
      },
    },
  },
} as const;

// Type for environment variables
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_API_URL: string;
    }
  }
}
