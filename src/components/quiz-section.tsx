import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { CheckCircle, Brain, AlertCircle, Award, Info, ArrowRight } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { Quiz } from "@shared/types"
import { useCourse } from "@/contexts/CourseContext"

interface QuizSectionProps {
  quiz: Quiz
  dayId?: number
  isCompleted: boolean
  isAccessible: boolean
  score?: number
  onQuizComplete: (quizId: string, score: number) => void
  onQuizRetake: (quizId: string) => void
  isFinalSection?: boolean
  allSectionsCompleted?: boolean
  onNextDay?: () => void
}

export function QuizSection({ quiz, dayId, isCompleted, isAccessible, score, onQuizComplete, onQuizRetake, isFinalSection = false, allSectionsCompleted = false, onNextDay }: QuizSectionProps) {
  const { updateQuizScore, getDayProgress, isLoading } = useCourse()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [showResults, setShowResults] = useState(isCompleted)
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, number>>({})

  // Load saved quiz state if available and dayId is provided
  useEffect(() => {
    if (dayId && !isLoading) {
      const dayProgress = getDayProgress(dayId)
      if (dayProgress) {
        // Show results if quiz is completed
        setShowResults(isCompleted)

        // If quiz has a score, it means it was completed before
        if (score !== undefined) {
          setSubmittedAnswers({}) // We don't store individual answers, just show results
        }
      }
    }
  }, [dayId, isCompleted, score, getDayProgress, isLoading])

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: parseInt(answer)
    }))
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = () => {
    console.log('Quiz submitted with answers:', answers)
    const correctAnswers = quiz.questions.filter(q => answers[q.id] === q.correctAnswer).length
    const finalScore = Math.round((correctAnswers / quiz.questions.length) * 100)

    setSubmittedAnswers(answers)
    setShowResults(true)

    // Save to context if dayId is provided
    if (dayId) {
      updateQuizScore(dayId, quiz.id, finalScore)
      // Mark the quiz section as completed
      updateSectionCompletion(dayId, sectionId, true)
    }
    onQuizComplete?.(quiz.id, finalScore)
  }

  const handleRetake = () => {
    setAnswers({})
    setCurrentQuestion(0)
    setShowResults(false)
    setSubmittedAnswers({})
    onQuizRetake(quiz.id)
  }

  const canSubmit = Object.keys(answers).length === quiz.questions.length

  const question = quiz.questions[currentQuestion]
  const isAnswered = question.id in answers

  // Show locked state if section is not accessible
  if (!isAccessible) {
    return (
      <Card className="p-6 opacity-60" data-testid={`quiz-${quiz.id}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-grey-500" />
            <h3 className="text-lg font-semibold text-grey-600">Knowledge Check</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-grey-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-grey-300 rounded-sm"></div>
            </div>
            <span className="text-sm text-grey-500">Locked</span>
          </div>
        </div>

        <div className="text-center py-8">
          <div className="w-12 h-12 bg-grey-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-6 h-6 bg-grey-400 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-grey-300 rounded-sm"></div>
            </div>
          </div>
          <p className="text-grey-600 mb-2">Complete the previous activity to unlock this quiz</p>
          <p className="text-sm text-grey-500">Activities must be completed in sequential order</p>
        </div>
      </Card>
    )
  }

  if (showResults) {
    const correctAnswers = quiz.questions.filter(q =>
      (submittedAnswers[q.id] ?? answers[q.id]) === q.correctAnswer
    ).length
    const finalScore = score ?? Math.round((correctAnswers / quiz.questions.length) * 100)
    const isPerfectScore = finalScore === 100

    return (
      <TooltipProvider>
        <Card className="p-6" data-testid={`quiz-${quiz.id}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Quiz Results</h3>
          </div>
          <Badge variant={finalScore >= 70 ? "default" : "secondary"} className="flex items-center gap-1">
            <Award className="w-3 h-3" />
            {finalScore}%
          </Badge>
        </div>

        <div className="space-y-4 mb-6">
          <div className="text-center p-6 bg-muted rounded-lg">
            <div className="text-3xl font-bold mb-2">{finalScore}%</div>
            <div className="text-muted-foreground">
              {correctAnswers} out of {quiz.questions.length} correct
            </div>
          </div>

          {/* Review answers */}
          <div className="space-y-4">
            {quiz.questions.map((q, index) => {
              const userAnswer = submittedAnswers[q.id] ?? answers[q.id]
              const isCorrect = userAnswer === q.correctAnswer

              return (
                <Card key={q.id} className="p-4">
                  <div className="flex items-start gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-chart-3 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-destructive mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-medium mb-2">Question {index + 1}: {q.question}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        Your answer: {q.options[userAnswer]}
                      </p>
                      {!isCorrect && (
                        <p className="text-sm text-chart-3 mb-2">
                          Correct answer: {q.options[q.correctAnswer]}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground">{q.explanation}</p>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleRetake}
              disabled={isPerfectScore}
              data-testid="button-quiz-retake"
              className={isPerfectScore ? "opacity-50 cursor-not-allowed" : ""}
            >
              Retake Quiz
            </Button>
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-4 h-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  Retaking will reset your progress from this quiz onwards
                </p>
              </TooltipContent>
            </Tooltip>
          </div>

          {!isCompleted && (
            <Button
              onClick={() => {
                if (dayId) {
                  updateSectionCompletion(dayId, sectionId, true)
                }
              }}
              data-testid="button-mark-completed"
            >
              Mark as Completed
            </Button>
          )}
        </div>
      </Card>
      </TooltipProvider>
    )
  }

  return (
    <Card className="p-6" data-testid={`quiz-${quiz.id}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Knowledge Check</h3>
        </div>
        <Badge variant="outline">
          Question {currentQuestion + 1} of {quiz.questions.length}
        </Badge>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="font-medium mb-4">{question.question}</h4>
          
          <RadioGroup
            value={answers[question.id]?.toString() || ""}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem 
                  value={index.toString()} 
                  id={`${question.id}-${index}`} 
                  data-testid={`radio-${question.id}-${index}`}
                />
                <Label 
                  htmlFor={`${question.id}-${index}`}
                  className="flex-1 cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            data-testid="button-quiz-previous"
          >
            Previous
          </Button>

          <div className="flex gap-2">
            {currentQuestion < quiz.questions.length - 1 ? (
              <Button 
                onClick={handleNext}
                disabled={!isAnswered}
                data-testid="button-quiz-next"
              >
                Next Question
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={!canSubmit}
                data-testid="button-quiz-submit"
              >
                Submit Quiz
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}