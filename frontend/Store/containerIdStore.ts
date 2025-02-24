import { create } from "zustand";

import { ContainerIdStoreState } from "../Types/types";

const containerIdStore = create<ContainerIdStoreState>()((set) => ({
  containerId: null,
  setContainerId: (containerId) => set({ containerId }),
}));

export default containerIdStore;
