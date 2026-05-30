import { Form, Head } from '@inertiajs/react';

import InputError from '@/components/shared/input-error';
import TextLink from '@/components/shared/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { login } from '@/routes';
import { store } from '@/routes/register';

export default function Register() {
    return (
        <AuthLayout
            title="Create an account"
            description="Enter your details below to get started"
        >
            <Head title="Register" />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="flex flex-col gap-6"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label
                                    htmlFor="name"
                                    className="text-[#1A1A2E]/70"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    Name
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Full name"
                                    className="border-[#1A1A2E]/15" style={{ backgroundColor: '#ffffff' }}
                                />
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="email"
                                    className="text-[#1A1A2E]/70"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    Email address
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    tabIndex={2}
                                    autoComplete="email"
                                    name="email"
                                    placeholder="email@example.com"
                                    className="border-[#1A1A2E]/15" style={{ backgroundColor: '#ffffff' }}
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password"
                                    className="text-[#1A1A2E]/70"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    Password
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={3}
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Password"
                                    className="border-[#1A1A2E]/15" style={{ backgroundColor: '#ffffff' }}
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="text-[#1A1A2E]/70"
                                    style={{ fontFamily: "'Outfit', sans-serif" }}
                                >
                                    Confirm password
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    tabIndex={4}
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Confirm password"
                                    className="border-[#1A1A2E]/15" style={{ backgroundColor: '#ffffff' }}
                                />
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="mt-2 w-full bg-[#1A1A2E] hover:bg-[#2A2A4E] text-[#FAF7F2]"
                                tabIndex={5}
                                data-test="register-user-button"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                                {processing && <Spinner />}
                                Create account
                            </Button>
                        </div>

                        <div
                            className="text-center text-sm text-[#1A1A2E]/50"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                            Already have an account?{' '}
                            <TextLink
                                href={login()}
                                tabIndex={6}
                                className="text-[#1A1A2E] hover:text-[#1A1A2E]/80"
                            >
                                Log in
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
