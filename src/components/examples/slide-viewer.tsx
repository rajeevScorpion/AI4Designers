import { SlideViewer } from '../slide-viewer'
import type { CourseSection } from '@shared/schema'

export default function SlideViewerExample() {
  const mockSections: CourseSection[] = [
    {
      id: "intro-1",
      type: "content",
      title: "What is Artificial Intelligence?",
      content: `
        <h3>Understanding AI Fundamentals</h3>
        <p>Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines capable of performing tasks that typically require human intelligence.</p>
        
        <h4>Key Concepts:</h4>
        <ul>
          <li><strong>Machine Learning:</strong> Algorithms that improve through experience without being explicitly programmed</li>
          <li><strong>Neural Networks:</strong> Computing systems inspired by biological neural networks</li>
          <li><strong>Deep Learning:</strong> Machine learning using multi-layered neural networks</li>
          <li><strong>Generative AI:</strong> AI systems that can create new content, images, text, or designs</li>
        </ul>
        
        <h4>AI in Creative Industries</h4>
        <p>For designers, AI opens up new possibilities for creativity, automation, and enhanced productivity. From generating initial concepts to refining final designs, AI tools are becoming essential in modern design workflows.</p>
      `
    },
    {
      id: "intro-2",
      type: "activity",
      title: "Explore AI Design Tools",
      activity: {
        id: "ai-tools-exploration",
        title: "Hands-on AI Tool Experience",
        description: "Get familiar with popular AI tools by trying them out yourself.",
        platforms: [
          {
            name: "ChatGPT",
            url: "https://chat.openai.com",
            description: "AI assistant for writing, brainstorming, and creative content generation",
            isRecommended: true
          },
          {
            name: "Midjourney",
            url: "https://midjourney.com",
            description: "AI-powered image generation tool for creating stunning visual artwork",
            isRecommended: true
          }
        ],
        instructions: [
          "Choose one of the recommended platforms to start with",
          "Create a free account if you don't already have one",
          "Try generating simple content related to design",
          "Experiment with different prompts and see how the AI responds"
        ]
      }
    },
    {
      id: "intro-3",
      type: "quiz",
      title: "Knowledge Check",
      quiz: {
        id: "intro-quiz",
        questions: [
          {
            id: "q1",
            question: "What does AI stand for?",
            type: "multiple-choice",
            options: ["Artificial Intelligence", "Automated Information", "Advanced Integration", "Applied Innovation"],
            correctAnswer: 0,
            explanation: "AI stands for Artificial Intelligence, which refers to computer systems that can perform tasks typically requiring human intelligence."
          },
          {
            id: "q2",
            question: "Generative AI can create new content like images and text.",
            type: "true-false",
            options: ["True", "False"],
            correctAnswer: 0,
            explanation: "True. Generative AI specifically refers to AI systems that can create new content rather than just analyze existing data."
          }
        ]
      }
    }
  ]

  return (
    <div className="p-6">
      <SlideViewer
        sections={mockSections}
        dayTitle="Introduction to AI"
        dayId={1}
        onSectionComplete={(sectionId) => console.log(`Section ${sectionId} completed`)}
        onQuizComplete={(quizId, score) => console.log(`Quiz ${quizId} completed with score: ${score}%`)}
        completedSections={[]}
        quizScores={{}}
      />
    </div>
  )
}