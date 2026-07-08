import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import AppNavbar from "../components/AppNavbar";
import Footer from "../components/Footer";
import LoadingScreen from "../components/LoadingScreen";

import { getProfileDashboard, deleteAccount } from "../api/UserService";
import { logoutUser } from "../api/authService";
import { supabase } from "../api/supabaseClient";
import { useAlert } from "../context/AlertContext";

import styles from "./ProfilePage.module.css";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();

  const [profile, setProfile] = useState(null);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  
  // Account Deletion States
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [enteredPassword, setEnteredPassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const data = await getProfileDashboard();

      // ✅ CHECK API RESPONSE
      if (data.statusCode !== 1) {
        throw new Error(data.statusMessage);
      }

      setProfile(data);

      // Check auth provider using Supabase Gotrue
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      const isGoogle = user?.app_metadata?.provider === "google" || 
                       user?.identities?.some(i => i.provider === "google");
      setIsGoogleUser(!!isGoogle);

    } catch (err) {
      console.error(err);

      await showAlert(
        err.message || "Failed to load profile",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date) {
    if (!date) return "Recently";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        month: "long",
        year: "numeric",
      }
    );
  }

  const handleDeleteConfirm = async (e) => {
    e.preventDefault();
    setDeleteError("");

    // 1. Check password for email users
    if (!isGoogleUser && !enteredPassword.trim()) {
      setDeleteError("Please enter your password to confirm.");
      return;
    }

    // 2. Force the user to type DELETE
    if (deleteConfirmText !== "DELETE") {
      setDeleteError("Please type DELETE in all caps to confirm.");
      return;
    }

    setDeleting(true);

    try {
      // 3. Re-authenticate email/password users
      if (!isGoogleUser) {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: profile.email,
          password: enteredPassword,
        });

        if (authError) {
          setDeleteError("Incorrect password. Please verify your credentials.");
          setDeleting(false);
          return;
        }
      }

      // 4. Trigger Backend Deletion (DB child data -> profiles row -> Supabase auth user)
      const res = await deleteAccount();

      if (res.statusCode === 1) {
        setShowDeleteConfirm(false);
        await showAlert("Your Gretora account and all associated video greetings have been permanently deleted.", "success");
        await logoutUser();
        navigate("/");
      } else {
        setDeleteError(res.statusMessage || "Deletion failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setDeleteError(err.message || "Deletion failed. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Loading profile..." />;
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgGlowOne}></div>
      <div className={styles.bgGlowTwo}></div>

      <AppNavbar />

      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.profileCard}>
          <div className={styles.avatar}>
            {profile?.name
              ?.charAt(0)
              ?.toUpperCase() || "S"}
          </div>

          <div className={styles.profileDetails}>
            <p className={styles.profileMini}>
              Gretora CREATOR
            </p>

            <h1>
              {profile?.name || "Gretora User"}
            </h1>

            <p className={styles.email}>
              {profile?.email}
            </p>

            <p className={styles.joined}>
              Member since{" "}
              {formatDate(
                profile?.createdAt
              )}
            </p>
          </div>

          <div className={styles.profileActions}>
            {!isGoogleUser && (
              <button 
                className={styles.changePasswordBtn}
                onClick={async () => {
                  try {
                    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
                      redirectTo: `${window.location.origin}/reset-password`
                    });
                    if (error) throw error;
                    await showAlert("Password reset link sent to your email!", "success");
                  } catch (err) {
                    await showAlert(err.message || "Failed to trigger password change", "error");
                  }
                }}
              >
                Change Password
              </button>
            )}
            <button 
              className={styles.logoutBtn}
              onClick={async () => {
                try {
                  await logoutUser();
                  navigate("/login");
                } catch (err) {
                  await showAlert("Failed to log out", "error");
                }
              }}
            >
              Log Out
            </button>
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span>🎁</span>

          <strong>
            {profile?.greetingsCount || 0}
          </strong>

          <p>Greetings Created</p>
        </div>

        <div className={styles.statCard}>
          <span>🎥</span>

          <strong>
            {profile?.videosCount || 0}
          </strong>

          <p>Videos Uploaded</p>
        </div>

        <div className={styles.statCard}>
          <span>✨</span>

          <strong>Premium</strong>

          <p>Creator Status</p>
        </div>
      </section>

      {/* RECENT */}
      <section className={styles.recentSection}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.sectionMini}>
              RECENT ACTIVITY
            </p>

            <h2>
              Recent Greetings
            </h2>
          </div>
        </div>

        {!profile?.recentGreetings ||
        profile.recentGreetings.length ===
          0 ? (
          <div className={styles.emptyCard}>
            No greetings created yet.
          </div>
        ) : (
          <div className={styles.recentGrid}>
            {profile.recentGreetings.map(
              (greeting, index) => (
                <div
                  key={index}
                  className={
                    styles.recentCard
                  }
                >
                  <div
                    className={
                      styles.recentTop
                    }
                  >
                    <div
                      className={
                        styles.occasionTag
                      }
                    >
                      {
                        greeting.occassion
                      }
                    </div>
                  </div>

                  <h3>
                    {greeting.title}
                  </h3>

                  <p>
                    Created{" "}
                    {new Date(
                      greeting.createdAt
                    ).toLocaleDateString(
                      "en-IN"
                    )}
                  </p>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* DANGER ZONE */}
      <section className={styles.dangerZoneSection}>
        <div className={styles.dangerCard}>
          <div className={styles.dangerHeader}>
            <span>⚠️</span>
            <div>
              <h3>Danger Zone</h3>
              <p>Permanently delete your account</p>
            </div>
          </div>
          <p className={styles.dangerDesc}>
            Deleting your account will permanently delete all your created greetings, physical QR cards, and uploaded videos. <strong>This action is completely irreversible.</strong>
          </p>
          <button 
            className={styles.deleteAccountBtn}
            onClick={() => {
              setShowDeleteConfirm(true);
              setDeleteConfirmText("");
              setEnteredPassword("");
              setDeleteError("");
            }}
          >
            Permanently Delete Account
          </button>
        </div>
      </section>

      {/* DELETION CONFIRMATION MODAL OVERLAY */}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay} onClick={() => !deleting && setShowDeleteConfirm(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button 
              className={styles.modalCloseBtn} 
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleting}
            >
              ✕
            </button>

            <div className={styles.modalWarningIcon}>🚨</div>
            <h2>Confirm Permanent Deletion</h2>
            <div className={styles.modalGoldDivider}></div>
            
            <p className={styles.modalWarningText}>
              This action will permanently delete your account, including all your created greeting cards and uploaded videos.
            </p>

            <form onSubmit={handleDeleteConfirm} className={styles.deleteForm}>
              {/* Step 1: Re-authenticate */}
              <div className={styles.reauthSection}>
                {isGoogleUser ? (
                  <div className={styles.googleVerifiedBadge}>
                    <span>✓</span> Authenticated via Google Account
                  </div>
                ) : (
                  <div className={styles.reauthField}>
                    <label>Verify Password *</label>
                    <input 
                      type="password"
                      placeholder="Enter your account password"
                      value={enteredPassword}
                      onChange={(e) => setEnteredPassword(e.target.value)}
                      className={styles.modalInput}
                      disabled={deleting}
                    />
                  </div>
                )}
              </div>

              {/* Step 2: DELETE text confirmation */}
              <div className={styles.confirmTextField}>
                <label>To confirm, type <strong>DELETE</strong> below *</label>
                <input 
                  type="text"
                  placeholder="DELETE"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className={styles.modalInput}
                  disabled={deleting}
                />
              </div>

              {deleteError && <div className={styles.modalErrorBox}>{deleteError}</div>}

              <div className={styles.modalActions}>
                <button 
                  type="button"
                  className={styles.modalCancelBtn}
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className={`${styles.modalConfirmBtn} ${styles.dangerBtn}`}
                  disabled={deleting}
                >
                  {deleting ? "Purging Account..." : "Permanently Delete Everything"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

