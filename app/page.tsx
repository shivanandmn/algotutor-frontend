"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { questionApi, type Question } from "@/lib/api/questions";
import { MoreVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Header from "@/components/Header";
import React from "react";

enum Language {
  PYTHON = "python",
  JAVA = "java",
  CPP = "cpp",
  JAVASCRIPT = "javascript"
}

interface CodeSnippet {
  language: Language;
  code: string;
  template?: boolean;
  is_starter_code?: boolean;
}

interface TestCase {
  id: string;
  input: string;
  expected_output: string;
  timeout_ms?: number;
  memory_limit_mb?: number;
  is_hidden?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://algotutor-backend-555118069489.asia-south1.run.app';

export default function Home() {
  const [loading, setLoading] = useState<boolean>(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>('Guest');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedName = localStorage.getItem('userName');
      if (!storedName) {
        const name = prompt('Please enter your name to continue:');
        if (name) {
          localStorage.setItem('userName', name);
          setUserName(name);
        }
      } else {
        setUserName(storedName);
      }
    }
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "text-green-500 bg-green-500/10";
      case "medium":
        return "text-yellow-500 bg-yellow-500/10";
      case "hard":
        return "text-red-500 bg-red-500/10";
      default:
        return "text-gray-500 bg-gray-500/10";
    }
  };

  const getQuestions = async () => {
    try {
      const userName = localStorage.getItem('userName');
      if (!userName) {
        toast.error('Please enter your name to continue');
        setLoading(false);
        return;
      }

      const questions = await questionApi.list();
      
      setQuestions(Array.isArray(questions) ? questions : []);
      setLoading(false);
    } catch (error: any) {

      toast.error(error?.response?.data?.detail || "Failed to load questions. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    getQuestions();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      window.location.href = '/auth/login';
    }
  }, [isAuthenticated]);

  return (
    <main className="flex h-screen dark bg-black w-screen flex-col">
      <header className="bg-gray-900 border-b border-gray-800 p-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <h1 className="text-2xl font-semibold text-white">Algorithm Tutor</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Welcome, {userName}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 p-8 max-w-7xl mx-auto w-full">
        <div className="w-full">
          <h2 className="text-2xl text-white font-semibold mb-8">Questions</h2>
          <div className="w-full flex mb-4">
            <span className="w-full pl-4 text-sm font-medium text-gray-400">
              Title
            </span>
            <span className="w-32 text-sm font-medium text-gray-400">
              Difficulty
            </span>
          </div>

          {loading ? (
            <>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="py-2 w-full flex justify-between text-gray-300 px-2">
                  <Skeleton className="w-[60%] h-5" />
                  <Skeleton className="w-[20%] h-5" />
                </div>
              ))}
            </>
          ) : (
            <>
              {(Array.isArray(questions) ? questions : []).map((question, i) => (
                <Link 
                  href={`/question/${question.title_slug}`} 
                  key={question._id} 
                  className="w-full flex items-center p-4 hover:bg-gray-800/50 rounded-lg cursor-pointer transition-colors"
                >
                  <div className="w-full pl-4">
                    <span className="text-white">{question.title}</span>
                    <div className="flex gap-2 mt-1">
                      {question.topics.map(topic => (
                        <span key={topic} className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">{topic}</span>
                      ))}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm ${getDifficultyColor(
                      question.level
                    )}`}
                  >
                    {question.level}
                  </span>
                </Link>
              ))}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
