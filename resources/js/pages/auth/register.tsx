import RegisteredUserController from '@/actions/App/Http/Controllers/Auth/RegisteredUserController';
import { login } from '@/routes';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
export default function Register() {
    return (
        <AuthLayout
            title="Crear cuenta"
            description="Introduce tus datos para registrarte"
        >
            <Head title="Registro" />
            <Form
                {...RegisteredUserController.store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                className="w-full max-w-md rounded-2xl bg-white/70 p-8 shadow-2xl backdrop-blur-md dark:bg-slate-800/90 "
            >
                {({ processing, errors }) => (
                    <>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold tracking-wide">
                                    Nombre completo
                                </Label>
                                <Input
                                    id="name"
                                    type="text"
                                    required
                                    autoFocus
                                    autoComplete="name"
                                    name="name"
                                    placeholder="Ej: Ana García"
                                    className="rounded-lg border-slate-300 bg-white/60 focus:border-green-500 focus:ring-green-500 dark:border-slate-600 dark:bg-slate-700/60"
                                />
                                <InputError message={errors.name} className="mt-1" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold tracking-wide">
                                    Correo electrónico
                                </Label>
                                <Input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    name="email"
                                    placeholder="tu@ejemplo.com"
                                    className="rounded-lg border-slate-300 bg-white/60 focus:border-black focus:ring-black dark:border-slate-600 dark:bg-slate-700/60"
                                />
                                <InputError message={errors.email} className="mt-1" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-semibold tracking-wide">
                                    Contraseña
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    name="password"
                                    placeholder="Mín. 8 caracteres"
                                    className="rounded-lg border-slate-300 bg-white/60 focus:border-black focus:ring-black dark:border-slate-600 dark:bg-slate-700/60"
                                />
                                <InputError message={errors.password} className="mt-1" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password_confirmation" className="text-sm font-semibold tracking-wide">
                                    Confirmar contraseña
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    name="password_confirmation"
                                    placeholder="Repite la contraseña"
                                    className="rounded-lg border-slate-300 bg-white/60 focus:border-black focus:ring-black dark:border-slate-600 dark:bg-slate-700/60"
                                />
                                <InputError message={errors.password_confirmation} className="mt-1" />
                            </div>
                            <Button
                                type="submit"
                                className="w-full rounded-lg bg-black font-semibold text-white shadow-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:opacity-60"
                                disabled={processing}
                            >
                                {processing ? (
                                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    'Crear cuenta'
                                )}
                            </Button>
                        </div>

                        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
                            ¿Ya tienes una cuenta?{' '}
                            <TextLink href={login()}  className="font-semibold text-indigo-600 hover:text-indigo-500">
                                Inicia sesión
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}
