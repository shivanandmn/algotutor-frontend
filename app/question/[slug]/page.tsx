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
import { questionApi, type Question } from "@/lib/api/questions";



function Page({ params }: { params: { slug: string } }) {
  const [questionData, setQuestionData] = useState<Question>({} as Question);
  const [loading, setLoading] = useState(true);
  const [selectedLangIndex, setSelectedLangIndex] = useState(0);
  const [editorValue, setEditorValue] = useState("");

  const getQuestion = async () => {
    try {
      const question = await questionApi.get(params.slug);
      setQuestionData(question);
      
      if (question.code_snippets?.length > 0) {
        setEditorValue(question.code_snippets[0].code);
      }
      
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

  const handleSubmit = () => {
    if (!username) {
      toast.error("Please set your username first");
      return;
    }
    toast.success("Code submitted successfully!");
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
              {questionData.code_snippets?.map((snippet, index) => (
                <option key={snippet.langSlug} value={index}>
                  {snippet.lang}
                </option>
              ))}
            </select>
            <Editor
              height="calc(100vh - 16rem)"
              language={questionData.code_snippets?.[selectedLangIndex]?.langSlug || 'javascript'}
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
            <Button onClick={handleSubmit} className="w-full">
              Run Code
            </Button>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}

export default Page;
