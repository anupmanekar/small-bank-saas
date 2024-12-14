'use client';

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Form,
} from "@/components/ui/form"
import CustomInput from '@/components/CustomInput';
import { authFormSchema } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const AuthForm = ({type}: {type: string}) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const formSchema = authFormSchema(type);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          email: "",
          password: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        setIsLoading(true);
        console.log(values)
        setIsLoading(false);
    }

    return (
        <section className='auth-form'>
            <header className='flex flex-col gap-5 md:gap-8'>
            <Link href="/" className="cursor-pointer flex items-center gap-1">
                <Image 
                src="/icons/logo.svg"
                width={34}
                height={34}
                alt="Crypto Bank logo"
                />
                <h1 className="text-26 font-ibm-plex-serif font-bold text-black-1">Crypto Bank</h1>
            </Link>
            <div className='flex flex-col gap-1 md:gap-3'>
                <h1 className='text-24 lg:text-36 font-semibold text-gray-900'>
                    {user ? 'Link Account' :  type === 'sign-in' ? 'Sign In' : 'Sign Up'}
                    <p className='text-16 font-normal text-gray-600'>
                        {user ? 'Link your account to get started' : 'Please enter your details'}
                    </p>
                </h1>
            </div>
            </header>
            {user ? (
                <div className='flex flex-col gap-4'>
                    { /* Plaid Link */}
                </div>
            ): (
                <>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        {type === 'sign-up' && (
                            <>
                                <div className='flex gap-4'>
                                    <CustomInput control={form.control} name="firstName" label="First Name" placeholder="Please enter your first name"/>
                                    <CustomInput control={form.control} name="lastName" label="Last Name" placeholder="Please enter your last name"/>
                                </div>
                                <CustomInput control={form.control} name="address" label="Address" placeholder="Please enter your address"/>
                                <div className='flex gap-4'>
                                    <CustomInput control={form.control} name="state" label="State" placeholder="Example: NY"/>
                                    <CustomInput control={form.control} name="postalCode" label="Postal Code" placeholder="Example: 11101"/>
                                </div>
                                <div className='flex gap-4'>
                                    <CustomInput control={form.control} name="dob" label="Date of Birth" placeholder="YYYY-MM-DD"/>
                                    <CustomInput control={form.control} name="ssn" label="SSN" placeholder="Example: 1234"/>
                                </div>
                                
                            </>
                        )
                        }
                        <CustomInput control={form.control} name="email" label="Email" placeholder="Please enter your email"/>
                        <CustomInput control={form.control} name="password" label="Password" placeholder="Please enter your password"/>
                        <div className='flex flex-col gap-4'>
                        <Button type="submit" className='form-btn' disabled={isLoading}>
                            { isLoading ? (
                                <>
                                    <Loader2 size={20}
                                    className='animate-spin'/> &nbsp; 
                                    Loading....
                                </>
                                ) : type === 'sign-in' ? 'Sign In' : 'Sign Up'
                            }
                        </Button>
                        </div>
                        
                    </form>
                </Form>
                <footer className='flex justify-center gap-1'>
                    <p className='text-14 font-normal text-gray-600'>
                      {type === 'sign-in' ? 'Don’t have an account?' : 'Already have an account?'}  
                    </p>
                    <Link href={type === 'sign-in' ? '/sign-up' : '/sign-in'} className='form-link'>
                        {type === 'sign-in' ? 'Sign Up' : 'Sign In'}
                    </Link>
                </footer>
                </>
            )}
        </section>
    )
}

export default AuthForm