import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { parseQuestionsFromMarkdown } from "./utils/parseQuestionsFromMarkdown";
import QuestionUI from "./components/QuestionUI";
import ScoreNavbar from "./components/ScoreNavbar";
import Pagination from "./components/Pagination";
import type { IQuestion, IStatusAnswer } from "./types/questions";
import { registerSW } from "virtual:pwa-register";

const updateSW = registerSW({
  onNeedRefresh() {
    window.dispatchEvent(new CustomEvent("pwa-update-ready"));
  },
});

const PAGE_SIZE = 10;
const LOCAL_STORAGE_KEY = "answer";

export default function App() {
  const saveAnswerMapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusAnswer, setStatusAnswer] = useState<IStatusAnswer>({
    correct: 0,
    incorrect: 0,
  });
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});
  const [show, setShow] = useState<boolean>(false);

  useEffect(() => {
    const answer = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (answer && questions.length > 0) {
      const data = JSON.parse(answer);
      setAnswerMap(data);
      Object.keys(data).forEach((key) => {
        const question = questions.find((q) => q.id === Number(key));
        if (question) {
          setStatusAnswer((prev) => ({
            ...prev,
            correct: prev.correct + (question.correctKey === data[key] ? 1 : 0),
            incorrect:
              prev.incorrect + (question.correctKey !== data[key] ? 1 : 0),
          }));
        }
      });
    }
  }, [questions]);

  useEffect(() => {
    // const checkStandaloneMode = () => {
    //   const isInStandaloneMode =
    //     "standalone" in window.navigator && window.navigator.standalone;
    //   console.log("isInStandaloneMode", isInStandaloneMode);
    //   if (isInStandaloneMode) {
    //     setIsInPWA(true);
    //   }
    // };

    // checkStandaloneMode();

    const handleUpdateAvailable = () => {
      setShow(true);
      console.log("Update available");
    };
    window.addEventListener("pwa-update-ready", handleUpdateAvailable);

    return () => {
      window.removeEventListener("pwa-update-ready", handleUpdateAvailable);
    };
  }, []);

  const reload = () => {
    updateSW(true);
    setShow(false);
  };

  const onAnswer = (isCorrect: boolean, data: { [key: string]: string }) => {
    setAnswerMap((prev) => ({
      ...prev,
      ...data,
    }));
    setStatusAnswer((prev) => ({
      ...prev,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: isCorrect ? prev.incorrect : prev.incorrect + 1,
    }));

    if (saveAnswerMapTimeoutRef.current) {
      clearTimeout(saveAnswerMapTimeoutRef.current);
    }
    saveAnswerMapTimeoutRef.current = setTimeout(() => {
      setAnswerMap((latest) => {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(latest));
        return latest;
      });
    }, 5000);
  };

  const onChangePage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0 });
  };

  useEffect(() => {
    axios
      .get(
        "https://raw.githubusercontent.com/lydiahallie/javascript-questions/master/README.md"
      )
      .then((res) => {
        const arr = parseQuestionsFromMarkdown(res.data);
        setQuestions(arr);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch data");
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <img
          src="pwa-512x512.png"
          alt="Logo"
          className="w-12 h-12 rounded-xl"
        />
      </div>
    );
  if (error) return <div>{error}</div>;

  return (
    <div>
      {show && (
        <div className="fixed inset-0 flex items-center justify-center bg-[rgba(209,213,219,0.3)] z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
            <h2 className="text-lg font-bold text-gray-800 mb-2">
              Cập nhật mới có sẵn
            </h2>
            <p className="text-gray-600 mb-4">
              Tải lại để sử dụng phiên bản mới của ứng dụng.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={reload}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cập nhật ngay
              </button>
            </div>
          </div>
        </div>
      )}

      <ScoreNavbar
        correct={statusAnswer.correct}
        incorrect={statusAnswer.incorrect}
        remaining={
          questions.length - statusAnswer.correct - statusAnswer.incorrect
        }
      />
      <Pagination
        current={currentPage}
        totalRecords={questions.length}
        pageSize={PAGE_SIZE}
        onChange={onChangePage}
      />
      {questions
        .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
        .map((question) => (
          <QuestionUI
            key={question.id}
            question={question}
            onAnswer={(isCorrect, key) =>
              onAnswer(isCorrect, { [question.id]: key })
            }
            selectedOption={answerMap[question.id]}
          />
        ))}
      <Pagination
        current={currentPage}
        totalRecords={questions.length}
        pageSize={PAGE_SIZE}
        onChange={onChangePage}
      />
    </div>
  );
}
