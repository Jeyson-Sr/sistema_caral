import AuthenticatedSessionController from '@/actions/App/Http/Controllers/Auth/AuthenticatedSessionController';
import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import { register } from '@/routes';
import { request } from '@/routes/password';
import { Form, Head } from '@inertiajs/react';
import { LoaderCircle, Mail, Lock } from 'lucide-react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: Readonly<LoginProps>) {
    return (
        <AuthLayout title="Bienvenido de vuelta" description="Ingresa tus credenciales para continuar">
            <Head title="Iniciar sesión" />

            <div className="mx-auto w-full max-w-md">
                {/* Evito pasar className directamente a Card (si su tipado no lo acepta) */}
                <Card>
                    <div className="border-none shadow-2xl px-6 py-8">
                        <CardHeader>
                            {/* Muevo las clases al wrapper interno */}
                            <div className="space-y-1 pb-6">
                                <CardTitle className="text-center text-2xl font-bold tracking-tight">Iniciar sesión</CardTitle>
                                <CardDescription className="text-center">Ingresa tu correo y contraseña para acceder</CardDescription>
                            </div>
                        </CardHeader>

                        <CardContent>
                            {/* Si Form acepta className, lo dejo; si no, podrías aplicar wrapper igual */}
                            <Form {...AuthenticatedSessionController.store.form()} resetOnSuccess={['password']} className="flex flex-col gap-5">
                                {({ processing, errors }) => (
                                        <div className="grid gap-4 ">
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    name="email"
                                                    required
                                                    autoFocus
                                                    
                                                    autoComplete="email"
                                                    placeholder="correo@ejemplo.com"
                                                    className="pl-10"
                                                />
                                                <InputError message={errors.email} />
                                            </div>

                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                                <Input
                                                    id="password"
                                                    type="password"
                                                    name="password"
                                                    required
                                                    
                                                    autoComplete="current-password"
                                                    placeholder="Contraseña"
                                                    className="pl-10"
                                                />
                                                <InputError message={errors.password} />
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id="remember" name="remember"  />
                                                    <Label htmlFor="remember" className="text-sm">Recuérdame</Label>
                                                </div>
                                                {canResetPassword && (
                                                    <TextLink href={request()} className="text-sm" >
                                                        ¿Olvidaste tu contraseña?
                                                    </TextLink>
                                                )}
                                            </div>

                                            <Button type="submit" className="w-full"  disabled={processing}>
                                                {processing && <LoaderCircle className="mr-3 h-4 w-4 animate-spin" />}
                                                Iniciar sesión
                                            </Button>
                                        </div>
                                )}
                            </Form>
                        </CardContent>

                        <CardFooter>
                            {/* Muevo las clases al wrapper del Footer */}
                             <div className="flex justify-center border-t border-gray-200 pt-5 w-full">
                                <p className="text-sm text-gray-600">
                                    ¿No tienes una cuenta?{' '}
                                    <TextLink href={register()} className="font-medium text-indigo-600 hover:text-indigo-800">
                                        Regístrate
                                    </TextLink>
                                </p>
                            </div>
                        </CardFooter>
                    </div>
                </Card>

                {status && (
                    <div className="mt-4  text-center text-sm font-medium text-green-600">
                        {status}
                    </div>
                )}
            </div>
        </AuthLayout>
    );
}
