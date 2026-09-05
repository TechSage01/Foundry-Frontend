export const dummyPosts = [
  {
    id: 1,
    author:'TechSage',
    badge: 'Builder',
    avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    timestamp: new Date(Date.now()-1000 * 60 * 60 * 2). toISOString(),
    content: "Hey everyone! Just wanted to share a quick update on my latest project. I've been working on a new feature that allows users to customize their profiles with unique themes and layouts. It's been a challenging but rewarding experience, and I'm excited to see how users respond to it. Stay tuned for more updates!",
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    likes: 12,
    // comments: 4,
    category: 'Tech',
    commentsList: [
      {id: 101, author: "Alex", text: "looks Incredible!", timestamp: new Date(). toISOString()}
    ]
  },
  {
    id: 2,
    author:'CodeMaster',
    badge: 'Innovator',
    avatar: 'https://images.unsplash.com/photo-1502767089025-6572583495b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    timestamp: '5 hours ago',
    content: "Exciting news! I've just released a new version of my open-source library that simplifies data visualization in React applications. The latest update includes several performance improvements and new chart types. Check it out on GitHub and let me know your thoughts!",
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8',
    likes: 25,
    // comments: 10,
    category: 'Development',
    commentsList: [
      {id: 101, author: "Alex", text: "looks Incredible!", timestamp: new Date(). toISOString()}
    ]
  },
  {
    id:3,
    author: 'Sage',
    badge: 'Innovator',
    avatar: 'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80',
    timestamp: new Date(Date.now()-1000 * 60 * 60 * 2). toISOString(),
    content: "Hey everyone! Just wanted to share a quick update on my latest project. I've been working on a new feature that allows users to customize their profiles with unique themes and layouts. It's been a challenging but rewarding experience, and I'm excited to see how users respond to it. Stay tuned for more updates!",
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80',
    likes: 12,
    // comments: 4,
    category: 'Tech',
    commentsList: [
      {id: 101, author: "Alex", text: "looks Incredible!", timestamp: new Date(). toISOString()}
    ]
  }
]