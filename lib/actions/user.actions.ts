"use server";

import { cookies } from "next/headers";
import { ID } from "node-appwrite";
import { createAdminClient, createSessionClient } from "../appwrite";
import { parseStringify } from "../utils";

/**
 * Signs in a user with the provided email and password.
 *
 * @param {signInProps} email - The email of the user.
 * @param {signInProps} password - The password of the user.
 * @return {Promise<string>} A promise that resolves to a string representation of the user session.
 */
export const signIn = async ({ email, password }: signInProps) => {
  try {
    const { account } = await createAdminClient();
    const response = await account.createEmailPasswordSession(email, password);

    return parseStringify(response);
  } catch (error) {
    console.error("Error", error);
  }
};

/**
 * Creates a new user account using the provided user data.
 *
 * @param {SignUpParams} userData - The data for the new user account, including email, password, first name, and last name.
 * @return {Promise<string>} A promise that resolves to a string representation of the newly created user account.
 */
export const signUp = async (userData: SignUpParams) => {
  const { email, password, firstName, lastName } = userData;

  try {
    const { account } = await createAdminClient();

    const newUserAccount = await account.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );
    const session = await account.createEmailPasswordSession(email, password);

    cookies().set("appwrite-session", session.secret, {
      path: "/",
      httpOnly: true,
      sameSite: "strict",
      secure: true,
    });

    return parseStringify(newUserAccount);
  } catch (error) {
    console.error("Error", error);
  }
};

/**
 * Retrieves the logged-in user's information.
 *
 * @return {Promise<string | null>} A promise that resolves to a string representation of the logged-in user's information, or null if an error occurs.
 */
export async function getLoggedInUser() {
  try {
    const { account } = await createSessionClient();

    const user = await account.get();

    return parseStringify(user);
  } catch (error) {
    console.log(error);
    return null;
  }
}

export const logoutAccount = async () => {
  try {
    const { account } = await createSessionClient();
    cookies().delete("appwrite-session");

    await account.deleteSession("current");
  } catch (error) {
    return null;
  }
};