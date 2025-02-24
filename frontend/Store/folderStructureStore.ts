import { create } from "zustand";

import { FolderStructureStoreState } from "../Types/types";

const folderStructureStore = create<FolderStructureStoreState>()((set) => ({
  folderStructure: null,
  setFolderStructure: async (playgroundId) => {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/tree/${encodeURIComponent(playgroundId)}`
    );
    set({ folderStructure: await response.json() });
  },
}));

export default folderStructureStore;
