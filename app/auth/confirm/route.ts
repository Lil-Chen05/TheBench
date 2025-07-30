import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";
import { getAuthRedirectUrl } from "@/lib/utils/environment";
import { logger } from "@/lib/utils/logger";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/auth/login";

  logger.info("Email confirmation attempt", {
    hasToken: !!token_hash,
    type,
    next,
    userAgent: request.headers.get("user-agent"),
    referer: request.headers.get("referer"),
  });

  // Validate required parameters
  if (!token_hash || !type) {
    logger.error("Email confirmation failed: Missing required parameters", {
      hasToken: !!token_hash,
      hasType: !!type,
    });
    redirect(`/auth/error?error=Invalid confirmation link. Please try signing up again.`);
  }

  try {
    const supabase = await createClient();

    // Attempt to verify the OTP
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (error) {
      logger.authError(null, "email_confirmation", error);
      
      // Handle specific error cases
      if (error.message.includes("expired")) {
        redirect(`/auth/error?error=Your confirmation link has expired. Please sign up again.`);
      } else if (error.message.includes("invalid")) {
        redirect(`/auth/error?error=Invalid confirmation link. Please check your email and try again.`);
      } else {
        redirect(`/auth/error?error=Confirmation failed. Please try again or contact support.`);
      }
    }

    if (data?.user) {
      logger.authSuccess(data.user.id, "email_confirmation", {
        email: data.user.email,
        type,
      });

      // Determine the correct redirect URL - always redirect to login after confirmation
      const redirectUrl = getAuthRedirectUrl('/auth/login');
      
      logger.redirectAttempt(request.url, redirectUrl, true);
      
      // Redirect to the appropriate page
      redirect(redirectUrl);
    } else {
      logger.error("Email confirmation failed: No user data returned");
      redirect(`/auth/error?error=Confirmation completed but user data is missing. Please try logging in.`);
    }

  } catch (error) {
    logger.error("Email confirmation failed: Unexpected error", error);
    
    // Fallback redirect with user-friendly message
    redirect(`/auth/error?error=Something went wrong. Please try again or contact support.`);
  }
}
