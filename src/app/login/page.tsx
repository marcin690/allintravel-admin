// app/login/page.tsx
import SignInForm from "@/app/login/SignInForm";

export const metadata = {
    title: 'Logowanie',
};

export default function
    LoginPage() {
    return (
        <div className="flex justify-center items-center ">
            <SignInForm />
        </div>

    );
}
