const getApiBaseUrl = () => {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("EXPO_PUBLIC_API_URL environment variable is not set");
  }
  return baseUrl.replace(/\/$/, "");
};

import { useMutation, UseMutationOptions } from "@tanstack/react-query";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import EventSource from "react-native-sse";
import {
  useWebSocket,
  UseWebSocketReturn,
  UseWebSocketOptions,
} from "./useWebsocketMobile";
import { z } from "zod";

// ---- Service Name: Greeting ----
export const GreetingSayHelloQueryInputSchema = z
  .object({ name: z.record(z.string()) })
  .strict();
export type GreetingSayHelloOutputType = {
  greeting: {
    [x: string]: string;
  };
};

export function useGreetingSayHelloQuery(
  args: z.infer<typeof GreetingSayHelloQueryInputSchema>,
  extraOptions?: Omit<
    UseQueryOptions<
      GreetingSayHelloOutputType,
      Error,
      GreetingSayHelloOutputType,
      Array<string | z.infer<typeof GreetingSayHelloQueryInputSchema>>
    >,
    "queryKey" | "queryFn"
  >,
  headers?: Record<string, string>,
) {
  /*Says hello and the name.*/
  return useQuery({
    queryKey: ["Greeting", "SayHello", args],
    queryFn: async () => {
      const validationResult =
        await GreetingSayHelloQueryInputSchema.safeParseAsync(args);
      if (validationResult.error) {
        console.error(
          "Error on input validation of SayHello",
          validationResult.error,
        );
        throw new Error(validationResult.error.message);
      }

      const baseUrl = getApiBaseUrl();
      const targetURL = new URL(`${baseUrl}/_api/Greeting/SayHello`);
      const stringifiedArguments = JSON.stringify(validationResult.data);
      const encodedArguments = encodeURIComponent(stringifiedArguments);
      targetURL.searchParams.set("payload", encodedArguments);

      const response = await fetch(targetURL.toString(), {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        let backendErrorMessage = "";
        try {
          backendErrorMessage = await response.text();
        } catch {
          backendErrorMessage = "No Error message returned from backend";
        }
        throw new Error(
          "Query: SayHello Non ok response: " + backendErrorMessage,
        );
      }

      const rawResponse = await response.json();
      return rawResponse["data"] as GreetingSayHelloOutputType;
    },
    ...extraOptions,
  });
}

export type GreetingSendMessageOutputType = {
  status: boolean;
};
export const GreetingSendMessageInputSchema = z
  .object({ message: z.string() })
  .strict();
export function useGreetingSendMessageMutation(
  extraOptions?: Omit<
    UseMutationOptions<
      GreetingSendMessageOutputType,
      Error,
      z.infer<typeof GreetingSendMessageInputSchema>,
      unknown
    >,
    "mutationFn"
  >,
  headers?: Record<string, string>,
) {
  /*Says hello and the name.*/
  return useMutation({
    ...extraOptions,
    mutationFn: async (
      args: z.infer<typeof GreetingSendMessageInputSchema>,
    ) => {
      const validationResult =
        await GreetingSendMessageInputSchema.safeParseAsync(args);
      if (validationResult.error) {
        console.error(
          "Error on validating mutation input ",
          validationResult.error,
        );
        throw new Error(validationResult.error.message);
      }

      const targetURL = `${getApiBaseUrl()}/_api/Greeting/SendMessage`;
      const response = await fetch(targetURL, {
        method: "POST",
        body: JSON.stringify(validationResult.data),
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
      });

      if (!response.ok) {
        let backendErrorMessage = "";
        try {
          backendErrorMessage = await response.text();
        } catch {
          backendErrorMessage = "No Error message returned from backend";
        }
        throw new Error(
          "Mutation: SendMessage Non ok response: " + backendErrorMessage,
        );
      }

      const rawResponse = await response.json();

      return rawResponse["data"] as GreetingSendMessageOutputType;
    },
  });
}

export const GreetingStreamedNameSubscriptionInputSchema = z
  .object({ name: z.string() })
  .strict();
export type GreetingStreamedNameOutputType = string;

export function useGreetingStreamedNameSubscription(
  args: z.infer<typeof GreetingStreamedNameSubscriptionInputSchema>,
  extraOptions?: {
    onError?: (errorMessage: string) => void; // Callback that executes when there's an error
    onClose?: () => void; // Callback that executes when the connection has been closed by the server
  },
) {
  /*Streams the given name, letter by letter.*/
  const sourceRef = useRef<EventSource | null>(null);
  const [messages, setMessages] = useState<
    Array<GreetingStreamedNameOutputType>
  >([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  const onErrorRef = useRef(extraOptions?.onError);
  const onCloseRef = useRef(extraOptions?.onClose);

  useEffect(() => {
    onErrorRef.current = extraOptions?.onError;
    onCloseRef.current = extraOptions?.onClose;
  }, [extraOptions]);
  useEffect(() => {
    if (sourceRef.current) {
      return;
    }

    const baseUrl = getApiBaseUrl();
    const targetURL = new URL(`${baseUrl}/_api/Greeting/StreamedName`);
    const stringifiedArguments = JSON.stringify(args);
    const encodedArguments = encodeURIComponent(stringifiedArguments);
    targetURL.searchParams.set("payload", encodedArguments);

    const source = new EventSource(targetURL.toString());
    sourceRef.current = source;

    source.addEventListener("open", () => {
      setIsConnected(true);
    });

    source.addEventListener("error", () => {
      if (onErrorRef.current) {
        onErrorRef.current("Failed to connect.");
      }
      setIsConnected(false);
    });

    source.addEventListener("message", (ev) => {
      if (!ev.data) {
        console.error("Message with no data received");
        return;
      }
      try {
        const data = JSON.parse(ev.data);
        setMessages((prev) => [...prev, data]);
      } catch {
        if (onErrorRef.current) {
          onErrorRef.current("Failed to decode data");
        }
      }
    });

    source.addEventListener("close", () => {
      source.close();
      if (onCloseRef.current) {
        onCloseRef.current();
      }
    });

    return () => {
      source.close();
      sourceRef.current = null;
      setIsConnected(false);
    };
  }, [args]);

  return {
    messages,
    isConnected,
  };
}

export const GreetingechoBidirectionalInputSchema = z
  .object({ msg: z.string() })
  .strict();
export type GreetingechoOutputType = {
  msg: string;
};

export function useGreetingechoBidirectional(
  options: UseWebSocketOptions = {},
): UseWebSocketReturn<
  z.infer<typeof GreetingechoBidirectionalInputSchema>,
  GreetingechoOutputType
> {
  /*Echo's back the given message*/

  const baseUrl = getApiBaseUrl();
  const protocol = baseUrl.startsWith("https") ? "wss:" : "ws:";
  const host = baseUrl.replace(/^https?:\/\//, "");
  const targetURL = `${protocol}//${host}/_api/Greeting/echo`;
  return useWebSocket<
    z.infer<typeof GreetingechoBidirectionalInputSchema>,
    GreetingechoOutputType
  >(targetURL, options);
}
//----
