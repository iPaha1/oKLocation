

import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div >
      <div className="h-full flex items-center justify-center mt-20">
        <SignUp path="/sign-up" />
      </div>
      <div className="mt-20">
      </div>
    </div>
  );;
}