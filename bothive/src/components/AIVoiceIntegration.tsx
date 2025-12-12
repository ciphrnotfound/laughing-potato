"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Volume2 } from "lucide-react";

export default function AIVoiceIntegration() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [response, setResponse] = useState("");
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const transcript = event.results[current][0].transcript;
        setTranscript(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript("");
    }
  };

  const speak = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          AI Voice Assistant
        </h2>

        <div className="space-y-6">
          {/* Voice Input */}
          <div className="flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleListening}
              className={`p-6 rounded-full transition-colors ${
                isListening
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-violet-500 hover:bg-violet-600"
              }`}
            >
              {isListening ? (
                <MicOff className="w-8 h-8 text-white" />
              ) : (
                <Mic className="w-8 h-8 text-white" />
              )}
            </motion.button>
          </div>

          {/* Transcript */}
          {transcript && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg"
            >
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                You said:
              </p>
              <p className="text-gray-900 dark:text-white">{transcript}</p>
            </motion.div>
          )}

          {/* Response */}
          {response && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-violet-100 dark:bg-violet-900 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-violet-600 dark:text-violet-300">
                  AI Response:
                </p>
                <button
                  onClick={() => speak(response)}
                  className="p-2 rounded hover:bg-violet-200 dark:hover:bg-violet-800 transition-colors"
                >
                  <Volume2 className="w-4 h-4 text-violet-600 dark:text-violet-300" />
                </button>
              </div>
              <p className="text-gray-900 dark:text-white">{response}</p>
            </motion.div>
          )}

          {/* Status */}
          <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            {isListening ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                Listening...
              </span>
            ) : isSpeaking ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-violet-500 rounded-full animate-pulse"></span>
                Speaking...
              </span>
            ) : (
              "Click the microphone to start"
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}