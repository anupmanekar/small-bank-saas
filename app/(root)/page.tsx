import HeaderBox from '@/components/HeaderBox'
import { TotalBalanceBox } from '@/components/TotalBalanceBox';
import RightSideBar from "@/components/RightSideBar";

import React from 'react'
import { getLoggedInUser } from '@/lib/actions/user.actions';
import { getAccounts, getAccount } from '@/lib/actions/bank.actions';
import RecentTransactions from '@/components/RecentTransactions';

const Home = async ({searchParams: {id, page}}: SearchParamProps) => {
    const currentPage = Number(page as string) || 1;
    const loggedIn = await getLoggedInUser();
    console.log('loggedIn', loggedIn);
    const accounts = await getAccounts({userId: loggedIn?.$id});
    if (!accounts) return;
    const accountsData = accounts?.data;
    const appwriteItemId = (id as string) || accountsData[0]?.appwriteItemId;

    const account = await getAccount({appwriteItemId});
    console.log('accountsData', accountsData);
    console.log('accounts', accounts);
    return (
        <section className='home'>
            <div className='home-content'>
                <header className='home-header'>
                    <HeaderBox 
                        type="greeting" 
                        title="Welcome" 
                        user={loggedIn?.firstName || 'Guest'} 
                        subtext="Access & Manage your account efficiently and earn more with Crypto"/>
                    
                    <TotalBalanceBox 
                        accounts={accountsData}
                        totalBanks={accounts?.totalBanks}
                        totalCurrentBalance={accounts?.totalCurrentBalance}
                    />
                </header>
                <RecentTransactions 
                    accounts={accountsData}
                    transactions={accounts?.transactions}
                    appwriteItemId={appwriteItemId}
                    page={currentPage}
                />

            </div>
            <RightSideBar 
                user={loggedIn} 
                banks={accountsData?.slice(0, 2)}
                transactions={accounts?.transactions}
            />

        </section>
    )
}

export default Home