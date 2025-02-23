import { create } from 'zustand';
import type { ModelView, ViewConfig } from '@/types/viewDefinition';
import type { StoreApi } from 'zustand';

interface ViewState {
  activeView: string | null;
  views: ModelView[];
  loading: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setViews: (views: ModelView[]) => void;
  setActiveView: (viewId: string | null) => void;
  addView: (view: ModelView) => void;
  updateView: (viewId: string, updates: Partial<ModelView>) => void;
  deleteView: (viewId: string) => void;
  reset: () => void;
}

const initialState = {
  activeView: null,
  views: [],
  loading: false,
  error: null,
};

const useViewStore = create<ViewState>((set) => ({
  ...initialState,

  setLoading: (loading: boolean) => 
    set((state) => ({ loading })),

  setError: (error: string | null) => 
    set((state) => ({ error })),

  setViews: (views: ModelView[]) =>
    set((state) => ({ views })),

  setActiveView: (viewId: string | null) =>
    set((state) => ({ activeView: viewId })),

  addView: (view: ModelView) =>
    set((state) => ({ 
      views: [...state.views, view],
    })),

  updateView: (viewId: string, updates: Partial<ModelView>) =>
    set((state) => ({
      views: state.views.map((view) =>
        view.id === viewId ? { ...view, ...updates } : view
      ),
    })),

  deleteView: (viewId: string) =>
    set((state) => ({
      views: state.views.filter((view) => view.id !== viewId),
      activeView: state.activeView === viewId ? null : state.activeView,
    })),

  reset: () => set(initialState),
}));

export default useViewStore; 