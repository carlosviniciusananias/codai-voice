"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";

type SpeechRecognitionResultLike = {
  isFinal: boolean;
  0: { transcript: string };
  length: number;
};

type SpeechRecognitionEventLike = {
  results: SpeechRecognitionResultLike[];
};

type WebSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type VoiceInputProps = {
  onTranscription: (text: string) => void;
  onError?: (message: string) => void;
  language?: string;
};

function getRecognitionConstructor(): (new () => WebSpeechRecognition) | null {
  if (typeof window === "undefined") {
    return null;
  }

  const w = window as unknown as {
    SpeechRecognition?: new () => WebSpeechRecognition;
    webkitSpeechRecognition?: new () => WebSpeechRecognition;
  };

  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export default function VoiceInput({
  onTranscription,
  onError,
  language = "pt-BR",
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<WebSpeechRecognition | null>(null);

  useEffect(() => {
    const Ctor = getRecognitionConstructor();

    if (!Ctor) {
      setIsSupported(false);
      if (onError) {
        onError("Web Speech API not supported.");
      }
      return;
    }

    setIsSupported(true);

    return () => {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
    };
  }, [onError]);

  const handleToggleRecording = useCallback(() => {
    const Ctor = getRecognitionConstructor();

    if (!Ctor) {
      setIsSupported(false);
      onError?.("Web Speech API not supported.");
      return;
    }

    if (!recognitionRef.current) {
      const recognition = new Ctor();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let finalTranscript = "";

        for (let index = 0; index < event.results.length; index += 1) {
          const result = event.results[index];

          if (result.isFinal && result.length > 0) {
            finalTranscript += result[0].transcript;
          }
        }

        const text = finalTranscript.trim();

        if (text) {
          onTranscription(text);
        }
      };

      recognition.onerror = (event: { error: string }) => {
        setIsRecording(false);

        if (event.error === "not-allowed") {
          onError?.("Microphone permission denied.");
          return;
        }

        onError?.(`Error: ${event.error}`);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }

    const recognition = recognitionRef.current;

    if (!recognition) {
      return;
    }

    if (!isRecording) {
      try {
        recognition.start();
        setIsRecording(true);
      } catch {
        setIsRecording(false);
        onError?.("Recording could not be started.");
      }
    } else {
      recognition.stop();
      setIsRecording(false);
    }
  }, [isRecording, language, onError, onTranscription]);

  const isDisabled = !isSupported;

  const label = !isSupported
    ? "Voice recognition not supported."
    : isRecording
      ? "Stop recording"
      : "Start recording";

  return (
    <button
      type="button"
      onClick={handleToggleRecording}
      disabled={isDisabled}
      aria-pressed={isRecording}
      aria-label={label}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 ${
        isRecording
          ? "border-red-600 bg-red-600 text-white hover:bg-red-700"
          : "border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-100"
      }`}
    >
      {isRecording ? (
        <Square className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Mic className="h-4 w-4" aria-hidden="true" />
      )}
      <span>{isRecording ? "Gravando..." : "Record"}</span>
    </button>
  );
}
