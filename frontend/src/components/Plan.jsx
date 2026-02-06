import React from 'react'
import { PricingTable } from '@clerk/clerk-react'

const Billing = () => {
  return (
    <div className="px-4 sm:px-20 xl:px-32 py-24">
      
      <div className="text-center mb-14">
        <h1 className="text-4xl font-semibold text-slate-800">
          Choose a Plan
        </h1>
        <p className="mt-4 text-gray-500 max-w-xl mx-auto">
          Upgrade your account to unlock premium AI tools and higher limits.
        </p>
      </div>

      <div className="max-w-5xl mx-auto">
        <PricingTable />
      </div>

    </div>
  )
}

export default Billing
