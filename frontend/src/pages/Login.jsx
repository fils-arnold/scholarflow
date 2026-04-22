import LoginForm from '../components/Auth/LoginForm'

const Login = () => {
  return (
    <div 
      className="fixed inset-0 overflow-y-auto"
      style={{
        backgroundImage: "url('/image_fond.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      <div className="min-h-screen flex items-center justify-center py-12 px-4 bg-black/40">
        <LoginForm />
      </div>
    </div>
  )
}

export default Login
