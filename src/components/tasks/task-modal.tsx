"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import type { Task, Question } from "@/lib/types"
import toast from "react-hot-toast"
import { db } from "@/lib/firebase"
import { collection, addDoc, runTransaction, doc } from "firebase/firestore"

interface TaskModalProps {
  task: Task | null
  isOpen: boolean
  onClose: () => void
  onComplete: () => void
  userId: string
}

export default function TaskModal({ task, isOpen, onClose, onComplete, userId }: TaskModalProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!task) return null

  const questions = task.questions || []
  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answer,
    }))
  }

  const handleNext = () => {
    if (currentQuestion && !answers[currentQuestion.id]) {
      toast.error("Please answer the question before proceeding")
      return
    }

    if (isLastQuestion) {
      handleSubmit()
    } else {
      setCurrentQuestionIndex((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await runTransaction(db, async (transaction) => {
        // 1. Create user_task record
        const userTaskRef = doc(collection(db, "user_tasks"))
        transaction.set(userTaskRef, {
          user_id: userId,
          task_id: task.id,
          status: "completed",
          answers: answers,
          completed_at: new Date().toISOString(),
          reward_paid: task.reward_amount,
          created_at: new Date().toISOString(),
        })

        // 2. Update user balance
        const userRef = doc(db, "users", userId)
        const userDoc = await transaction.get(userRef)
        if (userDoc.exists()) {
          const newBalance = (userDoc.data().balance || 0) + task.reward_amount
          const newTotalEarned = (userDoc.data().total_earned || 0) + task.reward_amount
          transaction.update(userRef, { balance: newBalance, total_earned: newTotalEarned })
        } else {
          throw new Error("User not found.")
        }
      })

      toast.success(`Task completed! You earned ₦${task.reward_amount}`)
      onComplete()
      onClose()
    } catch (error: any) {
      toast.error(error.message || "Failed to submit task")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case "multiple_choice":
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label
                key={index}
                className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name={question.id}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={(e) => handleAnswer(question.id, e.target.value)}
                  className="mr-3"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>
        )

      case "text":
        return (
          <textarea
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            placeholder="Type your answer here..."
            className="w-full p-4 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
          />
        )

      case "boolean":
        return (
          <div className="space-y-3">
            <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="true"
                checked={answers[question.id] === true}
                onChange={() => handleAnswer(question.id, true)}
                className="mr-3"
              />
              <span>Yes</span>
            </label>
            <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name={question.id}
                value="false"
                checked={answers[question.id] === false}
                onChange={() => handleAnswer(question.id, false)}
                className="mr-3"
              />
              <span>No</span>
            </label>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{task.title}</h2>
                <p className="text-sm text-gray-600">Reward: ₦{task.reward_amount}</p>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {questions.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Simple Task</h3>
                  <p className="text-gray-600 mb-6">{task.description}</p>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center">
                        <Spinner size="sm" className="mr-2" />
                        Completing...
                      </div>
                    ) : (
                      "Complete Task"
                    )}
                  </Button>
                </div>
              ) : (
                <div>
                  {/* Progress */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Question {currentQuestionIndex + 1} of {questions.length}
                      </span>
                      <span className="text-sm text-gray-500">
                        {Math.round(((currentQuestionIndex + 1) / questions.length) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${((currentQuestionIndex + 1) / questions.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Question */}
                  {currentQuestion && (
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{currentQuestion.question}</h3>
                      {renderQuestion(currentQuestion)}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Footer */}
            {questions.length > 0 && (
              <div className="flex items-center justify-between p-6 border-t border-gray-200">
                <Button onClick={handlePrevious} disabled={currentQuestionIndex === 0} variant="outline">
                  Previous
                </Button>

                <Button
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  {isSubmitting ? (
                    <div className="flex items-center">
                      <Spinner size="sm" className="mr-2" />
                      Submitting...
                    </div>
                  ) : isLastQuestion ? (
                    "Submit Task"
                  ) : (
                    "Next"
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
