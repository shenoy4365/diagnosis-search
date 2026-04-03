import OpenAI from "openai";
import Groq from "groq-sdk";

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
 * Creates and returns an OpenAI client
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
