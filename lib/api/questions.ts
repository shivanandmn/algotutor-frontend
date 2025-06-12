import axios, { AxiosError } from 'axios';
import { config } from '../config';
import { buildApiUrl } from '../utils/url';

// Types
export interface CodeSnippet {
  lang: string;
  langSlug: string;
  code: string;
}

export interface TestCase {
  input: string;
  expectedOutput: string;
}

export interface Question {
  _id: string;
  title: string;
  title_slug: string;
  level: 'easy' | 'medium' | 'hard';
  content: string;
  code_snippets: CodeSnippet[];
  test_cases: TestCase[];
  topics: string[];
  companies: string[];
  likes: number;
  dislikes: number;
  hints: string[];
  acceptance_rate: number;
  time_complexity: string;
  space_complexity: string;
}

export interface CodeSubmission {
  question_id: string;
  code: string;
  language: string;
}

export interface ApiError {
  message: string;
  status: number;
}

// Utility functions
function getAuthHeaders() {
  return {
    'Authorization': 'Bearer test',
    'Content-Type': 'application/json'
  } as const;
}

function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message,
      status: error.response?.status || 500
    };
    throw apiError;
  }
  throw new Error('An unexpected error occurred');
}

// API Client
export const questionApi = {
  list: async (): Promise<Question[]> => {
    try {
      const response = await axios.get(
        buildApiUrl(config.api.endpoints.questions),
        { headers: getAuthHeaders() }
      );
      const questions = Array.isArray(response.data) ? response.data : response.data?.data || [];
      return questions;
    } catch (error) {
      handleApiError(error);
    }
  },

  get: async (slug: string): Promise<Question> => {
    try {
      const response = await axios.get(
        buildApiUrl(config.api.endpoints.questions, slug),
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  submit: async (slug: string, code: string, language: string): Promise<unknown> => {
    try {
      const submission: CodeSubmission = {
        question_id: slug,
        code,
        language
      };
      const response = await axios.post(
        buildApiUrl(config.api.endpoints.codeSubmit),
        submission,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
} as const;
