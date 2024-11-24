"use server";

import {
    PASSWORD_MIN_LENGTH,
    PASSWORD_MIN_LENGTH_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import bcrypt from "bcrypt";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

const checkUsername = (username: string) => !username.includes("potato");
const checkPassword = ({
    password,
    confirmPassword,
}: {
    password: string;
    confirmPassword: string;
}) => password === confirmPassword;

const checkUniqueUsername = async (username: string) => {
    const user = await db.user.findUnique({
        where: {
            username,
        },
        select: {
            id: true,
        },
    });
    return !Boolean(user);
};

const checkUniqueUserEmail = async (email: string) => {
    const user = await db.user.findUnique({
        where: {
            email,
        },
        select: {
            id: true,
        },
    });
    return !Boolean(user);
};

const formSchema = z
    .object({
        username: z
            .string({
                invalid_type_error: "이름은 문자여야 합니다.",
                required_error: "이름은 필수입니다.",
            })
            .toLowerCase()
            .trim()
            //.transform((username) => `!${username}!`)
            .refine(checkUsername, "부적절한 단어는 사용할 수 없습니다.")
            .refine(checkUniqueUsername, "이미 사용중인 이름입니다."),
        email: z
            .string({
                invalid_type_error: "이메일은 문자여야 합니다.",
                required_error: "이메일은 필수입니다.",
            })
            .email("이메일 형식이 올바르지 않습니다.")
            .toLowerCase()
            .refine(checkUniqueUserEmail, "이미 사용중인 이메일입니다."),
        password: z
            .string()
            //.regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR)
            .min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_ERROR),
        confirmPassword: z
            .string()
            .min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_ERROR),
    })
    .refine(checkPassword, {
        message: "비밀번호가 일치하지 않습니다.",
        path: ["confirmPassword"],
    });

export async function handleCreateAccount(prevState: any, formData: FormData) {
    const data = {
        username: formData.get("username"),
        email: formData.get("email"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
    };
    const result = await formSchema.safeParseAsync(data);
    if (!result.success) {
        return result.error.flatten();
    } else {
        const hashedPassword = await bcrypt.hash(result.data.password, 12);
        const user = await db.user.create({
            data: {
                username: result.data.username,
                email: result.data.email,
                password: hashedPassword,
            },
            select: {
                id: true,
            },
        });
        const cookie = await getIronSession(cookies(), {
            cookieName: "test-cookie",
            password: process.env.COOKIE_PASSWORD!,
        });
        //@ts-ignore
        cookie.id = user.id;
        await cookie.save();
        redirect("/profile");
    }
}
