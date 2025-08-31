// src/app/login/SignInForm.tsx
'use client';

import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Input, Password, Button, Text } from 'rizzui';
import {apiFetch, apiLogin} from "@/utils/auth";
import {setAuthAfterLogin} from "@/utils/auth";

type LoginFormInputs = {
    username: string;
    password: string;
};

export default function SignInForm() {
    const router = useRouter();

    // Inicjalizujemy react-hook-form, ustawiamy defaultValues
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting }
    } = useForm<LoginFormInputs>({
        defaultValues: {
            username: '',
            password: ''
        }
    });


    const onSubmit: SubmitHandler<LoginFormInputs> = async (data) => {
        try {
            const res = await apiLogin
            ('/auth/authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (!res.ok) {
                const body = await res.json();
                throw new Error(body.message || 'Błąd logowania');
            }
            const { token } = await res.json();
            setAuthAfterLogin(token);
            router.push('/admin/trips');
        } catch (err: any) {
            alert(err.message);
        }
    };

    return (
        <form
            onSubmit={handleSubmit(onSubmit)}
            className="h-full  max-w-sm mx-auto p-6 bg-white rounded shadow"
        >
            {/* Username */}
            <div className="mb-4">
                <Input
                    label="Username"
                    placeholder="Wpisz nazwę użytkownika"
                    {...register('username', { required: 'Username jest wymagany' })}
                />
                {errors.username && (
                    <Text className="text-red-500 text-sm mt-1">
                        {errors.username.message}
                    </Text>
                )}
            </div>

            {/* Password */}
            <div className="mb-4">
                <Password
                    label="Password"
                    placeholder="Wpisz hasło"
                    {...register('password', {
                        required: 'Hasło jest wymagane',
                        minLength: { value: 4, message: 'Min. 4 znaki' }
                    })}
                />
                {errors.password && (
                    <Text className="text-red-500 text-sm mt-1">
                        {errors.password.message}
                    </Text>
                )}
            </div>

            {/* Submit */}
            <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
            >
                {isSubmitting ? 'Trwa logowanie…' : 'Zaloguj się'}
            </Button>
        </form>
    );
}
