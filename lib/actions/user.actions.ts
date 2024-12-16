'use server';

import { createAdminClient, createSessionClient } from "@/lib/appwrite";
import { ID } from "node-appwrite";
import { cookies } from 'next/headers';
import { encryptId, extractCustomerIdFromUrl, parseStringify } from "../utils";
import { CountryCode, ProcessorTokenCreateRequest, ProcessorTokenCreateRequestProcessorEnum, Products } from "plaid";
import { count } from "console";
import { plaidClient } from "../plaid";
import { parse } from "path";
import { addFundingSource, createDwollaCustomer } from "./dwolla.actions";

const {
    APPWRITE_DATABASE_ID: DATABASE_ID,
    APPWRITE_USER_COLLECTION_ID: USER_COLLECTION_ID,
    APPWRITE_BANK_COLLECTION_ID: BANK_COLLECTION_ID
} = process.env;

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

export const signUp = async ({password, ...userData}: SignUpParams) => {
    const { email, firstName, lastName } = userData;
    try {
        const { account, database } = await createAdminClient();
        const name = `${firstName} ${lastName}`;
        const newUserAccount = await account.create(
            ID.unique(), 
            email, 
            password, 
            name
        );

        if (!newUserAccount) throw Error("Failed to create user account");

        const dwollaCustomerUrl = await createDwollaCustomer({
            ...userData,
            type: "personal",
        });

        if (!dwollaCustomerUrl) throw Error("Failed to create Dwolla customer");

        const dwollaCustomerId = extractCustomerIdFromUrl(dwollaCustomerUrl);

        const newUser = await database.createDocument(
            DATABASE_ID!,
            USER_COLLECTION_ID!,
            ID.unique(),
            {
                ...userData,
                userId: newUserAccount.$id,
                dwollaCustomerId,
                dwollaCustomerUrl,
            }
        )
        const session = await account.createEmailPasswordSession(email, password);

        (await cookies()).set("appwrite-session", session.secret, {
            path: "/",
            httpOnly: true,
            sameSite: "strict",
            secure: true,
        }); 
        return parseStringify(newUser);  
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

export const createLinkToken = async (user: User) => {
    try {
        const tokenParams = {
            user: {
                client_user_id: user.$id
            }, 
            client_name: `${user.firstName} ${user.lastName}`,
            products: ['auth'] as Products[],
            language: 'en',
            country_codes: ['US'] as CountryCode[],
        }
        const response = await plaidClient.linkTokenCreate(tokenParams);
        console.log(response.statusText);
        console.log(response);
        return parseStringify({linkToken: response.data.link_token});
    } catch (error) {
        console.error(error);
        throw Error("Failed to create link token");
    }
}

export const createBankAccount = async ({
    userId,
    bankId,
    accountId,
    accessToken,
    fundingSourceUrl,
    sharableId
}: createBankAccountProps) => {
    try {
        const { database } = await createAdminClient();
        const bankAccount = await database.createDocument(
            DATABASE_ID!,
            BANK_COLLECTION_ID!,
            ID.unique(),
            {
                userId,
                bankId,
                accountId,
                accessToken,
                fundingSourceUrl,
                sharableId
            }
        );
        return parseStringify(bankAccount);
    } catch (error) {
        console.error(error);
    }
};

export const exchangePublicToken = async ({publicToken, user}: exchangePublicTokenProps) => {
    try {
        const response = await plaidClient.itemPublicTokenExchange({
            public_token: publicToken
        });
        const accessToken = response.data.access_token;
        const itemId = response.data.item_id;

        const accountsResponse = await plaidClient.accountsGet({
            access_token: accessToken
        });

        const accountsData = accountsResponse.data.accounts[0];

        const request: ProcessorTokenCreateRequest = {
            access_token: accessToken,
            account_id: accountsData.account_id,
            processor: "dwolla" as ProcessorTokenCreateRequestProcessorEnum,
        };

        const processorTokenResponse = await plaidClient.processorTokenCreate(request);
        const processorToken = processorTokenResponse.data.processor_token;

        const fundingSourceUrl = await addFundingSource({
            dwollaCustomerId: user.dwollaCustomerId,
            processorToken: processorToken,
            bankName: accountsData.name,
        });

        if (!fundingSourceUrl) throw Error;

        await createBankAccount({
            userId: user.$id,
            bankId: itemId,
            accountId: accountsData.account_id,
            accessToken: accessToken,
            fundingSourceUrl,
            sharableId: encryptId(accountsData.account_id),
        });
        return parseStringify(response.data);
    } catch (error) {
        console.error(error);
    }
}