import OpenAI from "openai";
import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Creates and returns a Cerebras AI client
 * Uses OpenAI SDK with Cerebras base URL
 * @returns OpenAI client configured for Cerebras API
 * @throws Error if CEREBRAS_API_KEY is not set
 */
export function getCerebrasClient(): OpenAI {
  if (!process.env.CEREBRAS_API_KEY) {
    throw new Error("CEREBRAS_API_KEY is not set");
  }

  return new OpenAI({
    baseURL: "https://api.cerebras.ai/v1",
    apiKey: process.env.CEREBRAS_API_KEY,
  });
}

/**
 * Creates and returns a Groq AI client
 * @returns Groq SDK client
 * @throws Error if GROQ_API_KEY is not set
 */
export function getGroqClient(): Groq {
  if (!process.env.GROQ_API_KEY) {
    throw new Error("GROQ_API_KEY is not set");
  }

  return new Groq({
    apiKey: process.env.GROQ_API_KEY,
  });
}

/**
 * Creates and returns a Google Gemini AI client
 * @returns GoogleGenerativeAI client
 * @throws Error if GEMINI_API_KEY is not set
 */
export function getGeminiClient(): GoogleGenerativeAI {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set");
  }

  return new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

/**
 * Creates and returns an OpenAI client (kept for compatibility)
 * @returns OpenAI SDK client
 * @throws Error if OPENAI_API_KEY is not set
 */
export function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}
