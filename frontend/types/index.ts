// Core Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  isOnline: boolean;
  lastSeen?: Date;
}

export interface Message {
  id: string;
  sender: string;
  senderId: string;
  message: string;
  time: string;
  timestamp: Date;
  isMe: boolean;
  read?: boolean;
  type?: 'text' | 'image' | 'file';
  attachments?: Attachment[];
  isDeleted?: boolean;
}

export interface Attachment {
  id: string;
  type: 'image' | 'file' | 'video';
  url: string;
  name: string;
  size?: number;
}

export interface Chat {
  id: string;
  name: string;
  avatar?: string;
  type: 'personal' | 'group';
  members: User[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount?: number;
  isTyping?: boolean;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  organizer: User;
  attendees: User[];
  category: 'academic' | 'social' | 'professional' | 'sports';
  isAttending?: boolean;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  owner: User;
  collaborators: User[];
  skills: string[];
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  deadline?: Date;
  progress: number;
  isJoined?: boolean;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  timestamp: Date;
  likes: number;
  comments: Comment[];
  attachments?: Attachment[];
  isLiked?: boolean;
  tags: string[];
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: Date;
  likes: number;
  isLiked?: boolean;
}

export interface Club {
  id: string;
  name: string;
  description: string;
  avatar?: string;
  members: User[];
  admins: User[];
  category: string;
  isJoined?: boolean;
  memberCount: number;
}

export interface ProfileData {
  id: string;
  name: string;
  handle: string;
  bio: string;
  location: string;
  joinedDate: string;
  avatar?: string;
  profilePhoto?: string;
  coverPhoto?: string;
  skills: string[];
  interests: string[];
  university: string;
  major: string;
  graduationYear: string;
  email: string;
  phone: string;
  linkedin: string;
  github: string;
  website: string;
}

export interface Notification {
  id: string;
  type: 'message' | 'event' | 'project' | 'like' | 'comment' | 'follow';
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  sender?: User;
}

// Feed Types
export type FeedItemType = 'event' | 'project' | 'post';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  data: Event | Project | Post;
  timestamp: Date;
}

// Navigation Types
export interface ChatScreenParams {
  id: string;
  name?: string;
  type?: 'personal' | 'group';
}

export interface CreateScreenParams {
  type?: 'post' | 'event' | 'project' | 'club';
}

// Form Types
export interface CreatePostForm {
  content: string;
  tags: string[];
  attachments: Attachment[];
}

export interface CreateEventForm {
  title: string;
  description: string;
  date: Date;
  time: string;
  location: string;
  category: Event['category'];
}

export interface CreateProjectForm {
  title: string;
  description: string;
  skills: string[];
  deadline?: Date;
}

export interface CreateClubForm {
  name: string;
  description: string;
  category: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  details?: any;
}

// Loading States
export interface LoadingState {
  isLoading: boolean;
  error?: AppError | null;
}

// Search Types
export interface SearchResult {
  users: User[];
  posts: Post[];
  events: Event[];
  projects: Project[];
  clubs: Club[];
}

export interface SearchFilters {
  type?: 'all' | 'users' | 'posts' | 'events' | 'projects' | 'clubs';
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Theme Types
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    success: string;
    warning: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
}
