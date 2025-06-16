"use client";
import useStore from "@/lib/store/UserStore";
import Link from "next/link";
import React from "react";
import { Input } from "./ui/input";

function Header() {
  const { username, isSet, setUsername } = useStore();

  return (
    <header className="flex w-full justify-between items-center border-b-2 pb-2">
      <Link
        href={"/"}
        className="font-bold dark:text-primary tracking-wider text-[18px]"
      >
        AlgoTutor
      </Link>

      <div className="flex text-gray-200 gap-4 items-center">
        {!isSet ? (
          <Input
            type="text"
            placeholder="Enter your username"
            className="w-48"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value) {
                setUsername(e.currentTarget.value);
              }
            }}
          />
        ) : (
          <span className="text-[14px] text-gray-400">
            Welcome, {username}!
          </span>
        )}
      </div>
    </header>
  );
}

export default Header;
