"use server";

import {
    PASSWORD_MIN_LENGTH,
    PASSWORD_MIN_LENGTH_ERROR,
} from "@/lib/constants";
import db from "@/lib/db";
import getSession from "@/lib/session";
import bcrypt from "bcrypt";
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
            .refine(checkUsername, "부적절한 단어는 사용할 수 없습니다."),
        email: z
            .string({
                invalid_type_error: "이메일은 문자여야 합니다.",
                required_error: "이메일은 필수입니다.",
            })
            .email("이메일 형식이 올바르지 않습니다.")
            .toLowerCase(),
        password: z
            .string()
            //.regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR)
            .min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_ERROR),
        confirmPassword: z
            .string()
            .min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_ERROR),
    })
    .superRefine(async ({ username }, ctx) => {
        const user = await db.user.findUnique({
            where: {
                username,
            },
            select: {
                id: true,
            },
        });
        if (user) {
            ctx.addIssue({
                code: "custom",
                message: "사용자명이 이미 사용중입니다.",
                path: ["username"],
                fatal: true,
            });
            return z.NEVER;
        }
    })
    .superRefine(async ({ email }, ctx) => {
        const user = await db.user.findUnique({
            where: {
                email,
            },
            select: {
                id: true,
            },
        });
        if (user) {
            ctx.addIssue({
                code: "custom",
                message: "이메일이 이미 사용중입니다.",
                path: ["email"],
                fatal: true,
            });
            return z.NEVER;
        }
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
    const result = await formSchema.spa(data);
    if (!result.success) {
        console.log(result.error.flatten());
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
        const session = await getSession();
        session.id = user.id;
        await session.save();
        redirect("/profile");
    }
}
