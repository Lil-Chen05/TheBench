"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { X, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface FormErrors {
  currentPassword?: string;
  newPassword?: string;
  confirmPassword?: string;
}

interface ShowPasswords {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const [formData, setFormData] = useState<FormData>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [showPasswords, setShowPasswords] = useState<ShowPasswords>({
    current: false,
    new: false,
    confirm: false
  });
  
  const [errors, setErrors] = useState<FormErrors>({});
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { showToast } = useToast();
  const supabase = createClient();

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    
    // Current password validation
    if (!formData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    // New password validation
    if (!formData.newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const togglePasswordVisibility = (field: keyof ShowPasswords) => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsUpdating(true);

    try {
      // Update password using Supabase
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword
      });

      if (error) {
        throw error;
      }

      // Success
      showToast("Password updated successfully!", "success");

      // Reset form and close modal
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setErrors({});
      onClose();

    } catch (error: unknown) {
      console.error('Error updating password:', error);
      
      let errorMessage = 'Failed to update password. Please try again.';
      
      // Handle specific Supabase auth errors
      if (error instanceof Error) {
        if (error.message?.includes('password')) {
          errorMessage = 'Password does not meet requirements.';
        } else if (error.message?.includes('session')) {
          errorMessage = 'Session expired. Please log in again.';
        }
      }
      
      showToast(errorMessage, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (isUpdating) return; // Prevent closing during update
    
    // Reset form data
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setErrors({});
    setShowPasswords({
      current: false,
      new: false,
      confirm: false
    });
    
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isUpdating) {
      handleClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && !isUpdating) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="change-password-title"
    >
      <Card className="w-full max-w-md mx-4 bg-gray-900 border border-gray-800 shadow-2xl">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-400/10 rounded-lg">
                <Lock className="w-5 h-5 text-yellow-400" />
              </div>
              <CardTitle 
                id="change-password-title"
                className="text-xl font-semibold text-yellow-400"
              >
                Change Password
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              disabled={isUpdating}
              className="text-gray-400 hover:text-white hover:bg-gray-800"
              aria-label="Close modal"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Current Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Current Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.current ? 'text' : 'password'}
                  value={formData.currentPassword}
                  onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                  placeholder="Enter your current password"
                  className={cn(
                    "bg-gray-800 border-gray-700 text-white placeholder-gray-400",
                    "focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400",
                    errors.currentPassword && "border-red-500 ring-1 ring-red-500"
                  )}
                  disabled={isUpdating}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('current')}
                  disabled={isUpdating}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 disabled:opacity-50"
                  aria-label={showPasswords.current ? 'Hide password' : 'Show password'}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="text-red-400 text-xs">{errors.currentPassword}</p>
              )}
            </div>

            {/* New Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                New Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.new ? 'text' : 'password'}
                  value={formData.newPassword}
                  onChange={(e) => handleInputChange('newPassword', e.target.value)}
                  placeholder="Enter your new password"
                  className={cn(
                    "bg-gray-800 border-gray-700 text-white placeholder-gray-400",
                    "focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400",
                    errors.newPassword && "border-red-500 ring-1 ring-red-500"
                  )}
                  disabled={isUpdating}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('new')}
                  disabled={isUpdating}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 disabled:opacity-50"
                  aria-label={showPasswords.new ? 'Hide password' : 'Show password'}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-400 text-xs">{errors.newPassword}</p>
              )}
            </div>

            {/* Confirm New Password Field */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-300">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showPasswords.confirm ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  placeholder="Confirm your new password"
                  className={cn(
                    "bg-gray-800 border-gray-700 text-white placeholder-gray-400",
                    "focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400",
                    errors.confirmPassword && "border-red-500 ring-1 ring-red-500"
                  )}
                  disabled={isUpdating}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirm')}
                  disabled={isUpdating}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 disabled:opacity-50"
                  aria-label={showPasswords.confirm ? 'Hide password' : 'Show password'}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-400 text-xs">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Password Requirements */}
            <div className="p-3 bg-gray-800 rounded-lg border border-gray-700">
              <p className="text-gray-300 text-xs font-medium mb-2">Password Requirements:</p>
              <ul className="text-gray-400 text-xs space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Contains at least one uppercase letter</li>
                <li>• Contains at least one lowercase letter</li>
                <li>• Contains at least one number</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                type="submit"
                disabled={isUpdating}
                className={cn(
                  "flex-1 bg-yellow-400 text-black font-semibold hover:bg-yellow-300",
                  "transition-all duration-200 hover:scale-[1.02] shadow-lg shadow-yellow-400/20",
                  "disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                )}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Password"
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isUpdating}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white hover:border-gray-500"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 