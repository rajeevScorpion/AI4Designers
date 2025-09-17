import { QuizSection } from '../quiz-section'

export default function QuizSectionExample() {
  const mockQuiz = {
    id: "ai-basics-quiz",
    questions: [
      {
        id: "q1",
        question: "What does AI stand for?",
        type: "multiple-choice" as const,
        options: [
          "Artificial Intelligence",
          "Automated Information", 
          "Advanced Integration",
          "Applied Innovation"
        ],
        correctAnswer: 0,
        explanation: "AI stands for Artificial Intelligence, which refers to computer systems that can perform tasks typically requiring human intelligence."
      },
      {
        id: "q2",
        question: "Machine Learning is a subset of AI that focuses on algorithms improving through experience.",
        type: "true-false" as const,
        options: ["True", "False"],
        correctAnswer: 0,
        explanation: "True. Machine Learning is indeed a subset of AI where algorithms learn and improve their performance on a specific task through experience without being explicitly programmed."
      },
      {
        id: "q3",
        question: "Which of the following is an example of generative AI?",
        type: "multiple-choice" as const,
        options: [
          "A search engine",
          "A calculator app",
          "An image generation tool like DALL-E",
          "A weather app"
        ],
        correctAnswer: 2,
        explanation: "Generative AI creates new content. DALL-E is a perfect example as it generates images from text descriptions, unlike the other options which retrieve or process existing information."
      }
    ]
  }

  return (
    <QuizSection
      quiz={mockQuiz}
      isCompleted={false}
      onQuizComplete={(quizId, score) => console.log(`Quiz ${quizId} completed with score: ${score}%`)}
      onQuizRetake={(quizId) => console.log(`Quiz ${quizId} retaken`)}
    />
  )
}