"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import axiosInstance from "../../lib/axios";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, loading } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [profileImage, setProfileImage] = useState(user?.profile_image || null);
  const [error, setError] = useState("");
  const [showImagesList, setShowImagesList] = useState(false);

  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [passwordRecommendations, setPasswordRecommendations] = useState([]);

  const profileImages = [
    "/profile_pictures/woman.png",
    "/profile_pictures/boy.png",
    "/profile_pictures/user1.png",
    "/profile_pictures/lion.png",
    "/profile_pictures/cat.png",
    "/profile_pictures/parrot.png",
  ];

  useEffect(() => {
    if (!user && !loading) {
      router.push("/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user && !loading && !profileImage) {
      const fetchProfileImage = async () => {
        try {
          const response = await axiosInstance.get("/api/user/profile-image/");
          setProfileImage(response.data.profile_image);
        } catch {}
      };
      fetchProfileImage();
    }
  }, [user, loading, profileImage]);

  const handleSaveName = async () => {
    try {
      const response = await axiosInstance.patch("/api/user/update/", {
        first_name: firstName,
        last_name: lastName,
      });
      setUser((prevUser) => ({
        ...prevUser,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
      }));
      setIsEditingName(false);
    } catch {
      setError("Failed to save user data.");
    }
  };

  const handleSavePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    try {
      await axiosInstance.put("/api/user/password/", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setIsEditingPassword(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
    } catch {
      setError("Failed to change password. Please check your old password.");
    }
  };

  const handleSelectImage = (imageUrl) => {
    setProfileImage(imageUrl);
    setShowImagesList(false);
  };

  const handleSaveImage = async () => {
    if (!profileImage) return;
    try {
      const response = await axiosInstance.patch("/api/user/update-profile-image/", {
        profile_image: profileImage,
      });
      setUser((prevUser) => ({
        ...prevUser,
        profile_image: response.data.profile_image,
      }));
      setError("");
    } catch {
      setError("Failed to save profile image.");
    }
  };

  const evaluatePasswordStrength = (password) => {
    let strength = "";
    const recommendations = [];

    if (password.length < 8) {
      recommendations.push("Password should be at least 8 characters long.");
    }
    if (!/[A-Z]/.test(password)) {
      recommendations.push("Add at least one uppercase letter.");
    }
    if (!/[a-z]/.test(password)) {
      recommendations.push("Add at least one lowercase letter.");
    }
    if (!/\d/.test(password)) {
      recommendations.push("Add at least one number.");
    }
    if (!/[!@#$%^&*]/.test(password)) {
      recommendations.push("Add at least one special character (e.g., !, @, #, $, etc.).");
    }

    if (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[!@#$%^&*]/.test(password)
    ) {
      strength = "Strong";
    } else if (recommendations.length <= 2) {
      strength = "Medium";
    } else {
      strength = "Weak";
    }

    return { strength, recommendations };
  };

  if (!user) return null;
  if (loading) return <p className="text-white p-8">Loading...</p>;

  return (
    <div className="bg-black min-h-screen p-6 text-white">
      <h1 className="text-xl font-semibold text-blue-500 mb-2">Welcome</h1>
      <h2 className="text-3xl font-bold text-white">{user.first_name} {user.last_name}</h2>

      <div className="mt-10 flex flex-col items-center gap-5">
        <div className="w-32 h-32 rounded-full bg-neutral-800 overflow-hidden flex items-center justify-center">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-sm text-neutral-400">No Photo</span>
          )}
        </div>

        <button
          onClick={() => setShowImagesList(!showImagesList)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Choose Profile Image
        </button>

        {showImagesList && (
          <div className="flex gap-4 overflow-x-auto">
            {profileImages.map((image, i) => (
              <img
                key={i}
                src={image}
                onClick={() => handleSelectImage(image)}
                className="w-14 h-14 rounded-full object-cover cursor-pointer hover:scale-110 transition-transform"
              />
            ))}
          </div>
        )}

        <button
          onClick={handleSaveImage}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Image
        </button>
      </div>

      <div className="mt-10 bg-neutral-900 p-6 rounded-lg">
        <div className="flex justify-between items-center">
          <p className="text-blue-500">Your name</p>
          {!isEditingName && (
            <button onClick={() => setIsEditingName(true)} className="text-neutral-400 hover:text-blue-500">
              ✏️
            </button>
          )}
        </div>

        {isEditingName ? (
          <div className="mt-4 flex flex-col gap-3">
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="bg-black border border-neutral-700 text-white px-4 py-2 rounded"
              placeholder="First name"
            />
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="bg-black border border-neutral-700 text-white px-4 py-2 rounded"
              placeholder="Last name"
            />
            <button
              onClick={handleSaveName}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        ) : (
          <p className="mt-2 text-lg font-semibold">{user.first_name} {user.last_name}</p>
        )}
      </div>

      <div className="mt-10 bg-neutral-900 p-6 rounded-lg">
        <div className="flex justify-between items-center">
          <p className="text-blue-500">Change Password</p>
          {!isEditingPassword && (
            <button onClick={() => setIsEditingPassword(true)} className="text-neutral-400 hover:text-blue-500">
              ✏️
            </button>
          )}
        </div>

        {isEditingPassword ? (
          <div className="mt-4 flex flex-col gap-3">
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="bg-black border border-neutral-700 text-white px-4 py-2 rounded"
              placeholder="Old password"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                const { strength, recommendations } = evaluatePasswordStrength(e.target.value);
                setPasswordStrength(strength);
                setPasswordRecommendations(recommendations);
              }}
              className="bg-black border border-neutral-700 text-white px-4 py-2 rounded"
              placeholder="New password"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-black border border-neutral-700 text-white px-4 py-2 rounded"
              placeholder="Confirm new password"
            />

            {/* Password Strength Indicator */}
            <div className="password-strength-indicator">
              <p className={`password-strength ${passwordStrength.toLowerCase()}`}>
                Password Strength: {passwordStrength || "N/A"}
              </p>
              <div className="strength-bar">
                <div
                  className={`strength-level ${passwordStrength.toLowerCase()}`}
                  style={{
                    width:
                      passwordStrength === "Strong"
                        ? "100%"
                        : passwordStrength === "Medium"
                        ? "66%"
                        : passwordStrength === "Weak"
                        ? "33%"
                        : "0%",
                  }}
                ></div>
              </div>
            </div>

            {/* Recommendations */}
            {passwordRecommendations.length > 0 && (
              <ul className="password-recommendations text-sm text-red-400 mt-2">
                {passwordRecommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleSavePassword}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditingPassword(false);
                  setOldPassword("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setPasswordStrength("");
                  setPasswordRecommendations([]);
                  setError("");
                }}
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-lg font-semibold">********</p>
        )}
      </div>

      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
  );
}
