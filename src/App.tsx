import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { parseQuestionsFromMarkdown } from "./utils/parseQuestionsFromMarkdown";
import QuestionUI from "./components/QuestionUI";
import ScoreNavbar from "./components/ScoreNavbar";
import Pagination from "./components/Pagination";
import type { IQuestion, IStatusAnswer } from "./types/questions";
import LoadingScreen from "./components/LoadingScreen";
const PAGE_SIZE = 10;
const LOCAL_STORAGE_KEY = "answer";

export default function App() {
  const saveAnswerMapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusAnswer, setStatusAnswer] = useState<IStatusAnswer>({
    correct: 0,
    incorrect: 0,
  });
  const [answerMap, setAnswerMap] = useState<Record<string, string>>({});

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
        setLoading(false);
      });
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <div>
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
