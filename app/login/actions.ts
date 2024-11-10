"use server";
import {
    PASSWORD_MIN_LENGTH,
    PASSWORD_MIN_LENGTH_ERROR,
    PASSWORD_REGEX,
    PASSWORD_REGEX_ERROR,
} from "@/lib/constants";
import { z } from "zod";

const formSchema = z.object({
    email: z.string().email("이메일 형식이 올바르지 않습니다.").toLowerCase(),
    password: z
        .string({ required_error: "비밀번호는 필수입니다." })
        .min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_ERROR)
        .regex(PASSWORD_REGEX, PASSWORD_REGEX_ERROR),
});

export async function handleLogin(prevState: any, formData: FormData) {
    const data = {
        email: formData.get("email"),
        password: formData.get("password"),
    };
    const result = formSchema.safeParse(data);
    if (!result.success) {
        return result.error.flatten();
    } else {
        console.log(result.data);
    }
}
