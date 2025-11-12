import PageMeta from "../../components/common/PageMeta";
import AuthLayout from "./AuthPageLayout";
import SignInForm from "../../components/auth/SignInForm";

export default function SignIn() {
  return (
    <>
      <PageMeta
        title="Sign In | RoleQuest - AI Access Guard"
        description="Sign in to RoleQuest for secure, role-based AI access with real-time guardrails"
      />
      <AuthLayout>
        <SignInForm />
      </AuthLayout>
    </>
  );
}
