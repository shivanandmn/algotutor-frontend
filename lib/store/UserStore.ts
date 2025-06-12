import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStore {
  username: string;
  isSet: boolean;
  setUsername: (username: string) => void;
  clearUsername: () => void;
}

const useStore = create(
  persist<UserStore>(
    (set) => ({
      username: "",
      isSet: false,
      setUsername: (username: string) =>
        set(() => ({
          username,
          isSet: true,
        })),
      clearUsername: () =>
        set(() => ({
          username: "",
          isSet: false,
        })),
    }),
    {
      name: "username",
    }
  )
);

export default useStore;
