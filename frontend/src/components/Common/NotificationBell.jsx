import { HiBell } from 'react-icons/hi'

const NotificationBell = () => {
  return (
    <button className="relative text-white hover:text-blue-200 transition duration-200 focus:outline-none">
      <HiBell className="text-2xl" />
      <span className="absolute top-0 right-0 inline-block w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-blue-600"></span>
    </button>
  )
}

export default NotificationBell
