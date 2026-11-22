export type DocKind = "txt" | "md" | "pdf" | "image";

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: number;
}

export interface Document {
  id: string;
  user_id: string;
  title: string;
  kind: DocKind;
  content: string;
  outline: string | null;
  created_at: number;
  updated_at: number;
}

export interface StudySession {
  id: string;
  user_id: string;
  document_id: string;
  title: string;
  status: "active" | "done";
  progress: number;
  created_at: number;
  updated_at: number;
  completed_at: number | null;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  document_id: string;
  session_id: string | null;
  correct: number;
  total: number;
  created_at: number;
}

export interface OutlineChapter {
  title: string;
  summary: string;
  keyPoints: string[];
}

export interface Outline {
  summary: string;
  chapters: OutlineChapter[];
  keyPoints: string[];
  conclusion: string;
}

export type QuizQuestion =
  | {
      type: "single";
      question: string;
      options: string[];
      answerIndex: number;
      explain: string;
    }
  | {
      type: "short";
      question: string;
      shortAnswer: string;
      explain: string;
    };

export interface Quiz {
  questions: QuizQuestion[];
}

export interface EventKind {
  kind: "view" | "use";
}