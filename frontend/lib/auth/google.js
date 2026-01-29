import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../firebase";

/**
 * Sign in with Google using Firebase Auth popup.
 * 
 * After successful authentication:
 * 1. Retrieves Firebase ID token
 * 2. Token is automatically used by Firebase Auth state listeners
 * 3. Backend endpoints verify token via Authorization header
 * 
 * @returns {Promise<{success: boolean, error?: string, errorCode?: string}>}
 * 
 * Error Codes:
 * - auth/popup-closed-by-user: User closed the popup without completing sign-in
 * - auth/popup-blocked: Browser blocked the popup window
 * - auth/cancelled-popup-request: Multiple popups triggered, newer one cancelled older
 * - auth/network-request-failed: Network connectivity issues
 * - auth/internal-error: Unexpected Firebase error
 */
export async function signInWithGoogle() {
  try {
    // Open Google sign-in popup
    const userCredential = await signInWithPopup(auth, googleProvider);
    const user = userCredential.user;

    // Firebase automatically manages auth state
    // The ID token is accessible via user.getIdToken() when needed
    // Backend endpoints will extract and verify it from Authorization header
    
    return {
      success: true,
    };
  } catch (error) {
    const errorCode = error.code || "unknown";

    // Handle specific error cases
    switch (errorCode) {
      case "auth/popup-closed-by-user":
        return {
          success: false,
          error: "Sign-in was cancelled. Please try again.",
          errorCode,
        };
      
      case "auth/popup-blocked":
        return {
          success: false,
          error: "Pop-up was blocked by your browser. Please allow pop-ups and try again.",
          errorCode,
        };
      
      case "auth/cancelled-popup-request":
        // This typically happens when user clicks button multiple times
        return {
          success: false,
          error: "Sign-in cancelled due to multiple attempts.",
          errorCode,
        };
      
      case "auth/network-request-failed":
        return {
          success: false,
          error: "Network error. Please check your connection and try again.",
          errorCode,
        };
      
      case "auth/account-exists-with-different-credential":
        return {
          success: false,
          error: "An account already exists with this email using a different sign-in method.",
          errorCode,
        };

      case "auth/unauthorized-domain":
        return {
          success: false,
          error:
            "This domain isn’t authorized for Google sign-in. Add it in Firebase Console → Authentication → Settings → Authorized domains.",
          errorCode,
        };
      
      default:
        return {
          success: false,
          error: "Unable to sign in with Google. Please try again.",
          errorCode,
        };
    }
  }
}
