import type { IQuestion, IQuestionOption } from "../types/questions";

export function parseQuestionsFromMarkdown(md: string): IQuestion[] {
  const questionBlocks = md.split("###### ").slice(1); // Bỏ phần đầu file
  const questions: IQuestion[] = [];

  questionBlocks.forEach((block) => {
    // Lấy tiêu đề câu hỏi
    const titleMatch = block.match(/^([0-9]+)\. (.+?)\n/);
    if (!titleMatch) return;
    const id = Number(titleMatch[1]);
    const text = titleMatch[2].trim().replace(/`(.*?)`/g, "<code>$1</code>");

    // Lấy code (nếu có)
    const codeMatch = block.match(/```javascript\n([\s\S]*?)```/);
    const code = codeMatch ? codeMatch[1].trim() : undefined;

    // Lấy đáp án
    const options: IQuestionOption[] = [];
    const optionLines = block.match(/- [A-E]: .+/g) || [];
    optionLines.forEach((line) => {
      const [key, text] = line.match(/- ([A-E]): (.+)/)?.slice(1) || [];
      if (key && text) {
        options.push({
          key,
          text: text.replace(/`(.*?)`/g, "<code>$1</code>"),
          isCorrect: false,
        });
      }
    });

    // Lấy đáp án đúng
    const answerMatch = block.match(/#### Answer: ([A-E])/);
    const correctKey = answerMatch ? answerMatch[1] : undefined;
    if (correctKey) {
      options.forEach((o) => {
        if (o.key === correctKey) o.isCorrect = true;
      });
    }

    // Lấy giải thích
    const explanationMatch = block.match(/<p>([\s\S]*?)<\/p>/i);
    const explanation = explanationMatch
      ? explanationMatch[1]
          .trim()
          .replace(/#### Answer: [A-E]\n*/g, "")
          .replace(/`(.*?)`/g, "<code>$1</code>")
      : "";

    questions.push({
      id,
      text,
      code,
      options,
      explanation,
      correctKey,
    });
  });

  return questions;
}
