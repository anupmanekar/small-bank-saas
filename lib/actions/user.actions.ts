'use server';

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { cookies } from 'next/headers';
import { parseStringify } from "../utils";

export const signIn = async ({email, password}: signInProps) => {
    try {
        const { account } = await createAdminClient();
        const session = await account.createEmailPasswordSession(email, password);
        (await cookies()).set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        });
        const user = await account.get();
        return parseStringify(user);
    }
    catch (error) {
        console.log(error);
    }
}

export const signUp = async (userData: SignUpParams) => {
    const { email, password, firstName, lastName } = userData;
    try {
        const { account } = await createAdminClient();
        const name = `${firstName} ${lastName}`;
        const newUserAccount = await account.create(
            ID.unique(), 
            email, 
            password, 
            name
        );
        const session = await account.createEmailPasswordSession(email, password);

        (await cookies()).set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        }); 
        return parseStringify(newUserAccount);  
    }
    catch (error) {
        console.log(error);
    }
}

// ... your initilization functions

export async function getLoggedInUser() {
    try {
        const { account } = await createSessionClient();
        const user = await account.get();
        return parseStringify(user);
    } catch (error) {
      return null;
    }
  }

export const logoutAccount = async () => {
    try {
        const { account } = await createSessionClient();
        (await cookies()).delete("appwrite-session");
        await account.deleteSession("current");
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};