import { API_URL } from '../config/api';

export interface Friend {
  id: string;
  friend_name: string;
  created_at: string;
  event_count: number;
  last_event_date: string | null;
}

export interface Event {
  id: string;
  event_name: string;
  event_date: string | null;
  created_at: string;
  friend_names: string[];
}

export interface Content {
  id: string;
  user_friend_event_id: string;
  topic: string;
  content: string;
}

export const fetchFriendsbyUser = async (userId: string): Promise<Friend[]> => {
  try {
    const response = await fetch(`${API_URL}/friends/user/${userId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching friends:', error);
    return [];
  }
};

export const fetchFriendsByUserAndEvent = async (userId: string, eventId: string): Promise<Friend[]> => {
  try {
    const response = await fetch(`${API_URL}/friends/user/${userId}/event/${eventId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    console.log(response)
    return await response.json();
  } catch (error) {
    console.error('Error fetching friends:', error);
    return [];
  }
};

export const fetchEventsByUser = async (userId: string): Promise<Event[]> => {
  try {
    const response = await fetch(`${API_URL}/events/user/${userId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const fetchEventsByUserAndFriend = async (userId: string, friendId: string): Promise<Event[]> => {
  try {
    const response = await fetch(`${API_URL}/events/user/${userId}/friend/${friendId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

export const bulkCreateContent = async (userFriendEventId: number, topics: { topic: string; content: string }[]): Promise<Content[]> => {
  try {
    const response = await fetch(`${API_URL}/content/bulk`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_friend_event_id: userFriendEventId,
        topics: topics,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating bulk content:', error);
    return [];
  }
};

export const fetchUserFriendEventId = async (userId: string, friendId: string, eventId: string): Promise<string | null> => {
  try {
    const response = await fetch(`${API_URL}/relations/user-friends-events/${userId}/${friendId}/${eventId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Error fetching user friend event id:', error);
    return null;
  }
};

export const fetchContentByUserFriendEventId = async (userFriendEventId: string): Promise<Content[]> => {
  try {
    const response = await fetch(`${API_URL}/content/content/${userFriendEventId}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching content:', error);
    return [];
  }
};

export interface QuizQuestion {
  question: string;
  options: string[];
  correct_answer: number;
  topic: string;
  explanation: string;
}

export interface QuizResponse {
  questions: QuizQuestion[];
  friend_name: string;
}

export const generateQuiz = async (userId: string, friendId: string): Promise<QuizResponse> => {
  try {
    const response = await fetch(`${API_URL}/quiz/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        friend_id: friendId,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to generate quiz');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error generating quiz:', error);
    throw error;
  }
};