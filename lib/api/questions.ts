import axios, { AxiosError } from 'axios';

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

export interface TestResult {
  test_case_id: string;
  passed: boolean;
  execution_time: number;
  memory_used: number;
  output: string | null;
  error: string | null;
}

export interface SubmissionResponse {
  submission_id: string;
  status: 'queued' | 'processing' | 'completed' | 'error' | 'pending' | 'running';
  message: string;
  results: TestResult[] | null;
  total_passed: number;
  total_tests: number;
  execution_time: number;
  memory_used: number;
  error: boolean;
  success: boolean;
  input: string | null;
  expected_output: string | null;
  output_value: string | null;
  submitted_at: string;
}

export interface SubmissionStatus extends SubmissionResponse {}


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

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function handleApiError(error: unknown): Promise<never> {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status || 500;
    // If rate limited (500 error), wait and retry once
    if (status === 500) {
      await sleep(1000); // Wait 1 second before retry
      return Promise.reject({
        message: 'Rate limited, please try again',
        status: status
      });
    }
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message,
      status: status
    };
    throw apiError;
  }
  throw new Error('An unexpected error occurred');
}

// API Client
// Access environment variable directly - in Next.js, NEXT_PUBLIC_ variables are exposed to the browser
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const questionApi = {
  list: async (): Promise<Question[]> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/question/`,
        { headers: getAuthHeaders() }
      );
      const questions = Array.isArray(response.data) ? response.data : response.data?.data || [];
      return questions;
    } catch (error) {
      return handleApiError(error);
    }
  },

  get: async (slug: string): Promise<Question> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/question/by-slug/${slug}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  submit: async (slug: string, code: string, language: string): Promise<SubmissionResponse> => {
    try {
      const submission: CodeSubmission = {
        question_id: slug,
        code,
        language
      };
      const response = await axios.post(
        `${API_BASE_URL}/api/v1/code/submit`,
        submission,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },
  
  getStatus: async (submissionId: string): Promise<SubmissionStatus> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/v1/code/status/${submissionId}`,
        { headers: getAuthHeaders() }
      );
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  }
} as const;
