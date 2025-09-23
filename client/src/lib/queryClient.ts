import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  options?: {
    body?: unknown;
    headers?: Record<string, string>;
  } | unknown
): Promise<Response> {
  // Handle legacy usage where third param was just body data
  let body: unknown = undefined;
  let headers: Record<string, string> = {};
  
  if (options) {
    // Check if it's the new options format
    if (typeof options === 'object' && options !== null && ('body' in options || 'headers' in options)) {
      const opts = options as { body?: unknown; headers?: Record<string, string> };
      body = opts.body;
      headers = { ...headers, ...opts.headers };
    } else {
      // Legacy format - treat as body data
      body = options;
    }
  }
  
  // Set Content-Type only if we have body data
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
