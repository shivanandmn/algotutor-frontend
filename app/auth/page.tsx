"use client";

export const dynamic = "force-dynamic";

import { Suspense } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useStore from "@/lib/store/UserStore";
import { useGoogleLogin, useGoogleOneTapLogin } from "@react-oauth/google";
import axios from "axios";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function PageContent() {
  const { login, isLogged } = useStore();
  const searchParams = useSearchParams();

  const search = searchParams.get("callback");

  console.log(search, "this is callback");

  if (isLogged) {
    window.location.href = `${search}`;
  }

  const handleLogin = async (token: string) => {
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google/callback`,
      { token: token }
    );

    // const recivedToken = response.data.token;

    // // Store the token in a cookie
    // document.cookie = `token=${recivedToken}; path=/`;
    // console.log(recivedToken);

    if (response.status === 200) {
      console.log("success");
      console.log(response.data);
      const token = response.data.token;
      // Store the token in local storage
      localStorage.setItem("token", token);
      login(response.data.user, token);
      // window.location.href = "/question/two-sum";
    }
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const loginClick = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      console.log(tokenResponse);

      const data = await handleLogin(tokenResponse.access_token);
    },
  });

  return (
    <div className="dark p-4 bg-black overflow-hidden min-h-screen h-screen flex flex-col min-w-screen">
      <header className="flex w-full justify-between border-b-2 pb-2">
        <Link
          href={"/"}
          className="font-bold dark:text-primary  text-[18px] tracking-widest "
        >
          AlgoTutor
        </Link>
      </header>
      <div className="w-full h-screen flex justify-center items-center">
        <Button onClick={() => loginClick()}>Login With Google</Button>
      </div>
    </div>
  );
}


export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PageContent />
    </Suspense>
  );
}
