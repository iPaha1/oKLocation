// app/page.tsx

// import ProcessShowcase from "./(home)/home-page-components/process-show-case";
// import { auth } from "@clerk/nextjs/server";
import { Footer } from "@/components/ui/global/footer";
import LandingPageBanner from "./(home)/home-page-components/landing-page-banner";
import BackgroundPaths from "./(home)/home-page-components/landing-with-3d";
import Nabar from "./(home)/home-page-components/navbar";


export const revalidate = 3600;

export default async function HomePage() {

  // const { userId } = auth();
  // console.log("this is the userId in the home page :", userId);

    
  return (
    <>
      <Nabar />
      <BackgroundPaths />
      <LandingPageBanner />
      <Footer />
    </>
  );
}