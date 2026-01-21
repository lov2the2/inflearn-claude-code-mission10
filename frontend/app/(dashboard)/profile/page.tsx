'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useUserProfile } from '@/lib/hooks/queries/use-user-profile'
import { useUpdateProfile } from '@/lib/hooks/mutations/use-update-profile'
import { useUpdatePassword } from '@/lib/hooks/mutations/use-update-password'
import { profileEditSchema, passwordChangeSchema, ProfileEditFormData, PasswordChangeFormData } from '@/lib/schemas/profile'
import { Loader2, User, Lock } from 'lucide-react'

export default function ProfilePage() {
    const { data: profile, isLoading: profileLoading } = useUserProfile()
    const updateProfile = useUpdateProfile()
    const updatePassword = useUpdatePassword()

    const profileForm = useForm<ProfileEditFormData>({
        resolver: zodResolver(profileEditSchema),
        values: {
            name: profile?.name || ''
        }
    })

    const passwordForm = useForm<PasswordChangeFormData>({
        resolver: zodResolver(passwordChangeSchema),
        defaultValues: {
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        }
    })

    const onProfileSubmit = async (data: ProfileEditFormData) => {
        await updateProfile.mutateAsync(data.name)
    }

    const onPasswordSubmit = async (data: PasswordChangeFormData) => {
        await updatePassword.mutateAsync(data)
        passwordForm.reset()
    }

    if (profileLoading) {
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
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
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
                                {...profileForm.register('name')}
                                disabled={updateProfile.isPending}
                            />
                            {profileForm.formState.errors.name && (
                                <p className="text-sm text-red-500 dark:text-red-400">
                                    {profileForm.formState.errors.name.message}
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
                            isLoading={updateProfile.isPending}
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
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="currentPassword">Current Password</Label>
                            <Input
                                id="currentPassword"
                                type="password"
                                {...passwordForm.register('currentPassword')}
                                disabled={updatePassword.isPending}
                            />
                            {passwordForm.formState.errors.currentPassword && (
                                <p className="text-sm text-red-500 dark:text-red-400">
                                    {passwordForm.formState.errors.currentPassword.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                                id="newPassword"
                                type="password"
                                {...passwordForm.register('newPassword')}
                                disabled={updatePassword.isPending}
                            />
                            {passwordForm.formState.errors.newPassword && (
                                <p className="text-sm text-red-500 dark:text-red-400">
                                    {passwordForm.formState.errors.newPassword.message}
                                </p>
                            )}
                            <p className="text-xs text-muted-foreground">
                                Must be at least 8 characters with uppercase, lowercase, and number
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm New Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                {...passwordForm.register('confirmPassword')}
                                disabled={updatePassword.isPending}
                            />
                            {passwordForm.formState.errors.confirmPassword && (
                                <p className="text-sm text-red-500 dark:text-red-400">
                                    {passwordForm.formState.errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            isLoading={updatePassword.isPending}
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
