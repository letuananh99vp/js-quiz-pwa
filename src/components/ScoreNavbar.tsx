interface ScoreNavbarProps {
  correct: number;
  incorrect: number;
  remaining: number;
}

export default function ScoreNavbar({
  correct,
  incorrect,
  remaining,
}: ScoreNavbarProps) {
  return (
    <div className="sticky top-0 z-30 bg-white rounded-t-xl shadow flex justify-between items-center px-12 py-4 mb-6">
      <div className="text-green-800 text-xl font-semibold">
        Correct: <span>{correct}</span>
      </div>
      <div className="text-red-800 text-xl font-semibold">
        Incorrect: <span>{incorrect}</span>
      </div>
      <div className="text-black text-xl font-semibold">
        Remaining: <span>{remaining}</span>
      </div>
    </div>
  );
}
