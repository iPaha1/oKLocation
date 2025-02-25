

import { SignIn } from "@clerk/nextjs";


export default function Page() {

  return (
    <div >
      <div className="h-full flex items-center justify-center mt-20">
        <SignIn path="/sign-in" />
      </div>
      <div className="mt-20">
      </div>
    </div>
  );
}