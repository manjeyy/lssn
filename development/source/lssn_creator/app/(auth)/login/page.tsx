import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="bg-[url('https://thumbs.dreamstime.com/b/earth-view-outer-space-background-night-city-lights-blue-shining-stars-galaxy-55622778.jpg')] bg-cover flex min-h-screen flex-col items-center justify-center p-6 md:p-10">
      <div className="w-screen h-screen absolute top-0 left-0 z-1 backdrop-blur-xl ">
      </div>
      <div className="w-full max-w-sm md:max-w-4xl z-5">
        <LoginForm />
      </div>
    </div>
  )
}
