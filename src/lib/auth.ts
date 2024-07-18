// src/auth.ts
import { Lucia, Session, User } from "lucia";
import db from "./db";
import { DrizzlePostgreSQLAdapter } from "@lucia-auth/adapter-drizzle";
import { sessionTable, userTable } from "./db/schema";
import { cache } from "react";
import { cookies } from "next/headers";
import { TUser } from "@/lib/types";

const adapter = new DrizzlePostgreSQLAdapter(db, sessionTable, userTable); // your adapter

export const lucia = new Lucia(adapter, {
  sessionCookie: {
    // this sets cookies with super long expiration
    // since Next.js doesn't allow Lucia to extend cookie expiration when rendering pages
    expires: false,
    attributes: {
      // set to `true` when using HTTPS
      secure: process.env.NODE_ENV === "production",
    },
  },
  getUserAttributes: (attributes) => {
    return {
      id: attributes.id,
      firstname: attributes.firstname,
      lastname: attributes.lastname,
      username: attributes.username,
      email: attributes.email,
      phone: attributes.phone,
      nationalId: attributes.nationalId,
      age: attributes.age,
      gender: attributes.gender,
      picture: attributes.picture,
      role: attributes.role,
      createdAt: attributes.createdAt,
      updatedAt: attributes.updatedAt,
    };
  },
});

export const validateRequest = cache(
  async (): Promise<
    { user: User; session: Session } | { user: null; session: null }
  > => {
    const sessionId = cookies().get(lucia.sessionCookieName)?.value ?? null;
    if (!sessionId) {
      return {
        user: null,
        session: null,
      };
    }

    const result = await lucia.validateSession(sessionId);
    // next.js throws when you attempt to set cookie when rendering page
    try {
      if (result.session && result.session.fresh) {
        const sessionCookie = lucia.createSessionCookie(result.session.id);
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
      if (!result.session) {
        const sessionCookie = lucia.createBlankSessionCookie();
        cookies().set(
          sessionCookie.name,
          sessionCookie.value,
          sessionCookie.attributes,
        );
      }
    } catch { }
    return result;
  },
);

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseUserAttributes: DatabaseUserAttributes;
  }
}


interface DatabaseUserAttributes {
  id: string;
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  phone: string;
  nationalId: string;
  age: string;
  gender: 'male' | 'female';
  picture: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  admin?: {
    id: string | number;
    super: boolean;
    user_id: string;
  }
  doctor?: {
    id: string | number;
    specialty: string;
    user_id: string;
  }
}