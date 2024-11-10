export const PASSWORD_MIN_LENGTH = 4;
export const PASSWORD_MIN_LENGTH_ERROR = "비밀번호가 너무 짧습니다.";
export const PASSWORD_REGEX = new RegExp(
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).+$/
);
export const PASSWORD_REGEX_ERROR = "비밀번호가 너무 쉽습니다.";
