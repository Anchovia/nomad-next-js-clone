"use server";

import {
    PASSWORD_MIN_LENGTH,
    PASSWORD_MIN_LENGTH_ERROR,
    PASSWORD_REGEX,
    PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
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
            .transform((username) => `!${username}!`)
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
            .min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_ERROR)
            .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
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
    const result = formSchema.safeParse(data);
    if (!result.success) {
        return result.error.flatten();
    } else {
        console.log(result.data);
    }
}
