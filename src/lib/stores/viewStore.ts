import { create } from 'zustand';
import type { ModelView, ViewConfig } from '@/types/viewDefinition';
import type { StoreApi } from 'zustand';

interface ViewState {
  activeView: string | null;
  views: ModelView[];
  loading: boolean;
  error: string | null;
}

interface ViewActions {
  setActiveView: (viewId: string | null) => void;
  setViews: (views: ModelView[]) => void;
  addView: (view: ModelView) => void;
  updateView: (viewId: string, updates: Partial<ModelView>) => void;
  deleteView: (viewId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

type ViewStore = ViewState & ViewActions;

const useViewStore = create<ViewStore>((set) => ({
  // Initial state
  activeView: null,
  views: [],
  loading: false,
  error: null,

  // Actions
  setActiveView: (viewId: string | null) => set(() => ({ activeView: viewId })),
  
  setViews: (views: ModelView[]) => set(() => ({ views })),
  
  addView: (view: ModelView) => set((state) => ({
    views: [...state.views, view],
  })),
  
  updateView: (viewId: string, updates: Partial<ModelView>) => set((state) => ({
    views: state.views.map((view) =>
      view.id === viewId ? { ...view, ...updates } : view
    ),
  })),
  
  deleteView: (viewId: string) => set((state) => ({
    views: state.views.filter((view) => view.id !== viewId),
    activeView: state.activeView === viewId ? null : state.activeView,
  })),
  
  setLoading: (loading: boolean) => set(() => ({ loading })),
  
  setError: (error: string | null) => set(() => ({ error })),
}));

export default useViewStore; 