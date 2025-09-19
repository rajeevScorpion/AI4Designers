import { ActivitySection } from '../activity-section'

export default function ActivitySectionExample() {
  const mockActivity = {
    id: "ai-tools-exploration",
    title: "Explore AI Design Tools",
    description: "Get hands-on experience with popular AI tools used by designers. Try creating simple designs or generating content using these platforms.",
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
      },
      {
        name: "Figma AI",
        url: "https://figma.com",
        description: "Design tool with AI-powered features for rapid prototyping and design assistance",
        isRecommended: false
      },
      {
        name: "Adobe Firefly",
        url: "https://firefly.adobe.com",
        description: "Generative AI for creative workflows, integrated with Adobe Creative Suite",
        isRecommended: false
      }
    ],
    instructions: [
      "Choose one of the recommended platforms to start with",
      "Create a free account if you don't already have one",
      "Try generating a simple design or piece of content related to your interests",
      "Experiment with different prompts and settings to see how the AI responds",
      "Take note of the quality and usefulness of the generated content",
      "Reflect on how this tool could fit into your design workflow"
    ]
  }

  return (
    <ActivitySection
      activity={mockActivity}
      sectionId="example-section"
      isCompleted={false}
      isAccessible={true}
      onMarkComplete={(activityId) => console.log(`Completed activity: ${activityId}`)}
    />
  )
}