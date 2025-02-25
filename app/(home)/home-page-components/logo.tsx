import Image from "next/image";

const Logo = () => {
    return (
        <div >
            <Image
                src="/images/oklocation-logo-white.svg"
                alt="Picture of the author"
                width={50}
                height={30}
                className="dark:hidden transition-transform transform hover:scale-110"
            />

            <Image
                src="/images/oklocation-logo.svg"
                alt="Picture of the author"
                width={50}
                height={30}
                className="hidden dark:block transition-transform transform hover:scale-110"
            />
        </div>
    );

}   

export default Logo;