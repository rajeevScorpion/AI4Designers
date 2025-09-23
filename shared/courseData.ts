import type { CourseSection } from "./types";

export const courseData: Record<number, CourseSection[]> = {
  1: [
    {
      id: "day1-intro",
      type: "content",
      title: "What is Artificial Intelligence?",
      contentIntro: `
        <h3>Welcome to AI Fundamentals for Designers</h3>
        <p>Welcome to your 5-day journey into Artificial Intelligence! This course is specifically designed for first-year design students who want to understand how AI can enhance their creative work.</p>
        
        <h4>What You'll Learn Today</h4>
        <ul>
          <li>The fundamentals of Artificial Intelligence</li>
          <li>Different types of AI and how they work</li>
          <li>Real-world applications in creative industries</li>
          <li>How AI is transforming design workflows</li>
        </ul>
        
        <h4>Understanding AI: The Basics</h4>
        <p>Artificial Intelligence (AI) is a branch of computer science that creates machines capable of performing tasks that typically require human intelligence. Think of it as teaching computers to "think" and make decisions.</p>
        
        <h4>Key AI Concepts for Designers</h4>
        <p>Click on each card below to learn more about these fundamental AI concepts:</p>
      `,
      flipCards: [
        {
          title: "Machine Learning",
          description: "Machine Learning is a subset of AI where algorithms learn patterns from data without being explicitly programmed. It's like teaching a computer through examples rather than instructions. In design, ML powers personalization features, user behavior prediction, and A/B testing optimization."
        },
        {
          title: "Neural Networks",
          description: "Neural Networks are computing systems inspired by the human brain's interconnected neurons. They process information in layers, recognizing patterns and making decisions. These networks are the foundation of modern AI, enabling everything from image recognition to natural language understanding."
        },
        {
          title: "Deep Learning",
          description: "Deep Learning uses neural networks with many layers (hence 'deep') to process complex data. It excels at tasks like image classification, speech recognition, and language translation. For designers, deep learning powers tools that can understand visual aesthetics and generate creative content."
        },
        {
          title: "Generative AI",
          description: "Generative AI creates entirely new content—text, images, music, or code—based on patterns learned from training data. Tools like DALL-E, Midjourney, and ChatGPT are revolutionizing creative workflows by helping designers generate ideas, create variations, and explore new possibilities."
        },
        {
          title: "Computer Vision",
          description: "Computer Vision enables AI to 'see' and understand visual information from images and videos. It can detect objects, recognize faces, and analyze scenes. Designers use computer vision for tasks like automatic image tagging, content-aware editing, and augmented reality experiences."
        },
        {
          title: "Natural Language Processing",
          description: "NLP allows AI to understand, interpret, and generate human language. It powers chatbots, translation services, and content creation tools. For designers, NLP is invaluable for generating copy, conducting user research through sentiment analysis, and creating conversational interfaces."
        }
      ],
      contentOutro: `
        <h4>Why AI Matters for Designers</h4>
        <p>AI isn't here to replace designers—it's here to supercharge your creativity. Modern AI tools can help you:</p>
        <ul>
          <li>Generate initial concepts and mood boards</li>
          <li>Create variations of existing designs</li>
          <li>Automate repetitive tasks</li>
          <li>Enhance images and graphics</li>
          <li>Write compelling copy and content</li>
          <li>Conduct user research and testing</li>
        </ul>
      `
    },
    {
      id: "day1-history",
      type: "content", 
      title: "A Brief History of AI",
      content: `
        <h3>The Evolution of Artificial Intelligence</h3>
        <p>Understanding AI's history helps us appreciate where we are today and imagine where we're heading.</p>
        
        <h4>Timeline of AI Development</h4>
        <ul>
          <li><strong>1950s:</strong> Alan Turing proposes the "Turing Test" to measure machine intelligence</li>
          <li><strong>1956:</strong> The term "Artificial Intelligence" is coined at Dartmouth College</li>
          <li><strong>1960s-70s:</strong> Early AI programs for problem-solving and language processing</li>
          <li><strong>1980s:</strong> Expert systems become popular in business applications</li>
          <li><strong>1990s:</strong> Machine learning gains momentum with better algorithms</li>
          <li><strong>2000s:</strong> Internet provides massive data for training AI systems</li>
          <li><strong>2010s:</strong> Deep learning breakthroughs in image and speech recognition</li>
          <li><strong>2020s:</strong> Generative AI transforms creative industries</li>
        </ul>
        
        <h4>Recent Breakthroughs in Creative AI</h4>
        <p>The last few years have seen explosive growth in AI tools for creative work:</p>
        <ul>
          <li><strong>2021:</strong> DALL-E introduces text-to-image generation</li>
          <li><strong>2022:</strong> Midjourney and Stable Diffusion democratize AI art</li>
          <li><strong>2022:</strong> ChatGPT brings conversational AI to the masses</li>
          <li><strong>2023:</strong> GPT-4 and advanced multimodal AI systems</li>
          <li><strong>2024:</strong> Real-time AI generation and enhanced creative workflows</li>
        </ul>
        
        <h4>The Current AI Landscape</h4>
        <p>Today's AI ecosystem is rich and diverse, offering tools for every aspect of the creative process. From ideation to execution, AI is becoming an integral part of modern design workflows.</p>
      `
    },
    {
      id: "day1-video",
      type: "video",
      title: "Essential AI Concepts Explained",
      videos: [
        {
          title: "What Is Artificial Intelligence?",
          videoUrl: "https://www.youtube.com/embed/2ePf9rue1Ao",
          duration: "6 minutes",
          description: "Crash Course's engaging introduction to AI fundamentals, perfect for beginners"
        },
        {
          title: "How Does AI Actually Learn?",
          videoUrl: "https://www.youtube.com/embed/OeU5m6vRyCk",
          duration: "5 minutes",
          description: "TED-Ed's beautifully animated explanation of machine learning concepts"
        },
        {
          title: "The History and Future of AI",
          videoUrl: "https://www.youtube.com/embed/UwsrzCVZAb8",
          duration: "8 minutes",
          description: "A comprehensive overview of AI's evolution from the 1950s to today"
        }
      ]
    },
    {
      id: "day1-activity",
      type: "activity",
      title: "Explore AI Tools",
      activity: {
        id: "ai-tools-exploration",
        title: "Hands-on Experience with AI Tools",
        description: "Get familiar with popular AI tools by trying them out yourself. This hands-on experience will give you a feel for what AI can do.",
        platforms: [
          {
            name: "ChatGPT",
            url: "https://chat.openai.com",
            description: "Conversational AI for writing, brainstorming, and creative problem-solving",
            isRecommended: true
          },
          {
            name: "Claude",
            url: "https://claude.ai",
            description: "Advanced AI assistant for detailed analysis and creative tasks",
            isRecommended: true
          },
          {
            name: "Perplexity",
            url: "https://perplexity.ai",
            description: "AI-powered search engine for research and fact-finding",
            isRecommended: false
          }
        ],
        instructions: [
          "Choose one of the recommended platforms to start with",
          "Create a free account if you don't already have one",
          "Try asking the AI about design trends for 2024",
          "Ask it to help you brainstorm ideas for a mobile app design",
          "Experiment with different types of questions and prompts",
          "Take notes on what works well and what doesn't"
        ]
      }
    },
    {
      id: "day1-quiz",
      type: "quiz",
      title: "Day 1 Knowledge Check",
      quiz: {
        id: "day1-quiz",
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
            question: "Which of these is an example of Generative AI?",
            type: "multiple-choice",
            options: ["A spam email filter", "A text-to-image generator", "A credit card fraud detector", "A GPS navigation system"],
            correctAnswer: 1,
            explanation: "Generative AI creates new content like images, text, or music. Text-to-image generators like DALL-E or Midjourney are prime examples."
          },
          {
            id: "q3",
            question: "AI is designed to replace human designers completely.",
            type: "true-false",
            options: ["True", "False"],
            correctAnswer: 1,
            explanation: "False. AI is designed to augment and enhance human creativity, not replace it. The best results come from humans and AI working together."
          },
          {
            id: "q4",
            question: "When was the term 'Artificial Intelligence' first coined?",
            type: "multiple-choice",
            options: ["1945", "1956", "1965", "1970"],
            correctAnswer: 1,
            explanation: "The term 'Artificial Intelligence' was coined in 1956 at the Dartmouth Conference, which is considered the birth of AI as a field."
          }
        ]
      }
    }
  ],
  2: [
    {
      id: "day2-intro",
      type: "content",
      title: "Types of AI and How They Work",
      contentIntro: `
        <h3>Day 2: Understanding Different Types of AI</h3>
        <p>Today we'll dive deeper into the different categories of AI and understand how each type works. This knowledge will help you choose the right AI tools for your design projects.</p>
        
        <h4>Classification by Capability</h4>
        <ul>
          <li><strong>Narrow AI (Weak AI):</strong> Designed for specific tasks (what we use today)</li>
          <li><strong>General AI (Strong AI):</strong> Human-level intelligence across all domains (future goal)</li>
          <li><strong>Super AI:</strong> Intelligence surpassing human capabilities (theoretical)</li>
        </ul>
        
        <h4>Classification by Functionality</h4>
        <ul>
          <li><strong>Reactive Machines:</strong> Respond to current situations without memory</li>
          <li><strong>Limited Memory:</strong> Learn from historical data to make decisions</li>
          <li><strong>Theory of Mind:</strong> Understand emotions and beliefs (in development)</li>
          <li><strong>Self-Aware:</strong> Conscious AI systems (theoretical)</li>
        </ul>
        
        <h4>AI Technologies Relevant to Design</h4>
        <p>As a designer, you'll primarily work with these types of AI. Click each card to explore:</p>
      `,
      flipCards: [
        {
          title: "Machine Learning (ML)",
          description: "Machine Learning algorithms learn patterns from data to make predictions or decisions. In design, ML powers personalization features, user behavior prediction, and A/B testing optimization. Examples include Netflix recommendations, Spotify playlists, and social media feeds that adapt to user preferences."
        },
        {
          title: "Deep Learning",
          description: "A subset of ML using neural networks with many layers to process complex data. Deep learning excels at image recognition, style transfer, and content generation. It powers tools like photo enhancement filters, automatic image tagging systems, and artistic style transfer applications."
        },
        {
          title: "Computer Vision",
          description: "AI that can analyze and understand visual information from images and videos. In design, computer vision enables image analysis, object detection, and quality control. Popular applications include Adobe's Content-Aware Fill, Google Lens, and AR filters on social media platforms."
        },
        {
          title: "Natural Language Processing",
          description: "NLP enables AI to understand and generate human language. For designers, NLP is invaluable for content creation, copywriting, and user research. It powers tools like ChatGPT for creative writing, Grammarly for editing, and automated survey analysis for user feedback."
        },
        {
          title: "Reinforcement Learning",
          description: "AI that learns through trial and error by receiving rewards for desired behaviors. While less common in design tools, it's used in game design for creating adaptive NPCs and in UX optimization for finding the best user flows through continuous testing."
        },
        {
          title: "Transfer Learning",
          description: "A technique where AI models trained on one task are adapted for related tasks. This allows designers to use pre-trained models for custom applications, like fine-tuning a general image generator for specific brand styles or adapting text models for industry-specific content."
        }
      ],
      contentOutro: `
        <h4>Choosing the Right AI for Your Project</h4>
        <p>Understanding these different AI types helps you select the most appropriate tools for your design challenges. Remember, most modern AI tools combine multiple technologies to deliver powerful creative capabilities.</p>
      `
    },
    {
      id: "day2-generative",
      type: "content",
      title: "Generative AI Deep Dive",
      content: `
        <h3>Understanding Generative AI</h3>
        <p>Generative AI is perhaps the most exciting development for creative professionals. Let's explore how it works and what it can do.</p>
        
        <h4>What is Generative AI?</h4>
        <p>Generative AI refers to artificial intelligence systems that can create new content—text, images, audio, video, or code—based on patterns learned from training data.</p>
        
        <h4>Key Generative AI Models</h4>
        
        <h5>1. Large Language Models (LLMs)</h5>
        <ul>
          <li><strong>Examples:</strong> GPT-4, Claude, Gemini</li>
          <li><strong>Capabilities:</strong> Writing, editing, brainstorming, coding</li>
          <li><strong>Design Applications:</strong> Content creation, user research, strategy</li>
        </ul>
        
        <h5>2. Text-to-Image Models</h5>
        <ul>
          <li><strong>Examples:</strong> DALL-E, Midjourney, Stable Diffusion</li>
          <li><strong>Capabilities:</strong> Creating images from text descriptions</li>
          <li><strong>Design Applications:</strong> Concept art, mood boards, prototyping</li>
        </ul>
        
        <h5>3. Image-to-Image Models</h5>
        <ul>
          <li><strong>Examples:</strong> Adobe Firefly, RunwayML, ControlNet</li>
          <li><strong>Capabilities:</strong> Modifying existing images, style transfer</li>
          <li><strong>Design Applications:</strong> Photo editing, style exploration, variations</li>
        </ul>
        
        <h4>How Generative AI Works</h4>
        <ol>
          <li><strong>Training:</strong> The model learns patterns from millions of examples</li>
          <li><strong>Encoding:</strong> Input is converted into a mathematical representation</li>
          <li><strong>Processing:</strong> The model analyzes patterns and relationships</li>
          <li><strong>Generation:</strong> New content is created based on learned patterns</li>
          <li><strong>Refinement:</strong> Output is adjusted based on feedback and constraints</li>
        </ol>
        
        <h4>Prompt Engineering</h4>
        <p>The key to getting great results from generative AI is learning how to communicate with it effectively through prompts.</p>
        
        <h5>Elements of a Good Prompt</h5>
        <ul>
          <li><strong>Context:</strong> Background information about what you want</li>
          <li><strong>Specificity:</strong> Clear, detailed descriptions</li>
          <li><strong>Style:</strong> Artistic style, mood, or aesthetic preferences</li>
          <li><strong>Format:</strong> Output format and technical specifications</li>
          <li><strong>Constraints:</strong> What to avoid or include</li>
        </ul>
        
        <h5>Example Prompts for Design</h5>
        <ul>
          <li><strong>Basic:</strong> "Design a logo for a coffee shop"</li>
          <li><strong>Better:</strong> "Create a minimalist logo for an artisanal coffee shop called 'Bean There' with warm, earthy colors and a modern sans-serif font"</li>
          <li><strong>Best:</strong> "Design a circular logo for 'Bean There,' an artisanal coffee shop targeting young professionals. Use a minimalist style with a coffee bean silhouette, warm brown and cream colors, modern sans-serif typography, and ensure it works well at small sizes for social media"</li>
        </ul>
      `
    },
    {
      id: "day2-video",
      type: "video", 
      title: "Understanding Neural Networks & Machine Learning",
      videos: [
        {
          title: "But What Is a Neural Network?",
          videoUrl: "https://www.youtube.com/embed/aircAruvnKk",
          duration: "19 minutes",
          description: "3Blue1Brown's visually stunning explanation of neural networks"
        },
        {
          title: "Machine Learning Explained",
          videoUrl: "https://www.youtube.com/embed/ukzFI9rgwfU",
          duration: "11 minutes",
          description: "Google's simple introduction to different types of machine learning"
        },
        {
          title: "Deep Learning In 5 Minutes",
          videoUrl: "https://www.youtube.com/embed/6M5VXKLf4D4",
          duration: "5 minutes",
          description: "Quick overview of deep learning concepts and applications"
        }
      ]
    },
    {
      id: "day2-activity",
      type: "activity",
      title: "AI Image Generation Practice",
      activity: {
        id: "image-generation-practice",
        title: "Create Your First AI-Generated Images",
        description: "Practice using AI image generation tools to create design concepts. Focus on learning prompt engineering techniques.",
        platforms: [
          {
            name: "DALL-E 2",
            url: "https://openai.com/dall-e-2/",
            description: "OpenAI's text-to-image generator with high-quality, realistic outputs",
            isRecommended: true
          },
          {
            name: "Midjourney",
            url: "https://midjourney.com",
            description: "Discord-based AI art generator known for artistic and stylized outputs",
            isRecommended: true
          },
          {
            name: "Stable Diffusion (via Hugging Face)",
            url: "https://huggingface.co/spaces/stabilityai/stable-diffusion",
            description: "Open-source image generation model with good customization options",
            isRecommended: false
          }
        ],
        instructions: [
          "Choose one of the AI image generation platforms",
          "Start with simple prompts: 'a modern office building'",
          "Try adding style modifiers: 'a modern office building, minimalist style'",
          "Add mood and lighting: 'a modern office building, minimalist style, golden hour lighting'",
          "Experiment with specific details: 'a modern office building, minimalist style, golden hour lighting, glass facade, surrounded by trees'",
          "Generate 3-5 different images using increasingly detailed prompts",
          "Save your favorite results and note which prompts worked best"
        ]
      }
    },
    {
      id: "day2-quiz",
      type: "quiz",
      title: "Day 2 Knowledge Check",
      quiz: {
        id: "day2-quiz",
        questions: [
          {
            id: "q1",
            question: "What type of AI are we primarily using in design tools today?",
            type: "multiple-choice",
            options: ["Narrow AI", "General AI", "Super AI", "Theory of Mind AI"],
            correctAnswer: 0,
            explanation: "We currently use Narrow AI, which is designed for specific tasks like image generation or text processing."
          },
          {
            id: "q2",
            question: "Which AI technology is best for analyzing and understanding images?",
            type: "multiple-choice",
            options: ["Natural Language Processing", "Computer Vision", "Expert Systems", "Genetic Algorithms"],
            correctAnswer: 1,
            explanation: "Computer Vision is specifically designed to analyze and understand visual information."
          },
          {
            id: "q3",
            question: "What is the key to getting good results from generative AI?",
            type: "multiple-choice",
            options: ["Using expensive tools", "Prompt engineering", "Having a powerful computer", "Using multiple models"],
            correctAnswer: 1,
            explanation: "Prompt engineering—crafting clear, detailed, and specific prompts—is crucial for getting good results from generative AI."
          },
          {
            id: "q4",
            question: "Deep Learning is a subset of Machine Learning.",
            type: "true-false",
            options: ["True", "False"],
            correctAnswer: 0,
            explanation: "True. Deep Learning is a specialized subset of Machine Learning that uses neural networks with multiple layers."
          }
        ]
      }
    }
  ],
  3: [
    {
      id: "day3-intro",
      type: "content",
      title: "AI Tools for Designers",
      contentIntro: `
        <h3>Day 3: Essential AI Tools for Modern Designers</h3>
        <p>Today we'll explore the practical AI tools that are transforming design workflows. You'll learn which tools to use for different tasks and how to integrate them into your creative process.</p>
        
        <h4>Categories of AI Design Tools</h4>
        <p>Click on each category to discover the best AI tools for different design tasks:</p>
      `,
      flipCards: [
        {
          title: "Image Generation",
          description: "Create stunning visuals with AI image generators like DALL-E 3, Midjourney, and Stable Diffusion. These tools turn text descriptions into images, helping you quickly prototype ideas, create concept art, and generate unique assets for your designs."
        },
        {
          title: "Content Creation",
          description: "AI writing assistants like ChatGPT, Claude, and Jasper help you craft compelling copy, generate ideas, and create content at scale. Perfect for writing product descriptions, marketing copy, user interface text, and creative briefs."
        },
        {
          title: "Design Automation",
          description: "Tools like Adobe Sensei, Figma AI, and Uizard automate repetitive design tasks. They can remove backgrounds, generate color palettes, suggest layouts, and even convert sketches into digital designs, saving you hours of manual work."
        },
        {
          title: "Video & Animation",
          description: "RunwayML, Synthesia, and Descript revolutionize video creation with AI. Generate videos from text, create AI avatars, edit videos by editing text transcripts, and add special effects with simple prompts."
        },
        {
          title: "User Research",
          description: "AI-powered research tools like Maze AI, Hotjar, and UserVoice analyze user behavior, feedback, and testing data to provide actionable insights. They help you understand user needs and validate design decisions with data."
        },
        {
          title: "Creative Enhancement",
          description: "AI enhancers like Topaz Labs, Gigapixel AI, and Let's Enhance improve image quality, upscale resolution, restore old photos, and add artistic effects. They help you polish and perfect your visual assets."
        }
      ],
      contentOutro: `
        <h4>Choosing the Right Tools</h4>
        <p>The key to success with AI tools is selecting the right one for your specific task. Consider factors like:</p>
        <ul>
          <li><strong>Output Quality:</strong> Does the tool produce professional-grade results?</li>
          <li><strong>Learning Curve:</strong> How easy is it to get started and master?</li>
          <li><strong>Integration:</strong> Does it work with your existing workflow and tools?</li>
          <li><strong>Cost:</strong> Is it within your budget for regular use?</li>
          <li><strong>Ethics & Rights:</strong> Are the outputs safe for commercial use?</li>
        </ul>
      `
    },
    {
      id: "day3-workflows",
      type: "content",
      title: "AI-Enhanced Design Workflows",
      content: `
        <h3>Integrating AI into Your Design Process</h3>
        <p>Let's explore how to effectively integrate AI tools into different stages of the design process.</p>
        
        <h4>The AI-Enhanced Design Process</h4>
        
        <h5>1. Research & Discovery</h5>
        <ul>
          <li><strong>Market Research:</strong> Use ChatGPT or Claude to analyze trends and competition</li>
          <li><strong>User Personas:</strong> Generate detailed user personas based on research data</li>
          <li><strong>Content Analysis:</strong> Analyze existing content for themes and patterns</li>
          <li><strong>Competitive Analysis:</strong> AI-powered tools to analyze competitor strategies</li>
        </ul>
        
        <h5>2. Ideation & Concept Development</h5>
        <ul>
          <li><strong>Brainstorming:</strong> Use AI to generate creative ideas and explore concepts</li>
          <li><strong>Mood Boards:</strong> Create AI-generated images for mood and style exploration</li>
          <li><strong>Concept Sketches:</strong> Generate initial visual concepts with text-to-image AI</li>
          <li><strong>Color Palettes:</strong> AI-powered color palette generators</li>
        </ul>
        
        <h5>3. Design Creation</h5>
        <ul>
          <li><strong>Asset Generation:</strong> Create backgrounds, textures, and design elements</li>
          <li><strong>Content Creation:</strong> Generate copy, headlines, and descriptions</li>
          <li><strong>Image Enhancement:</strong> Upscale, remove backgrounds, and improve quality</li>
          <li><strong>Style Transfer:</strong> Apply different artistic styles to existing designs</li>
        </ul>
        
        <h5>4. Iteration & Refinement</h5>
        <ul>
          <li><strong>Variations:</strong> Generate multiple versions of designs quickly</li>
          <li><strong>A/B Testing:</strong> Create different versions for testing</li>
          <li><strong>Feedback Analysis:</strong> Use AI to analyze user feedback and reviews</li>
          <li><strong>Optimization:</strong> AI-powered suggestions for improvement</li>
        </ul>
        
        <h4>Sample Workflow: Designing a Mobile App</h4>
        
        <h5>Week 1: Research & Planning</h5>
        <ul>
          <li>Day 1-2: Use AI for market research and competitive analysis</li>
          <li>Day 3-4: Generate user personas and user journey maps</li>
          <li>Day 5: Create initial concept mood boards with AI-generated images</li>
        </ul>
        
        <h5>Week 2: Design & Development</h5>
        <ul>
          <li>Day 1-2: Generate wireframes and layout concepts</li>
          <li>Day 3-4: Create visual designs with AI-generated assets</li>
          <li>Day 5: Develop copy and content with AI assistance</li>
        </ul>
        
        <h5>Week 3: Testing & Refinement</h5>
        <ul>
          <li>Day 1-2: Create multiple design variations for testing</li>
          <li>Day 3-4: Analyze user feedback with AI tools</li>
          <li>Day 5: Implement improvements and finalize designs</li>
        </ul>
        
        <h4>Best Practices for AI-Enhanced Design</h4>
        <ul>
          <li><strong>Start Small:</strong> Begin with simple tasks and gradually increase complexity</li>
          <li><strong>Maintain Creative Control:</strong> Use AI as a tool, not a replacement for creativity</li>
          <li><strong>Verify and Validate:</strong> Always review AI-generated content for accuracy and appropriateness</li>
          <li><strong>Keep Learning:</strong> Stay updated with new AI tools and capabilities</li>
          <li><strong>Document Your Process:</strong> Keep track of what works and what doesn't</li>
        </ul>
      `
    },
    {
      id: "day3-video",
      type: "video",
      title: "AI Tools for Creative Design",
      videos: [
        {
          title: "AI-Powered Design with Figma & ChatGPT",
          videoUrl: "https://www.youtube.com/embed/v2aX3oCuYes",
          duration: "12 minutes",
          description: "Real-world workflow combining ChatGPT, Midjourney, and Figma"
        },
        {
          title: "Getting Started with Midjourney",
          videoUrl: "https://www.youtube.com/embed/Asg1e_IYzR8",
          duration: "15 minutes",
          description: "Complete beginner's guide to creating AI art with Midjourney"
        },
        {
          title: "Adobe Firefly AI Tutorial",
          videoUrl: "https://www.youtube.com/embed/WLmzakS2JJg",
          duration: "10 minutes",
          description: "Learn Adobe's AI tools for creative professionals"
        }
      ]
    },
    {
      id: "day3-activity",
      type: "activity",
      title: "Build an AI-Enhanced Workflow",
      activity: {
        id: "ai-workflow-design",
        title: "Create Your Personal AI Design Workflow",
        description: "Design a complete workflow that incorporates AI tools for a specific design project. Practice using multiple AI tools together.",
        platforms: [
          {
            name: "Miro or Figma",
            url: "https://miro.com",
            description: "For creating workflow diagrams and organizing your process",
            isRecommended: true
          },
          {
            name: "Notion or Google Docs",
            url: "https://notion.so",
            description: "For documenting your workflow and keeping notes",
            isRecommended: true
          }
        ],
        instructions: [
          "Choose a design project (e.g., mobile app, website, branding)",
          "Map out the traditional design process for this project",
          "Identify 5-7 stages where AI could enhance your workflow",
          "Research specific AI tools for each stage",
          "Create a visual workflow diagram showing the process",
          "Include tool recommendations and specific use cases",
          "Document potential challenges and solutions",
          "Test one or two stages with actual AI tools",
          "Refine your workflow based on the testing experience"
        ]
      }
    },
    {
      id: "day3-quiz",
      type: "quiz",
      title: "Day 3 Knowledge Check",
      quiz: {
        id: "day3-quiz",
        questions: [
          {
            id: "q1",
            question: "Which stage of the design process is best for using AI to generate mood boards?",
            type: "multiple-choice",
            options: ["Research & Discovery", "Ideation & Concept Development", "Design Creation", "Testing & Validation"],
            correctAnswer: 1,
            explanation: "Ideation & Concept Development is the ideal stage for mood boards, as they help explore visual concepts and styles."
          },
          {
            id: "q2",
            question: "What is the main advantage of using AI for A/B testing in design?",
            type: "multiple-choice",
            options: ["It's cheaper", "It can generate multiple variations quickly", "It replaces user feedback", "It guarantees better results"],
            correctAnswer: 1,
            explanation: "AI can quickly generate multiple design variations, making A/B testing more efficient and comprehensive."
          },
          {
            id: "q3",
            question: "When using AI in design workflows, you should always verify the output for accuracy and appropriateness.",
            type: "true-false",
            options: ["True", "False"],
            correctAnswer: 0,
            explanation: "True. AI output should always be reviewed and validated to ensure it meets project requirements and quality standards."
          },
          {
            id: "q4",
            question: "Which type of AI tool would be most useful for analyzing user feedback?",
            type: "multiple-choice",
            options: ["Image generation tools", "Natural Language Processing tools", "Computer Vision tools", "Music generation tools"],
            correctAnswer: 1,
            explanation: "Natural Language Processing tools are designed to understand and analyze text-based feedback from users."
          }
        ]
      }
    }
  ],
  4: [
    {
      id: "day4-intro",
      type: "content",
      title: "Ethical AI and Responsible Design",
      content: `
        <h3>Day 4: Ethics, Responsibility, and the Future of AI in Design</h3>
        <p>As AI becomes more prevalent in design, it's crucial to understand the ethical implications and use these tools responsibly. Today we'll explore the challenges and responsibilities that come with AI-powered design.</p>
        
        <h4>Key Ethical Considerations</h4>
        
        <h5>1. Bias and Fairness</h5>
        <ul>
          <li><strong>Training Data Bias:</strong> AI models learn from data that may contain societal biases</li>
          <li><strong>Representation:</strong> Ensuring diverse and inclusive outputs</li>
          <li><strong>Cultural Sensitivity:</strong> Understanding how AI outputs may affect different cultures</li>
          <li><strong>Accessibility:</strong> Designing AI-generated content that's accessible to all users</li>
        </ul>
        
        <h5>2. Intellectual Property and Copyright</h5>
        <ul>
          <li><strong>Training Data Sources:</strong> Understanding what data was used to train AI models</li>
          <li><strong>Ownership of AI-Generated Content:</strong> Who owns the rights to AI-created designs?</li>
          <li><strong>Fair Use:</strong> When is it appropriate to use AI-generated content commercially?</li>
          <li><strong>Attribution:</strong> How and when to credit AI tools in your work</li>
        </ul>
        
        <h5>3. Authenticity and Transparency</h5>
        <ul>
          <li><strong>Disclosure:</strong> Being transparent about AI use in creative work</li>
          <li><strong>Client Communication:</strong> Informing clients when AI tools are used</li>
          <li><strong>Authenticity:</strong> Balancing efficiency with genuine creative expression</li>
          <li><strong>Professional Standards:</strong> Industry expectations for AI disclosure</li>
        </ul>
        
        <h4>Common Ethical Dilemmas</h4>
        
        <h5>Scenario 1: Stock Photography Replacement</h5>
        <p>You're working on a campaign and need diverse stock photos, but your budget is limited. AI can generate the exact images you need, but they might replicate the style of existing photographers.</p>
        <ul>
          <li><strong>Considerations:</strong> Impact on stock photography industry, originality, licensing</li>
          <li><strong>Best Practice:</strong> Use AI for initial concepts, but consider supporting photographers for final work</li>
        </ul>
        
        <h5>Scenario 2: Content Creation Speed</h5>
        <p>A client wants you to create 50 social media posts in two days. AI can help you generate content quickly, but you're concerned about quality and authenticity.</p>
        <ul>
          <li><strong>Considerations:</strong> Quality vs. speed, client expectations, professional reputation</li>
          <li><strong>Best Practice:</strong> Use AI for initial drafts, then add human refinement and brand voice</li>
        </ul>
        
        <h5>Scenario 3: Competitive Advantage</h5>
        <p>You discover an AI tool that significantly improves your workflow, but you're unsure whether to share this knowledge with competitors.</p>
        <ul>
          <li><strong>Considerations:</strong> Professional community, industry growth, competitive advantage</li>
          <li><strong>Best Practice:</strong> Share knowledge while maintaining your unique creative approach</li>
        </ul>
      `
    },
    {
      id: "day4-guidelines",
      type: "content",
      title: "Responsible AI Guidelines for Designers",
      content: `
        <h3>Best Practices for Ethical AI Use</h3>
        <p>Follow these guidelines to ensure you're using AI responsibly in your design practice.</p>
        
        <h4>The FAIR Framework for AI in Design</h4>
        
        <h5>F - Fair and Unbiased</h5>
        <ul>
          <li>Review AI outputs for bias and stereotypes</li>
          <li>Test with diverse inputs to ensure inclusive results</li>
          <li>Consider the impact on underrepresented groups</li>
          <li>Use AI tools that prioritize fairness and diversity</li>
        </ul>
        
        <h5>A - Authentic and Transparent</h5>
        <ul>
          <li>Disclose AI use when appropriate or required</li>
          <li>Maintain your unique creative voice and style</li>
          <li>Be honest about your process with clients and colleagues</li>
          <li>Use AI to enhance, not replace, human creativity</li>
        </ul>
        
        <h5>I - Intellectually Responsible</h5>
        <ul>
          <li>Respect copyright and intellectual property rights</li>
          <li>Understand the licensing terms of AI tools you use</li>
          <li>Give appropriate credit to AI tools and data sources</li>
          <li>Avoid generating content that infringes on existing works</li>
        </ul>
        
        <h5>R - Reliable and Accountable</h5>
        <ul>
          <li>Verify AI-generated facts and information</li>
          <li>Take responsibility for all output, AI-generated or not</li>
          <li>Maintain quality standards regardless of production method</li>
          <li>Keep humans in the loop for important decisions</li>
        </ul>
        
        <h4>Practical Implementation</h4>
        
        <h5>Documentation and Disclosure</h5>
        <ul>
          <li>Keep records of which AI tools you use for each project</li>
          <li>Create templates for client communication about AI use</li>
          <li>Develop a personal policy for when and how to disclose AI use</li>
          <li>Include AI tool usage in project documentation</li>
        </ul>
        
        <h5>Quality Assurance</h5>
        <ul>
          <li>Establish review processes for AI-generated content</li>
          <li>Create checklists for bias and appropriateness</li>
          <li>Test AI outputs with diverse user groups</li>
          <li>Maintain human oversight in all creative decisions</li>
        </ul>
        
        <h5>Continuous Learning</h5>
        <ul>
          <li>Stay informed about AI ethics developments</li>
          <li>Participate in industry discussions about responsible AI</li>
          <li>Regularly review and update your AI practices</li>
          <li>Seek feedback from peers and mentors</li>
        </ul>
        
        <h4>Legal and Professional Considerations</h4>
        
        <h5>Copyright and Licensing</h5>
        <ul>
          <li>Understand the copyright status of AI-generated content</li>
          <li>Review terms of service for AI tools you use</li>
          <li>Consider purchasing commercial licenses when necessary</li>
          <li>Consult legal experts for complex situations</li>
        </ul>
        
        <h5>Professional Standards</h5>
        <ul>
          <li>Follow your industry's guidelines for AI use</li>
          <li>Maintain professional integrity in all AI applications</li>
          <li>Be prepared to explain your AI use to clients and employers</li>
          <li>Consider creating an AI use policy for your practice</li>
        </ul>
      `
    },
    {
      id: "day4-video",
      type: "video",
      title: "AI Ethics and Responsible Design",
      videos: [
        {
          title: "Algorithmic Bias and Fairness",
          videoUrl: "https://www.youtube.com/embed/gV0_raKR2UE",
          duration: "11 minutes",
          description: "CrashCourse explains how bias occurs in AI systems"
        },
        {
          title: "The Ethics of AI",
          videoUrl: "https://www.youtube.com/embed/EBK-a94IFHY",
          duration: "7 minutes",
          description: "Exploring moral implications of artificial intelligence"
        },
        {
          title: "Responsible AI Principles",
          videoUrl: "https://www.youtube.com/embed/LMU1aAC4BuU",
          duration: "9 minutes",
          description: "Microsoft's guide to building ethical AI systems"
        }
      ]
    },
    {
      id: "day4-activity",
      type: "activity",
      title: "Create Your AI Ethics Framework",
      activity: {
        id: "ai-ethics-framework",
        title: "Develop Personal Guidelines for Responsible AI Use",
        description: "Create a comprehensive framework for ethical AI use in your design practice. This will serve as your guide for making responsible decisions.",
        platforms: [
          {
            name: "Google Docs or Notion",
            url: "https://docs.google.com",
            description: "For creating and organizing your ethics framework document",
            isRecommended: true
          },
          {
            name: "Mind mapping tool (Miro, XMind)",
            url: "https://miro.com",
            description: "For visually organizing your thoughts and connections",
            isRecommended: false
          }
        ],
        instructions: [
          "Review the FAIR framework and identify which points resonate most with you",
          "Consider your specific design discipline and its unique challenges",
          "Research your industry's current standards for AI use (if any exist)",
          "Create a personal mission statement for ethical AI use",
          "Define specific guidelines for different types of projects",
          "Develop templates for client communication about AI use",
          "Create a checklist for reviewing AI-generated content",
          "Plan how you'll stay updated on ethical AI developments",
          "Share your framework with a peer or mentor for feedback"
        ]
      }
    },
    {
      id: "day4-quiz",
      type: "quiz",
      title: "Day 4 Knowledge Check",
      quiz: {
        id: "day4-quiz",
        questions: [
          {
            id: "q1",
            question: "What does the 'F' in the FAIR framework stand for?",
            type: "multiple-choice",
            options: ["Fast", "Fair and Unbiased", "Functional", "Flexible"],
            correctAnswer: 1,
            explanation: "The 'F' in FAIR stands for 'Fair and Unbiased', emphasizing the importance of avoiding bias in AI applications."
          },
          {
            id: "q2",
            question: "When should you disclose the use of AI in your design work?",
            type: "multiple-choice",
            options: ["Never", "Only when asked", "When appropriate or required", "Always"],
            correctAnswer: 2,
            explanation: "You should disclose AI use when appropriate or required, depending on the context, client expectations, and professional standards."
          },
          {
            id: "q3",
            question: "AI-generated content automatically belongs to the person who created the prompt.",
            type: "true-false",
            options: ["True", "False"],
            correctAnswer: 1,
            explanation: "False. Copyright ownership of AI-generated content is complex and depends on various factors including the tool's terms of service and local laws."
          },
          {
            id: "q4",
            question: "Which is the most important consideration when using AI for commercial design work?",
            type: "multiple-choice",
            options: ["Speed of generation", "Cost savings", "Quality and appropriateness", "Technical complexity"],
            correctAnswer: 2,
            explanation: "Quality and appropriateness should always be the primary consideration, ensuring the AI output meets professional standards and client needs."
          }
        ]
      }
    }
  ],
  5: [
    {
      id: "day5-intro",
      type: "content", 
      title: "The Future of AI in Design",
      contentIntro: `
        <h3>Day 5: Looking Ahead - The Future of AI in Design</h3>
        <p>Welcome to the final day of your AI crash course! Today we'll explore emerging trends, future possibilities, and how you can continue growing with AI as a designer.</p>
        
        <h4>Current State vs. Future Possibilities</h4>
        <p>Click on each card below to explore the exciting future of AI in design:</p>
      `,
      flipCards: [
        {
          title: "Multimodal AI",
          description: "Future AI systems will seamlessly understand and generate across all media types—text, images, audio, video, and 3D. Imagine describing a concept once and getting a complete brand identity with logo, website, videos, and marketing materials instantly."
        },
        {
          title: "Real-time Collaboration",
          description: "AI will work alongside you in real-time, offering suggestions as you design, automatically creating variations, and even participating in brainstorming sessions. It's like having an infinitely creative partner who never gets tired."
        },
        {
          title: "Personalized AI Assistants",
          description: "Your AI assistant will learn your unique style, preferences, and workflows. It will anticipate your needs, maintain brand consistency across projects, and even handle routine client communications in your voice."
        },
        {
          title: "3D & Spatial Design",
          description: "AI will revolutionize 3D modeling, AR/VR experiences, and spatial computing. Create immersive environments with text prompts, design virtual products that users can interact with, and build entire metaverse experiences effortlessly."
        },
        {
          title: "Autonomous Design Systems",
          description: "Advanced AI will handle complete design projects from brief to delivery. It will conduct user research, generate concepts, create designs, test with users, iterate based on feedback, and prepare final deliverables—all while you focus on strategy and creative direction."
        },
        {
          title: "Emotional Intelligence",
          description: "Future AI will understand human emotions and cultural nuances, creating designs that resonate on a deeper level. It will predict emotional responses to colors, layouts, and content, helping you create more impactful and meaningful designs."
        }
      ],
      contentOutro: `
        <h4>Timeline of AI Evolution</h4>
        <ul>
          <li><strong>2024-2025:</strong> Refinement of current tools, better integration, improved quality</li>
          <li><strong>2025-2026:</strong> Multimodal capabilities, real-time generation, 3D design</li>
          <li><strong>2027-2028:</strong> Personalized AI assistants, emotional intelligence</li>
          <li><strong>2029-2030:</strong> Autonomous design systems, AI creative directors</li>
        </ul>
          <li><strong>Emotional Intelligence:</strong> AI that understands and responds to human emotions</li>
          <li><strong>Predictive Design:</strong> AI that anticipates user needs before they're expressed</li>
          <li><strong>Seamless Integration:</strong> AI embedded in every tool and workflow</li>
          <li><strong>Creative Collaboration:</strong> AI as a true creative partner, not just a tool</li>
        </ul>
        
        <h4>Impact on Design Professions</h4>
        
        <h5>Jobs That Will Transform</h5>
        <ul>
          <li><strong>Graphic Designers:</strong> Focus shifts to creative direction and strategy</li>
          <li><strong>UX/UI Designers:</strong> Greater emphasis on user research and experience architecture</li>
          <li><strong>Content Creators:</strong> Become content strategists and quality curators</li>
          <li><strong>Web Developers:</strong> Focus on complex logic and user experience optimization</li>
        </ul>
        
        <h5>New Roles Emerging</h5>
        <ul>
          <li><strong>AI Prompt Engineers:</strong> Specialists in communicating with AI systems</li>
          <li><strong>AI Design Strategists:</strong> Experts in integrating AI into creative workflows</li>
          <li><strong>Human-AI Collaboration Specialists:</strong> Facilitators of human-AI partnerships</li>
          <li><strong>AI Ethics Consultants:</strong> Ensuring responsible AI use in creative industries</li>
        </ul>
        
        <h4>Skills for the AI-Enhanced Designer</h4>
        
        <h5>Technical Skills</h5>
        <ul>
          <li><strong>Prompt Engineering:</strong> Mastering communication with AI systems</li>
          <li><strong>AI Tool Fluency:</strong> Understanding capabilities and limitations of different AI tools</li>
          <li><strong>Data Literacy:</strong> Understanding how AI learns and makes decisions</li>
          <li><strong>Integration Skills:</strong> Combining multiple AI tools effectively</li>
        </ul>
        
        <h5>Creative Skills</h5>
        <ul>
          <li><strong>Creative Direction:</strong> Guiding AI toward desired creative outcomes</li>
          <li><strong>Curation and Refinement:</strong> Selecting and improving AI-generated content</li>
          <li><strong>Style Development:</strong> Creating unique approaches to AI-assisted design</li>
          <li><strong>Conceptual Thinking:</strong> Focusing on ideas and strategy over execution</li>
        </ul>
        
        <h5>Human Skills</h5>
        <ul>
          <li><strong>Emotional Intelligence:</strong> Understanding human needs AI cannot address</li>
          <li><strong>Critical Thinking:</strong> Evaluating AI outputs and making informed decisions</li>
          <li><strong>Communication:</strong> Explaining AI processes to clients and colleagues</li>
          <li><strong>Adaptability:</strong> Continuously learning new AI tools and techniques</li>
        </ul>
      `
    },
    {
      id: "day5-career",
      type: "content",
      title: "Building an AI-Enhanced Career",
      content: `
        <h3>Career Development in the Age of AI</h3>
        <p>As AI transforms the design industry, your career strategy needs to evolve. Here's how to position yourself for success.</p>
        
        <h4>The AI-Native Designer Profile</h4>
        
        <h5>Core Competencies</h5>
        <ul>
          <li><strong>AI Fluency:</strong> Comfortable with a range of AI tools and understanding their capabilities</li>
          <li><strong>Hybrid Thinking:</strong> Seamlessly combining human creativity with AI capabilities</li>
          <li><strong>Rapid Prototyping:</strong> Using AI to quickly test and iterate on ideas</li>
          <li><strong>Quality Curation:</strong> Exceptional ability to select and refine AI-generated content</li>
          <li><strong>Strategic Focus:</strong> Emphasis on creative strategy and human insight</li>
        </ul>
        
        <h5>Specialized Tracks</h5>
        
        <h6>1. AI Creative Director</h6>
        <ul>
          <li>Lead creative teams using AI-enhanced workflows</li>
          <li>Develop AI integration strategies for agencies and studios</li>
          <li>Bridge the gap between traditional creative and AI capabilities</li>
          <li><strong>Key Skills:</strong> Leadership, creative vision, AI strategy</li>
        </ul>
        
        <h6>2. AI Design Consultant</h6>
        <ul>
          <li>Help businesses integrate AI into their design processes</li>
          <li>Provide training and guidance on responsible AI use</li>
          <li>Develop custom AI workflows for specific industries</li>
          <li><strong>Key Skills:</strong> Business acumen, training, process design</li>
        </ul>
        
        <h6>3. Prompt Engineering Specialist</h6>
        <ul>
          <li>Master the art and science of AI communication</li>
          <li>Develop prompt libraries and templates for design teams</li>
          <li>Create training materials for AI tool usage</li>
          <li><strong>Key Skills:</strong> Technical writing, experimentation, documentation</li>
        </ul>
        
        <h6>4. Human-Centered AI Designer</h6>
        <ul>
          <li>Focus on the human experience of AI-powered products</li>
          <li>Ensure AI systems are accessible and inclusive</li>
          <li>Design interfaces for human-AI collaboration</li>
          <li><strong>Key Skills:</strong> UX research, accessibility, human psychology</li>
        </ul>
        
        <h4>Building Your AI Portfolio</h4>
        
        <h5>Portfolio Categories</h5>
        
        <h6>1. Traditional to AI Transformations</h6>
        <ul>
          <li>Show projects where you enhanced traditional work with AI</li>
          <li>Document the process and time savings achieved</li>
          <li>Highlight quality improvements and new possibilities</li>
        </ul>
        
        <h6>2. AI-First Projects</h6>
        <ul>
          <li>Projects conceived and executed primarily with AI tools</li>
          <li>Demonstrate your AI fluency and creative application</li>
          <li>Show the unique results only possible with AI</li>
        </ul>
        
        <h6>3. Ethical AI Case Studies</h6>
        <ul>
          <li>Examples of responsible AI use in challenging situations</li>
          <li>Documentation of ethical decision-making processes</li>
          <li>Solutions to bias, accessibility, or transparency challenges</li>
        </ul>
        
        <h6>4. Process Documentation</h6>
        <ul>
          <li>Detailed workflows showing human-AI collaboration</li>
          <li>Tool comparisons and recommendations</li>
          <li>Lessons learned and best practices</li>
        </ul>
        
        <h4>Continuous Learning Strategy</h4>
        
        <h5>Stay Current</h5>
        <ul>
          <li><strong>Follow AI Research:</strong> Subscribe to AI newsletters and research publications</li>
          <li><strong>Join Communities:</strong> Participate in AI design forums and local meetups</li>
          <li><strong>Experiment Regularly:</strong> Try new AI tools as they're released</li>
          <li><strong>Share Knowledge:</strong> Write about your experiences and teach others</li>
        </ul>
        
        <h5>Recommended Learning Path</h5>
        <ol>
          <li><strong>Month 1-3:</strong> Master 2-3 core AI tools in your specialty</li>
          <li><strong>Month 4-6:</strong> Develop advanced prompt engineering skills</li>
          <li><strong>Month 7-9:</strong> Create AI-enhanced versions of past projects</li>
          <li><strong>Month 10-12:</strong> Build original AI-first portfolio pieces</li>
          <li><strong>Ongoing:</strong> Stay current with new tools and techniques</li>
        </ol>
        
        <h4>Networking and Community</h4>
        
        <h5>AI Design Communities</h5>
        <ul>
          <li><strong>Online:</strong> Discord servers, Reddit communities, LinkedIn groups</li>
          <li><strong>Local:</strong> AI meetups, design conferences with AI tracks</li>
          <li><strong>Professional:</strong> Industry associations embracing AI</li>
          <li><strong>Academic:</strong> University programs and research groups</li>
        </ul>
        
        <h5>Building Your Network</h5>
        <ul>
          <li>Share your AI experiments and learning journey</li>
          <li>Contribute to open-source AI design projects</li>
          <li>Speak at conferences about AI in design</li>
          <li>Mentor others starting their AI journey</li>
        </ul>
      `
    },
    {
      id: "day5-video",
      type: "video",
      title: "The Future of AI and Design",
      videos: [
        {
          title: "AI - Humanity's Final Invention?",
          videoUrl: "https://www.youtube.com/embed/fa8k8IQ1_X0",
          duration: "19 minutes",
          description: "Kurzgesagt explores artificial superintelligence and its implications"
        },
        {
          title: "Careers in AI and Machine Learning",
          videoUrl: "https://www.youtube.com/embed/5dZ_lvDgevk",
          duration: "8 minutes",
          description: "Overview of career paths in the AI industry"
        },
        {
          title: "The Next Decade of AI",
          videoUrl: "https://www.youtube.com/embed/XFA1MfTiXN0",
          duration: "14 minutes",
          description: "Expert predictions on AI's evolution through 2035"
        }
      ]
    },
    {
      id: "day5-activity",
      type: "activity",
      title: "Design Your AI Learning Plan",
      activity: {
        id: "ai-learning-plan",
        title: "Create Your Personal AI Development Roadmap",
        description: "Based on everything you've learned, create a comprehensive plan for developing your AI skills over the next year.",
        platforms: [
          {
            name: "Notion or Airtable",
            url: "https://notion.so",
            description: "For creating a structured learning plan with tracking capabilities",
            isRecommended: true
          },
          {
            name: "Google Sheets",
            url: "https://sheets.google.com",
            description: "For simple tracking and planning",
            isRecommended: false
          }
        ],
        instructions: [
          "Assess your current AI knowledge and skills honestly",
          "Identify 3-5 specific AI tools you want to master in the next 6 months",
          "Choose a specialization track that aligns with your career goals",
          "Set monthly learning objectives and milestones",
          "Plan specific projects to practice and showcase your AI skills",
          "Identify communities and resources for ongoing learning",
          "Create a system for tracking new AI tools and developments",
          "Set up a regular review schedule to update your plan",
          "Share your plan with a mentor or peer for accountability"
        ]
      }
    },
    {
      id: "day5-final-quiz",
      type: "quiz",
      title: "Final Course Assessment",
      quiz: {
        id: "day5-final-quiz",
        questions: [
          {
            id: "q1",
            question: "What is the most important skill for designers in an AI-enhanced future?",
            type: "multiple-choice",
            options: ["Technical programming skills", "Creative direction and curation", "Speed of execution", "Knowledge of all AI tools"],
            correctAnswer: 1,
            explanation: "Creative direction and curation will become increasingly important as AI handles more execution tasks."
          },
          {
            id: "q2",
            question: "Which emerging AI trend is most likely to impact 3D and spatial design?",
            type: "multiple-choice",
            options: ["Text generation", "Multimodal AI", "Chatbots", "Email automation"],
            correctAnswer: 1,
            explanation: "Multimodal AI, which understands multiple types of input including spatial information, will significantly impact 3D and spatial design."
          },
          {
            id: "q3",
            question: "AI will completely replace human designers within the next 5 years.",
            type: "true-false",
            options: ["True", "False"],
            correctAnswer: 1,
            explanation: "False. AI will augment and enhance human creativity, but human insight, emotion, and strategic thinking remain irreplaceable."
          },
          {
            id: "q4",
            question: "What should be the primary focus when building an AI-enhanced portfolio?",
            type: "multiple-choice",
            options: ["Showing off AI tool knowledge", "Demonstrating creative problem-solving with AI", "Hiding AI usage", "Only using the most expensive tools"],
            correctAnswer: 1,
            explanation: "The portfolio should demonstrate how you use AI as a tool for creative problem-solving and achieving better design outcomes."
          },
          {
            id: "q5",
            question: "What is the key to staying relevant as a designer in the AI era?",
            type: "multiple-choice",
            options: ["Avoiding AI completely", "Continuous learning and adaptation", "Focusing only on traditional methods", "Learning to code"],
            correctAnswer: 1,
            explanation: "Continuous learning and adaptation are essential as AI technology evolves rapidly and changes design practices."
          }
        ]
      }
    }
  ]
};