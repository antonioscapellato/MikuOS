
// NextJS
import { useRouter } from 'next/router'

// HeroUI
import { Button, Image } from '@heroui/react'

export default function Custom404() {
  const router = useRouter()

  const handleRedirect = () => {
    window.location.href = 'https://miku.so'
  }

  return (
    <div className='h-screen px-8 flex flex-col items-center align-center justify-center'>
      <Image
        src="/miku_sad_white.png"
        alt="Error 404 -Sad Miku"
        width={300}
        height={300}
      />
      <h1 className='text-4xl font-semibold'>
        Page Not Found
      </h1>
      <p className='mb-4'>
        The page you are looking for does not exist.
      </p>
      <Button 
        onPress={handleRedirect}
        className={"text-xl bg-black rounded-full py-2 px-8 text-white"}
      >
        Go to <span className={"underline"}>miku.so</span>
      </Button>
    </div>
  )
}
