import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const posts = [
  {
    slug: "my-first-post",
    title: "My First Post",
    markdown: `
  # This is my first post
  
  Isn't it great?
      `.trim(),
  },
  {
    slug: "90s-mixtape",
    title: "A Mixtape I Made Just For You",
    markdown: `
  # 90s Mixtape
  
  - I wish (Skee-Lo)
  - This Is How We Do It (Montell Jordan)
  - Everlong (Foo Fighters)
  - Ms. Jackson (Outkast)
  - Interstate Love Song (Stone Temple Pilots)
  - Killing Me Softly With His Song (Fugees, Ms. Lauryn Hill)
  - Just a Friend (Biz Markie)
  - The Man Who Sold The World (Nirvana)
  - Semi-Charmed Life (Third Eye Blind)
  - ...Baby One More Time (Britney Spears)
  - Better Man (Pearl Jam)
  - It's All Coming Back to Me Now (Céline Dion)
  - This Kiss (Faith Hill)
  - Fly Away (Lenny Kravitz)
  - Scar Tissue (Red Hot Chili Peppers)
  - Santa Monica (Everclear)
  - C'mon N' Ride it (Quad City DJ's)
      `.trim(),
  },
  {
    slug: "travel-diaries",
    title: "Exploring the Alps",
    markdown: `
  # Travel Diaries: The Alps
  
  The breathtaking views, the snow-capped peaks, and the crisp air... 
  A journey through the heart of the Alps is something everyone should experience at least once in their lifetime.
      `.trim(),
  },
  {
    slug: "tech-trends-2024",
    title: "Tech Trends in 2024",
    markdown: `
  # Emerging Tech Trends in 2024
  
  - AI and Machine Learning
  - Quantum Computing
  - 5G Expansion
  - Blockchain beyond Cryptocurrency
  - Sustainable Tech Innovations
      `.trim(),
  },
  {
    slug: "cooking-with-love",
    title: "Cooking with Love",
    markdown: `
  # The Art of Cooking with Love
  
  Cooking is not just about ingredients and recipes; it's about the love and passion you put into the process.
      `.trim(),
  },
  {
    slug: "minimalist-living",
    title: "Embracing Minimalism",
    markdown: `
  # Minimalist Living: Less is More
  
  Declutter your life and find joy in simplicity. Minimalism isn't just a trend; it's a lifestyle choice that brings peace and clarity.
      `.trim(),
  },
  {
    slug: "music-journey",
    title: "A Journey Through Classical Music",
    markdown: `
  # Classical Music Through the Ages
  
  From Bach to Beethoven, classical music has a timeless quality that resonates with the soul.
      `.trim(),
  },
  {
    slug: "coding-best-practices",
    title: "Coding Best Practices",
    markdown: `
  # Best Practices for Clean Code
  
  Writing clean code is essential for maintainability and collaboration. Here are some best practices to follow:
  - Use meaningful variable names
  - Keep functions small and focused
  - Comment your code where necessary
  - Write unit tests
      `.trim(),
  },
  {
    slug: "fitness-tips",
    title: "Staying Fit in the Modern World",
    markdown: `
  # Fitness Tips for a Busy Lifestyle
  
  Even with a hectic schedule, staying fit is possible. Incorporate these simple exercises into your daily routine:
  - Morning stretches
  - 10-minute cardio sessions
  - Healthy snacking
      `.trim(),
  },
  {
    slug: "photography-basics",
    title: "Photography 101",
    markdown: `
  # Getting Started with Photography
  
  Photography is an art that anyone can learn. Start with understanding the basics of composition, lighting, and framing.
      `.trim(),
  },
  {
    slug: "mindfulness-practices",
    title: "Practicing Mindfulness",
    markdown: `
  # The Importance of Mindfulness
  
  Mindfulness can drastically improve your mental health. Here's how to start practicing mindfulness in your daily life:
  - Meditation
  - Deep breathing exercises
  - Being present in the moment
      `.trim(),
  },
];

for (const post of posts) {
  await prisma.post.upsert({
    where: { slug: post.slug },
    update: post,
    create: post,
  });
}
