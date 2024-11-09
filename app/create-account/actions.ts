"use server";

import { z } from "zod";

const passwordRegex = new RegExp(
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/
);

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
            .min(3, "이름이 너무 짧습니다.")
            .max(10, "이름이 너무 깁니다.")
            .toLowerCase()
            .trim()
            .transform((username) => `!${username}!`)
            .refine(checkUsername, "부적절한 단어는 사용할 수 없습니다."),
        email: z
            .string({
                invalid_type_error: "이메일은 문자여야 합니다.",
                required_error: "이메일은 필수입니다.",
            })
            .email("이메일을 입력해야합니다.")
            .toLowerCase(),
        password: z
            .string()
            .min(4, "비밀번호가 너무 짧습니다.")
            .regex(passwordRegex, "비밀번호가 너무 쉽습니다."),
        confirmPassword: z.string().min(4, "비밀번호가 너무 짧습니다."),
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
