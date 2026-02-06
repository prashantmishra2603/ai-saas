import React from 'react'
import { assets } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const Hero = () => {

  const navigate = useNavigate()

  return (
    <div className='px-4 sm:px-20 xl:px-32 relative inline-flex flex-col w-full justify-center bg-[url(/gradientBackground.png)] bg-cover bg-no-repeat min-h-screen'>
      
      <div>
        <h1 className='text-4xl sm:text-5xl md:text-6xl font-bold text-center text-black'>
          Creating amazing content <br />
          with <span className='text-violet-500'>AI tools</span>
        </h1>

        <p className='text-center text-gray-600 mt-4'>
          Transform your ideas into stunning visuals and engaging content with our powerful AI platform.
          <br />
          Made By <span className='text-red-500'>Prashant</span>{' '}
          <span className='text-green-500'>Mishra</span>
        </p>
      </div>

      <div className='flex flex-wrap justify-center gap-4 mt-8 text-sm max-sm:text-xs'>
        <button
          onClick={() => navigate('/ai')}
          className='bg-violet-500 text-white px-10 py-3 rounded-lg border border-gray-300 hover:scale-105 active:scale-95 transition cursor-pointer'
        >
          Start creating now
        </button>

        <button className='bg-gray-800 text-white px-10 py-3 rounded-lg hover:bg-gray-900 transition-colors duration-200'>
          Watch demo
        </button>
      </div>

      <div className='flex items-center gap-4 mt-8 mx-auto text-gray-600'>
        <img src={assets.user_group} alt='User Group' className='h-8' />
        Trusted by 10k+ people
      </div>

    </div>
  )
}

export default Hero
