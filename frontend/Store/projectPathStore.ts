import { create } from "zustand";

import { ProjectPathStoreState } from "../Types/types";

const projectPathStore = create<ProjectPathStoreState>()((set) => ({
  projectPath: null,
  setProjectPath: (projectPath) => set({ projectPath }),
}));

export default projectPathStore;
