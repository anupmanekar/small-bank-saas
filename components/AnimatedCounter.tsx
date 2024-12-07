'use client';

import React from 'react'
import CountUp from 'react-countup';

export const AnimatedCounter = ({amount}: {amount:number}) => {
  return (
    <div><CountUp 
        decimal='.'
        decimals={2}
        prefix='$'
        duration={1}
        end={amount}/>
    </div>
  )
}
