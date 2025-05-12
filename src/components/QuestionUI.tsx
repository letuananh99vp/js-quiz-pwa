import { useState } from "react";
import type { IQuestion } from "../models/questions";
import { BiChevronDown } from "react-icons/bi";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/esm/styles/prism";

interface QuestionUIProps {
  question: IQuestion;
  onAnswer: (isCorrect: boolean, key: string) => void;
  selectedOption: string;
}

export default function QuestionUI(props: QuestionUIProps) {
  const { question, onAnswer, selectedOption } = props;
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const { explanation, id, options, text, code = "" } = question;

  const onAnswerClick = (key: string, isCorrect: boolean) => {
    onAnswer(isCorrect, key);
  };

  return (
    <div className="max-w-4xl w-full mx-auto px-4 pb-10">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h2
            className="text-xl font-medium mb-6"
            dangerouslySetInnerHTML={{ __html: `(${id}) ${text}` }}
          ></h2>

          {/* Code snippet */}
          {code && (
            <SyntaxHighlighter
              language="javascript"
              style={dracula}
              customStyle={{
                borderRadius: "0.75rem",
                fontSize: "16px",
                marginBottom: "1.5rem",
                padding: "1rem",
              }}
            >
              {code}
            </SyntaxHighlighter>
          )}

          {/* Options */}
          <div className="space-y-2">
            {options.map((option) => (
              <div
                key={option.key}
                className={`border rounded-md p-2 ${
                  !selectedOption && "cursor-pointer"
                } ${
                  selectedOption && option.isCorrect
                    ? "border-2 border-green-800 bg-[rgba(0,100,0,0.25)]"
                    : selectedOption === option.key
                    ? "border-2 border-[rgb(100,0,0)] bg-[rgba(100,0,0,0.25)]"
                    : !selectedOption && "hover:bg-gray-50"
                }`}
                onClick={() =>
                  !selectedOption && onAnswerClick(option.key, option.isCorrect)
                }
              >
                <p
                  dangerouslySetInnerHTML={{
                    __html: `${option.key} | ${option.text}`,
                  }}
                />
              </div>
            ))}
          </div>

          {/* Explanation toggle */}
          <div
            className={`mt-6 mb-4 flex items-center justify-between ${
              selectedOption ? "cursor-pointer" : "text-gray-400"
            }`}
            onClick={() =>
              selectedOption && setShowExplanation(!showExplanation)
            }
          >
            <div className="font-medium">Show explanation</div>
            <BiChevronDown
              className={`w-5 h-5 transition-transform ${
                showExplanation ? "transform rotate-180" : ""
              }`}
            />
          </div>

          {/* Explanation content */}
          {showExplanation &&
            explanation
              .split(/\n\s*\n/)
              .map((para, idx) => (
                <p
                  key={idx}
                  className="mb-2"
                  dangerouslySetInnerHTML={{ __html: para }}
                />
              ))}
        </div>
      </div>
    </div>
  );
}
