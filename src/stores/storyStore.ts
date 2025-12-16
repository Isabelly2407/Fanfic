import { create } from 'zustand';
import { Stories } from '@/entities';

interface StoryStore {
  activeStory: Stories | null;
  setActiveStory: (story: Stories | null) => void;
}

export const useStoryStore = create<StoryStore>((set) => ({
  activeStory: null,
  setActiveStory: (story) => set({ activeStory: story }),
}));
