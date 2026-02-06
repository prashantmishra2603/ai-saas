import React, { useState } from 'react'
import Markdown from 'react-markdown'

const CreationItem = ({ item }) => {
  const [expanded, setExpanded] = useState(false)

  return (
    <div 
      onClick={() => setExpanded(!expanded)} 
      className='p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:shadow-md transition-shadow'
    >
      <div className='flex justify-between items-center gap-4'>
        <div className='overflow-hidden'>
          <h2 className='font-medium truncate'>{item.prompt}</h2>
          <p className='text-xs text-gray-500 mt-1'>
            {item.type} - {new Date(item.created_at).toLocaleDateString()}
          </p>
        </div>
        <button className='bg-blue-50 text-blue-700 px-4 py-1 rounded-full text-xs font-medium'>
          {item.type}
        </button>
      </div>
      
      {expanded && (
        <div className='mt-4 pt-4 border-t text-sm text-slate-700 overflow-hidden'>
          <div className="reset-tw">
             {/* If type is image, display image, else markdown content [02:12:20] */}
             {item.type === 'image' ? (
               <img src={item.content} alt="Generated" className='max-w-md rounded-lg' />
             ) : (
               <Markdown>{item.content}</Markdown>
             )}
          </div>
        </div>
      )}
    </div>
  )
}

export default CreationItem