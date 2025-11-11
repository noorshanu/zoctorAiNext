import ResetPassword from "../../../pages-src/ResetPassword";

export const metadata = {
  title: "Reset Password",
  description: "Set a new password for your ZoctorAI account.",
};

export default function Page({ params }) {
  return <ResetPassword token={params.token} />;
}

