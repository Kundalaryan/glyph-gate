export interface Company {
  id: string;
  name: string;
  logo?: string;
  tier: string;
  location: string;
  postCount: number;
  averageRating: number;
  industry: string;
}

export interface Post {
  id: string;
  title: string;
  content: string;
  companyId: string;
  companyName: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  tags: string[];
  upvotes: number;
  downvotes: number;
  commentCount: number;
  createdAt: string;
  isAnonymous: boolean;
}

export const sampleCompanies: Company[] = [
  {
    id: "1",
    name: "TechCorp Inc",
    tier: "Fortune 500",
    location: "San Francisco, CA",
    postCount: 124,
    averageRating: 4.2,
    industry: "Technology"
  },
  {
    id: "2", 
    name: "DataFlow Systems",
    tier: "Startup",
    location: "Austin, TX",
    postCount: 67,
    averageRating: 3.8,
    industry: "Data Analytics"
  },
  {
    id: "3",
    name: "Global Innovations",
    tier: "Mid-size",
    location: "Seattle, WA", 
    postCount: 89,
    averageRating: 4.5,
    industry: "Software Development"
  },
  {
    id: "4",
    name: "CloudFirst Solutions",
    tier: "Enterprise",
    location: "New York, NY",
    postCount: 156,
    averageRating: 3.9,
    industry: "Cloud Services"
  },
  {
    id: "5",
    name: "NextGen Robotics",
    tier: "Startup",
    location: "Boston, MA",
    postCount: 43,
    averageRating: 4.1,
    industry: "Robotics"
  },
  {
    id: "6",
    name: "FinanceFlow Corp",
    tier: "Fortune 100",
    location: "Chicago, IL",
    postCount: 203,
    averageRating: 3.6,
    industry: "Financial Services"
  }
];

export const samplePosts: Post[] = [
  {
    id: "1",
    title: "Amazing work-life balance at TechCorp",
    content: "I've been working here for 2 years and the work-life balance is incredible. Flexible hours, remote work options, and management that actually cares about employee wellbeing. The projects are challenging but not overwhelming.",
    companyId: "1",
    companyName: "TechCorp Inc",
    sentiment: "positive",
    tags: ["work-life-balance", "management", "remote-work"],
    upvotes: 47,
    downvotes: 3,
    commentCount: 12,
    createdAt: "2024-01-15T10:30:00Z",
    isAnonymous: true
  },
  {
    id: "2",
    title: "Layoffs handled poorly",
    content: "Recent layoffs were handled without any transparency. People found out they were fired via email, and there was no severance package. The company claimed 'budget constraints' but still gave executives bonuses.",
    companyId: "2",
    companyName: "DataFlow Systems",
    sentiment: "negative", 
    tags: ["layoffs", "management", "transparency"],
    upvotes: 89,
    downvotes: 12,
    commentCount: 34,
    createdAt: "2024-01-14T15:45:00Z",
    isAnonymous: true
  },
  {
    id: "3",
    title: "Great learning opportunities",
    content: "The company invests heavily in employee development. Regular training sessions, conference attendance, and a solid mentorship program. If you're looking to grow your skills, this is a great place.",
    companyId: "3",
    companyName: "Global Innovations",
    sentiment: "positive",
    tags: ["learning", "development", "mentorship"],
    upvotes: 32,
    downvotes: 2,
    commentCount: 8,
    createdAt: "2024-01-13T09:15:00Z",
    isAnonymous: true
  },
  {
    id: "4",
    title: "Toxic management culture",
    content: "Middle management is completely out of touch. Micromanagement is the norm, and any feedback is seen as insubordination. The company talks about 'open communication' but doesn't practice it.",
    companyId: "4",
    companyName: "CloudFirst Solutions",
    sentiment: "negative",
    tags: ["management", "culture", "communication"],
    upvotes: 67,
    downvotes: 8,
    commentCount: 23,
    createdAt: "2024-01-12T14:20:00Z",
    isAnonymous: true
  },
  {
    id: "5",
    title: "Innovative projects and cutting-edge tech",
    content: "Working on genuinely innovative robotics projects. The tech stack is modern, and we get to experiment with the latest AI frameworks. It's exciting to be part of something that feels like the future.",
    companyId: "5",
    companyName: "NextGen Robotics",
    sentiment: "positive",
    tags: ["innovation", "technology", "ai", "robotics"],
    upvotes: 54,
    downvotes: 1,
    commentCount: 15,
    createdAt: "2024-01-11T11:00:00Z",
    isAnonymous: true
  },
  {
    id: "6",
    title: "Compensation below industry standard",
    content: "Salaries are significantly below market rate, and the annual raise is basically non-existent. When questioned, HR always says 'we're reviewing compensation structures' but nothing changes.",
    companyId: "6",
    companyName: "FinanceFlow Corp", 
    sentiment: "negative",
    tags: ["compensation", "salary", "hr"],
    upvotes: 91,
    downvotes: 5,
    commentCount: 28,
    createdAt: "2024-01-10T16:30:00Z",
    isAnonymous: true
  }
];