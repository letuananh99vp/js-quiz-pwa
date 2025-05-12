import axios from "axios";
import { useEffect, useState } from "react";
import type { IQuestion, IStatusAnswer } from "./models/questions";
import { parseQuestionsFromMarkdown } from "./utils/parseQuestionsFromMarkdown";
import QuestionUI from "./components/QuestionUI";
import ScoreNavbar from "./components/ScoreNavbar";
import Pagination from "./components/Pagination";

const PAGE_SIZE = 10;

export default function App() {
  const [questions, setQuestions] = useState<IQuestion[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [statusAnswer, setStatusAnswer] = useState<IStatusAnswer>({
    correct: 0,
    incorrect: 0,
  });

  const onAnswer = (isCorrect: boolean) => {
    setStatusAnswer((prev) => ({
      ...prev,
      correct: isCorrect ? prev.correct + 1 : prev.correct,
      incorrect: isCorrect ? prev.incorrect : prev.incorrect + 1,
    }));
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
          src="src/assets/logo.png"
          alt="Logo"
          className="w-12 h-12 rounded-xl"
        />
      </div>
    );
  if (error) return <div>{error}</div>;

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
            onAnswer={onAnswer}
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
