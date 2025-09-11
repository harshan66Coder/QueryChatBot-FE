import React, { useState, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { MdKeyboardVoice } from "react-icons/md";
import { IoStopCircleOutline, IoSendSharp } from "react-icons/io5";
import { CiCircleRemove } from "react-icons/ci";

const HumanQuestion = ({ isDark }) => {
  const [style, setStyle] = useState("sinewave");

  const [text, setText] = useState("");
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    setText(transcript);
  }, [transcript]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Your browser does not support speech recognition.</span>;
  }

  const handleStartListening = () => {
    SpeechRecognition.startListening({ continuous: true, language: "en-US" });
  };

  const handleStopListening = () => {
    SpeechRecognition.stopListening();
  };

  const handleReset = () => {
    resetTranscript();
    setText("");
  };

  return (
    <div
      className={`px-5 py-4 mx-auto rounded-md shadow-md transition duration-300 ${isDark ? "bg-[#1c1d1e] text-white" : "bg-white text-black"
        }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">
          Ask a question and provide context about your dataset
        </h1>
      </div>

      <div className="mb-4">


      </div>

      <div className="flex">
        <textarea
          className={`w-full p-2 border mt-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${isDark
            ? "bg-gray-800 text-white border-gray-600 placeholder-gray-400"
            : "bg-white text-black border-gray-300"
            }`}
          rows="1"
          placeholder={listening ? "Listening..." : "Enter your question here..."}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <div className="flex gap-3 ml-2 mt-3 p-3">
          {!listening ? (
            <button
              onClick={handleStartListening}
              className="p-1 bg-blue-600 rounded-full cursor-pointer hover:scale-105 transition animated-gradient"
              title="Start voice input"
            >
              <div className="">

                <MdKeyboardVoice size={30} color="white" />
              </div>
            </button>
          ) : (
            <button
              onClick={handleStopListening}
              className="p-2 bg-red-600 rounded-full cursor-pointer hover:scale-105 transition"
              title="Stop voice input"
            >
              <IoStopCircleOutline size={28} color="white" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-3 items-center">
        {text && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 cursor-pointer bg-gray-500 text-white px-3 py-2 rounded hover:bg-gray-600 transition"
          >
            <CiCircleRemove size={22} />
            Clear
          </button>
        )}

        {text && (
          <button
            className="flex items-center gap-2 bg-blue-700 cursor-pointer  text-white px-3 py-2 rounded hover:bg-white hover:text-blue-700 border border-blue-700 transition"
          >
            <IoSendSharp size={20} />
            Send
          </button>
        )}
      </div>
    </div>
  );
};

export default HumanQuestion;
