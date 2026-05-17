import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, type Workspace } from '../lib/api';
import { useAuth } from './AuthContext';

interface WorkspaceContextValue {
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  setActiveWorkspaceId: (id: string) => void;
  refreshWorkspaces: () => Promise<void>;
  loading: boolean;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeId, setActiveId] = useState<string | null>(
    () => localStorage.getItem('vortex_workspace') || null
  );
  const [loading, setLoading] = useState(true);

  const refreshWorkspaces = async () => {
    if (!user) return;
    const res = await api.workspaces.list();
    setWorkspaces(res.data);
    if (!activeId && res.data.length) {
      setActiveId(res.data[0].id);
      localStorage.setItem('vortex_workspace', res.data[0].id);
    }
  };

  useEffect(() => {
    if (!user) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }
    refreshWorkspaces().finally(() => setLoading(false));
  }, [user]);

  const setActiveWorkspaceId = (id: string) => {
    setActiveId(id);
    localStorage.setItem('vortex_workspace', id);
  };

  const activeWorkspace = workspaces.find((w) => w.id === activeId) || workspaces[0] || null;

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspaceId,
        refreshWorkspaces,
        loading,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
