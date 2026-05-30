import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/shared/input-error';
import TextLink from '@/components/shared/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
    canRegister: boolean;
}

export default function Login({
    status,
    canResetPassword,
    canRegister,
}: LoginProps) {
    return (
        <AuthLayout
            title="Log in to your account"
            description="Enter your credentials below to continue"
        >
            <Head title="Log in" />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="username"
                                    className="text-[#1A1A2E]/70"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    Username
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    name="username"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="username"
                                    placeholder="Enter your username"
                                    className="border-[#1A1A2E]/15" style={{ backgroundColor: '#ffffff' }}
                                />
                                <InputError message={errors.username} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label
                                        htmlFor="password"
                                        className="text-[#1A1A2E]/70"
                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        Password
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm text-[#D4A853] hover:text-[#D4A853]/80"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    className="border-[#1A1A2E]/15" style={{ backgroundColor: '#ffffff' }}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                    className="border-[#1A1A2E]/20 data-[state=checked]:bg-[#D4A853] data-[state=checked]:border-[#D4A853]"
                                />
                                <Label
                                    htmlFor="remember"
                                    className="text-[#1A1A2E]/60"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    Remember me
                                </Label>
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full bg-[#1A1A2E] hover:bg-[#2A2A4E] text-[#FAF7F2]"
                                tabIndex={4}
                                disabled={processing}
                                data-test="login-button"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                {processing && <Spinner />}
                                Log in
                            </Button>
                        </div>

                        {canRegister && (
                            <div
                                className="text-center text-sm text-[#1A1A2E]/50"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                Don't have an account?{' '}
                                <TextLink
                                    href={register()}
                                    tabIndex={5}
                                    className="text-[#D4A853] hover:text-[#D4A853]/80"
                                >
                                    Sign up
                                </TextLink>
                            </div>
                        )}
                    </>
                )}
            </Form>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-[#8BA888]">
                    {status}
                </div>
            )}
        </AuthLayout>
    );
}
