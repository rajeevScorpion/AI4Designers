import { DayNavigation } from '../day-navigation'

export default function DayNavigationExample() {
  const mockDays = [
    {
      id: 1,
      title: "Introduction to AI & Design",
      description: "Explore the fundamentals of AI and how it's transforming the design industry",
      estimatedTime: "30 min",
      isCompleted: true,
      isActive: false,
      progress: 100
    },
    {
      id: 2,
      title: "Understanding AI Tools",
      description: "Discover popular AI tools and platforms used by designers today",
      estimatedTime: "45 min",
      isCompleted: false,
      isActive: true,
      progress: 35
    },
    {
      id: 3,
      title: "Generative AI for Visual Design",
      description: "Learn how to use AI for creating images, graphics, and visual content",
      estimatedTime: "60 min",
      isCompleted: false,
      isActive: false,
      progress: 0
    },
    {
      id: 4,
      title: "AI-Powered Design Workflows",
      description: "Integrate AI into your design process for enhanced productivity",
      estimatedTime: "50 min",
      isCompleted: false,
      isActive: false,
      progress: 0
    },
    {
      id: 5,
      title: "Future of AI in Design",
      description: "Explore emerging trends and prepare for the future of AI-assisted design",
      estimatedTime: "40 min",
      isCompleted: false,
      isActive: false,
      progress: 0
    }
  ]

  return (
    <DayNavigation 
      days={mockDays} 
      onDaySelect={(dayId) => console.log(`Selected day ${dayId}`)} 
    />
  )
}