import HeaderBox from '@/components/HeaderBox'
import { TotalBalanceBox } from '@/components/TotalBalanceBox';
import RightSideBar from "@/components/RightSideBar";

import React from 'react'

const Home = () => {
    const loggedIn = {firstName: 'Anup', lastName: 'Kumar'};

    return (
        <section className='home'>
            <div className='home-content'>
                <header className='home-header'>
                    <HeaderBox 
                        type="greeting" 
                        title="Welcome" 
                        user={loggedIn?.firstName || 'Guest'} 
                        subtext="Access & Manage your account efficiently and earn more with Crypto"/>
                </header>
                <TotalBalanceBox 
                    accounts={[]}
                    totalBanks={0}
                    totalCurrentBalance={1250.35}
                />

            </div>
            <RightSideBar user={loggedIn} banks={[{name:'Solana Bank', currentBalance: 100}, {name: 'Ethereum Bank', currentBalance: 199}]}/>

        </section>
    )
}

export default Home