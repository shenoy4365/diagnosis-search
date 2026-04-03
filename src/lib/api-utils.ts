import { NextRequest, NextResponse } from "next/server";

/**
 * Standard API error response
 */
export interface ApiError {
  error: string;
  message: string;
  status: number;
  timestamp: string;
}

/**
 * Standard API success response
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: string,
  message: string,
  status: number
): NextResponse<ApiError> {
  return NextResponse.json(
    {
      error,
      message,
      status,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  status: number = 200
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Error handler wrapper for API routes
 */
export async function withErrorHandler<T>(
  handler: () => Promise<T>,
  errorMessage: string = "An error occurred"
): Promise<NextResponse> {
  try {
    const result = await handler();
    return createSuccessResponse(result);
  } catch (error) {
    console.error(`API Error: ${errorMessage}`, error);

    if (error instanceof Error) {
      return createErrorResponse(
        "ServerError",
        error.message || errorMessage,
        500
      );
    }

    return createErrorResponse("ServerError", errorMessage, 500);
  }
}

/**
 * Simple in-memory rate limiter
 * For production, use Redis or a proper rate limiting service
 */
class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  /**
   * Check if request should be rate limited
   * @param identifier User identifier (IP, user ID, etc.)
   * @returns true if request should be allowed, false if rate limited
   */
  checkLimit(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Filter out requests outside the current window
    const recentRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    // Cleanup old entries periodically
    if (this.requests.size > 1000) {
      this.cleanup(now);
    }

    return true;
  }

  /**
   * Get remaining requests for identifier
   */
  getRemaining(identifier: string): number {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];
    const recentRequests = userRequests.filter(
      (timestamp) => now - timestamp < this.windowMs
    );
    return Math.max(0, this.maxRequests - recentRequests.length);
  }

  /**
   * Clean up old entries
   */
  private cleanup(now: number) {
    for (const [identifier, requests] of this.requests.entries()) {
      const recentRequests = requests.filter(
        (timestamp) => now - timestamp < this.windowMs
      );
      if (recentRequests.length === 0) {
        this.requests.delete(identifier);
      } else {
        this.requests.set(identifier, recentRequests);
      }
    }
  }

  /**
   * Reset all rate limits (useful for testing)
   */
  reset() {
    this.requests.clear();
  }
}

// Create rate limiter instances for different endpoints
export const searchRateLimiter = new RateLimiter(60000, 20); // 20 requests per minute
export const apiRateLimiter = new RateLimiter(60000, 100); // 100 requests per minute

/**
 * Rate limiting middleware
 */
export function withRateLimit(
  req: NextRequest,
  limiter: RateLimiter = apiRateLimiter
): NextResponse | null {
  // Get identifier (IP address or user ID)
  const identifier =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    "anonymous";

  if (!limiter.checkLimit(identifier)) {
    return createErrorResponse(
      "RateLimitExceeded",
      "Too many requests. Please try again later.",
      429
    );
  }

  return null; // No rate limit hit
}

/**
 * Validate required fields in request body
 */
export function validateRequired<T extends Record<string, any>>(
  body: T,
  requiredFields: (keyof T)[]
): string | null {
  for (const field of requiredFields) {
    if (!body[field]) {
      return `Missing required field: ${String(field)}`;
    }
  }
  return null;
}

/**
 * Combined middleware wrapper for API routes
 */
export async function withMiddleware<T>(
  req: NextRequest,
  handler: () => Promise<T>,
  options: {
    rateLimiter?: RateLimiter;
    errorMessage?: string;
  } = {}
): Promise<NextResponse> {
  // Rate limiting
  if (options.rateLimiter) {
    const rateLimitResponse = withRateLimit(req, options.rateLimiter);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }
  }

  // Error handling
  return withErrorHandler(handler, options.errorMessage);
}
