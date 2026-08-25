import React, { useState } from 'react'
import Markdown from 'react-markdown'
import { Copy, Check, Download, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

const typeBadgeStyles = {
  article: 'bg-blue-50 text-blue-700 border-blue-200',
  'blog-title': 'bg-purple-50 text-purple-700 border-purple-200',
  image: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'resume-review': 'bg-teal-50 text-teal-700 border-teal-200',
  'code-review': 'bg-sky-50 text-sky-700 border-sky-200',
  summarize: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  email: 'bg-pink-50 text-pink-700 border-pink-200',
  grammar: 'bg-green-50 text-green-700 border-green-200',
  social: 'bg-amber-50 text-amber-700 border-amber-200',
  translate: 'bg-violet-50 text-violet-700 border-violet-200',
}

const CreationItem = ({ item, onDelete }) => {
  const [expanded, setExpanded] = useState(false)
  const [copied, setCopied] = useState(false)

  const copyContent = (e) => {
    e.stopPropagation()
    if (!item.content) return
    navigator.clipboard.writeText(item.content)
    setCopied(true)
    toast.success('Copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadContent = (e) => {
    e.stopPropagation()
    if (!item.content) return

    if (item.type === 'image') {
      const link = document.createElement('a')
      link.href = item.content
      link.download = `creation-image-${item.id || Date.now()}.png`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('Opening image download...')
      return
    }

    const element = document.createElement('a')
    const file = new Blob([item.content], { type: 'text/markdown' })
    element.href = URL.createObjectURL(file)
    element.download = `${item.type}-${item.id || Date.now()}.md`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
    toast.success('Downloaded file!')
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    if (onDelete) {
      onDelete(item.id)
    }
  }

  const badgeClass = typeBadgeStyles[item.type] || 'bg-blue-50 text-blue-700 border-blue-200'

  return (
    <div 
      onClick={() => setExpanded(!expanded)} 
      className='p-4 bg-white border border-gray-200 rounded-lg cursor-pointer hover:border-gray-300 hover:shadow-sm transition-all'
    >
      <div className='flex justify-between items-center gap-4'>
        <div className='overflow-hidden flex-1'>
          <h2 className='font-medium text-slate-800 truncate'>{item.prompt}</h2>
          <p className='text-xs text-gray-500 mt-1 capitalize'>
            {item.type.replace('-', ' ')} • {new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <span className={`px-3 py-0.5 border rounded-full text-xs font-medium capitalize ${badgeClass}`}>
            {item.type.replace('-', ' ')}
          </span>
          {expanded ? <ChevronUp className='w-4 h-4 text-gray-400' /> : <ChevronDown className='w-4 h-4 text-gray-400' />}
        </div>
      </div>
      
      {expanded && (
        <div className='mt-4 pt-4 border-t border-gray-100 text-sm text-slate-700'>
          {/* Action Toolbar */}
          <div className='flex justify-end items-center gap-2 mb-3'>
            {item.type !== 'image' && (
              <button
                type='button'
                onClick={copyContent}
                className='flex items-center gap-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-md transition'
              >
                {copied ? <Check className='w-3 h-3 text-green-600' /> : <Copy className='w-3 h-3' />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
            <button
              type='button'
              onClick={downloadContent}
              className='flex items-center gap-1 text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-md transition'
            >
              <Download className='w-3 h-3' />
              Download
            </button>
            {onDelete && (
              <button
                type='button'
                onClick={handleDelete}
                className='flex items-center gap-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-md transition'
              >
                <Trash2 className='w-3 h-3' />
                Delete
              </button>
            )}
          </div>

          <div className="reset-tw max-h-96 overflow-y-auto pr-1">
             {item.type === 'image' ? (
               <img src={item.content} alt="Generated" className='max-w-md rounded-lg object-cover' />
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