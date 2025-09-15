import { SectionContent } from '../section-content'

export default function SectionContentExample() {
  const mockSection = {
    id: "intro-content",
    type: "content" as const,
    title: "What is Artificial Intelligence?",
    content: `
      <p>Artificial Intelligence (AI) is a branch of computer science that aims to create intelligent machines capable of performing tasks that typically require human intelligence.</p>
      
      <h4>Key Concepts:</h4>
      <ul>
        <li><strong>Machine Learning:</strong> Algorithms that improve through experience</li>
        <li><strong>Neural Networks:</strong> Computing systems inspired by biological neural networks</li>
        <li><strong>Deep Learning:</strong> Machine learning using multi-layered neural networks</li>
        <li><strong>Generative AI:</strong> AI that can create new content, images, text, or designs</li>
      </ul>
      
      <p>For designers, AI opens up new possibilities for creativity, automation, and enhanced productivity in the design process.</p>
    `
  }

  return (
    <SectionContent
      section={mockSection}
      isCompleted={false}
      onMarkComplete={(sectionId) => console.log(`Completed section: ${sectionId}`)}
    />
  )
}