import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserStore {
  username: string;
  isSet: boolean;
  isLogged: boolean;
  user: any;
  token: string;
  setUsername: (username: string) => void;
  clearUsername: () => void;
  login: (user: any, token: string) => void;
}

const useStore = create(
  persist<UserStore>(
    (set) => ({
      username: "",
      isSet: false,
      isLogged: false,
      user: null,
      token: "",
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
      login: (user: any, token: string) =>
        set(() => ({
          user,
          token,
          isLogged: true,
        })),
    }),
    {
      name: "username",
    }
  )
);

export default useStore;
