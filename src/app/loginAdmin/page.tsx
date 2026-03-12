import { redirect } from "next/navigation";

export default function LoginAdminRedirectPage() {
  redirect("/login/personal");
}
