'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { use_user_profile } from '@/lib/hooks/queries/use-user-profile'
import { useUpdateProfile } from '@/lib/hooks/mutations/use-update-profile'
import { useUpdatePassword } from '@/lib/hooks/mutations/use-update-password'
import { profileEditSchema, passwordChangeSchema, ProfileEditFormData, PasswordChangeFormData } from '@/lib/schemas/profile'
import { Loader2, User, Lock } from 'lucide-react'

export default function ProfilePage() {
    const { data: profile, isLoading: profile_loading } = use_user_profile()
    const update_profile = useUpdateProfile()
    const update_password = useUpdatePassword()

    const profile_form = useForm<ProfileEditFormData>({
        resolver: zodResolver(profileEditSchema),
        values: {
            name: profile?.name || ''
        }
    })

    const password_form = useForm<PasswordChangeFormData>({
        resolver: zodResolver(passwordChangeSchema),
        defaultValues: {
            current_password: '',
            new_password: '',
            confirm_password: ''
        }
    })

    const on_profile_submit = async (data: ProfileEditFormData) => {
        await update_profile.mutateAsync(data.name)
    }

    const on_password_submit = async (data: PasswordChangeFormData) => {
        await update_password.mutateAsync(data)
        password_form.reset()
    }

    if (profile_loading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Profile Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account information and security settings
                </p>
            </div>

            {/* Profile Information */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        Profile Information
                    </CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={profile_form.handleSubmit(on_profile_submit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={profile?.email || ''}
                                disabled
                                className="bg-muted"
                            />
                            <p className="text-xs text-muted-foreground">
                                Email cannot be changed for security reasons
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                {...profile_form.register('name')}
                                disabled={update_profile.isPending}
                            />
                            {profile_form.formState.errors.name && (
                                <p className="text-sm text-red-500 dark:text-red-400">
                                    {profile_form.formState.errors.name.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                value={profile?.role || ''}
                                disabled
                                className="bg-muted capitalize"
                            />
                        </div>

                        <Button
                            type="submit"
                            isLoading={update_profile.isPending}
                            loadingText="Saving..."
                        >
                            Save Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Separator />

            {/* Password Change */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Lock className="h-5 w-5" />
                        Change Password
                    </CardTitle>
                    <CardDescription>
                        Update your password to keep your account secure
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={password_form.handleSubmit(on_password_submit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="current_password">Current Password</Label>
                            <Input
                                id="current_password"
                                type="password"
                                {...password_form.register('current_password')}
                                disabled={update_password.isPending}
                            />
                            {password_form.formState.errors.current_password && (
                                <p className="text-sm text-red-500 dark:text-red-400">
                                    {password_form.formState.errors.current_password.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="new_password">New Password</Label>
                            <Input
                                id="new_password"
                                type="password"
                                {...password_form.register('new_password')}
                                disabled={update_password.isPending}
                            />
                            {password_form.formState.errors.new_password && (
                                <p className="text-sm text-red-500 dark:text-red-400">
                                    {password_form.formState.errors.new_password.message}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Must be at least 8 characters with uppercase, lowercase, and number
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirm_password">Confirm New Password</Label>
                            <Input
                                id="confirm_password"
                                type="password"
                                {...password_form.register('confirm_password')}
                                disabled={update_password.isPending}
                            />
                            {password_form.formState.errors.confirm_password && (
                                <p className="text-sm text-red-500 dark:text-red-400">
                                    {password_form.formState.errors.confirm_password.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            isLoading={update_password.isPending}
                            loadingText="Changing Password..."
                        >
                            Change Password
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
