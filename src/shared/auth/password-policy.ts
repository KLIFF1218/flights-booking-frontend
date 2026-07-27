export const PASSWORD_POLICY_MESSAGE =
  "Password must be 8–128 characters and include at least one letter and one number";

const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d)[\S]{8,128}$/;

export function isStrongPassword(password: string): boolean {
  return PASSWORD_PATTERN.test(password);
}
