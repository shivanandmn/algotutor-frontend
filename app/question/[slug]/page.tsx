"use client";
"use client";

import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import useStore from "@/lib/store/UserStore";
import { cn } from "@/lib/utils";
import { questionApi, type Question, type SubmissionResponse, type SubmissionStatus, type CodeSnippet } from "@/lib/api/questions";



function Page({ params }: { params: { slug: string } }) {
  const [questionData, setQuestionData] = useState<Question>({} as Question);
  const [loading, setLoading] = useState(true);
  const [selectedLangIndex, setSelectedLangIndex] = useState(0);
  const [editorValue, setEditorValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<SubmissionStatus | null>(null);
  const [statusPolling, setStatusPolling] = useState(false);
  
  // Default code snippets with Python as default
  const defaultCodeSnippets: CodeSnippet[] = [
    {
      lang: "Python",
      langSlug: "python",
      code: "# Write your Python code here\n\ndef solution():\n    # Your solution here\n    pass\n"
    },
    {
      lang: "JavaScript",
      langSlug: "javascript",
      code: "// Write your JavaScript code here\n\nfunction solution() {\n    // Your solution here\n}\n"
    },
    {
      lang: "Java",
      langSlug: "java",
      code: "// Write your Java code here\n\npublic class Solution {\n    public void solution() {\n        // Your solution here\n    }\n}\n"
    }
  ];

  const getQuestion = async () => {
    try {
      const question = await questionApi.get(params.slug);
      
      // Ensure code_snippets exists, if not use defaults
      if (!question.code_snippets || question.code_snippets.length === 0) {
        question.code_snippets = defaultCodeSnippets;
      }
      
      // Find Python index to set as default
      const pythonIndex = question.code_snippets.findIndex(snippet => 
        snippet.langSlug === 'python' || snippet.lang.toLowerCase() === 'python');
      
      // Set Python as default if available, otherwise use first language
      const defaultIndex = pythonIndex >= 0 ? pythonIndex : 0;
      setSelectedLangIndex(defaultIndex);
      setEditorValue(question.code_snippets[defaultIndex].code);
      
      setQuestionData(question);
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching question:', error);
      toast.error("Failed to load question. Please make sure you're logged in.");
      setLoading(false);
    }
  };

  useEffect(() => {
    getQuestion();
  }, []);

  const { username } = useStore();

  const handleSubmit = async () => {
    if (!username) {
      toast.error("Please set your username first");
      return;
    }
    
    try {
      setSubmitting(true);
      setSubmissionResult(null);
      setSubmissionId(null);
      
      const langSlug = questionData.code_snippets?.[selectedLangIndex]?.langSlug || 'python';
      
      // Submit code
      const response = await questionApi.submit(questionData._id, editorValue, langSlug) as SubmissionResponse;
      console.log('Submit API response:', response); // Debug log
      
      if (response && response.submission_id) {
        setSubmissionId(response.submission_id);
        toast.success("Code submitted successfully!");
        
        // Start polling for status
        setStatusPolling(true);
        checkSubmissionStatus(response.submission_id);
      } else {
        toast.error("Failed to submit code");
        setSubmitting(false);
      }
    } catch (error: any) {
      console.error('Error submitting code:', error);
      toast.error(error.message || "Failed to submit code");
      setSubmitting(false);
    }
  };
  
  const checkSubmissionStatus = async (id: string) => {
    try {
      const statusResponse = await questionApi.getStatus(id) as SubmissionStatus;
      console.log('Status API response:', statusResponse); // Debug log
      
      setSubmissionResult(statusResponse);
      
      // Continue polling if status is not completed or error
      if (statusResponse.status === 'processing' || 
          statusResponse.status === 'queued' || 
          statusResponse.status === 'pending' || 
          statusResponse.status === 'running') {
        console.log(`Status is ${statusResponse.status}, continuing to poll...`);
        setTimeout(() => checkSubmissionStatus(id), 2000);
      } else {
        console.log(`Status is ${statusResponse.status}, polling complete`);
        setStatusPolling(false);
        setSubmitting(false);
      }
    } catch (error: any) {
      console.error('Error checking submission status:', error);
      toast.error("Failed to check submission status");
      setStatusPolling(false);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Header />
        <ResizablePanelGroup
          direction="horizontal"
          className="min-h-[calc(100vh-8rem)] rounded-lg border"
        >
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full flex-col gap-4 p-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-[calc(100vh-16rem)]" />
            </div>
          </ResizablePanel>
          <ResizableHandle />
          <ResizablePanel defaultSize={50}>
            <div className="flex h-full flex-col gap-4 p-4">
              <Skeleton className="h-8 w-1/4" />
              <Skeleton className="h-[calc(100vh-12rem)]" />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <Header />
      <ResizablePanelGroup
        direction="horizontal"
        className="min-h-[calc(100vh-8rem)] rounded-lg border"
      >
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full flex-col gap-4 p-4">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{questionData.title}</h1>
              <span
                className={cn(
                  "rounded-full px-2 py-1 text-xs font-semibold",
                  {
                    "bg-green-100 text-green-800":
                      questionData.level === "easy",
                    "bg-yellow-100 text-yellow-800":
                      questionData.level === "medium",
                    "bg-red-100 text-red-800":
                      questionData.level === "hard",
                  }
                )}
              >
                {questionData.level}
              </span>
            </div>
            <div className="flex gap-2 mt-2 mb-4">
              {questionData.topics?.map(topic => (
                <span key={topic} className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">{topic}</span>
              ))}
            </div>
            <div
              className="prose max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: questionData.content }}
            />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={50}>
          <div className="flex h-full flex-col gap-4 p-4">
            <select
              className="w-32 rounded-md border p-2"
              value={selectedLangIndex}
              onChange={(e) => {
                const index = parseInt(e.target.value);
                setSelectedLangIndex(index);
                setEditorValue(questionData.code_snippets[index].code);
              }}
            >
              {questionData.code_snippets && questionData.code_snippets.map((snippet, index) => (
                <option key={snippet.langSlug || index} value={index}>
                  {snippet.lang}
                </option>
              ))}
            </select>
            <Editor
              height="calc(100vh - 16rem)"
              language={questionData.code_snippets?.[selectedLangIndex]?.langSlug || 'python'}
              value={editorValue}
              onChange={(value) => setEditorValue(value || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                automaticLayout: true,
              }}
            />
            <Button 
              onClick={handleSubmit} 
              className="w-full" 
              disabled={submitting}
            >
              {submitting ? 'Processing...' : 'Run Code'}
            </Button>
            
            {submissionResult && (
              <div className="mt-4 border rounded-md p-4">
                <h3 className="text-lg font-semibold mb-2">Submission Result</h3>
                <div className={`text-sm ${submissionResult.status === 'completed' && submissionResult.total_passed === submissionResult.total_tests ? 'text-green-500' : 'text-red-500'}`}>
                  <p><strong>Status:</strong> {submissionResult.status}</p>
                  <p><strong>Message:</strong> {submissionResult.message}</p>
                  
                  {submissionResult.status === 'completed' && (
                    <>
                      <p><strong>Tests Passed:</strong> {submissionResult.total_passed}/{submissionResult.total_tests}</p>
                      <p><strong>Execution Time:</strong> {submissionResult.execution_time}ms</p>
                      <p><strong>Memory Used:</strong> {submissionResult.memory_used}MB</p>
                      
                      {submissionResult.error && (
                        <div className="mt-2">
                          <p><strong>Error:</strong></p>
                          <pre className="bg-gray-800 p-2 rounded mt-1 overflow-x-auto">
                            {String(submissionResult.error)}
                          </pre>
                        </div>
                      )}
                      
                      {submissionResult.results && submissionResult.results.length > 0 && (
                        <div className="mt-2">
                          <p><strong>Test Results:</strong></p>
                          {submissionResult.results.map((test, index) => (
                            <div key={test.test_case_id} className={`mt-2 p-2 rounded ${test.passed ? 'bg-green-900/20' : 'bg-red-900/20'}`}>
                              <p>Test {index + 1}: {test.passed ? 'Passed' : 'Failed'}</p>
                              <p>Execution Time: {test.execution_time}ms</p>
                              <p>Memory Used: {test.memory_used}MB</p>
                              {test.error && test.error !== "Judge0 API error: 'judge0_id'" && (
                                <p>Error: {test.error}</p>
                              )}
                              {test.error === "Judge0 API error: 'judge0_id'" && (
                                <p className="text-yellow-500">Internal system error. Please try again later.</p>
                              )}
                              {test.output && (
                                <p>Output: {test.output}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                  
                  {submissionResult.status === 'processing' && (
                    <p className="text-yellow-500">Your code is still being processed...</p>
                  )}
                  
                  {submissionResult.status === 'queued' && (
                    <p className="text-yellow-500">Your code is queued for execution...</p>
                  )}
                  
                  {submissionResult.status === 'pending' && (
                    <p className="text-yellow-500">Your submission is pending...</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default Page;
