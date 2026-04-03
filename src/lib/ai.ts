import Groq from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Creates and returns a Cerebras AI client using Groq SDK
 * Cerebras uses OpenAI-compatible API
 * @returns Groq client configured for Cerebras API
 * @throws Error if CEREBRAS_API_KEY is not set
 */
export function getCerebrasClient(): Groq {
  if (!process.env.CEREBRAS_API_KEY) {
    throw new Error("CEREBRAS_API_KEY is not set");
  }

  return new Groq({
    apiKey: process.env.CEREBRAS_API_KEY,
    baseURL: "https://api.cerebras.ai/v1",
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
