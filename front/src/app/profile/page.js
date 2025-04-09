"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./profile.module.css";
import axiosInstance from "../../lib/axios";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, loading } = useAuth(); // Access user and setUser from context
  const [isEditingName, setIsEditingName] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [profileImage, setProfileImage] = useState(null); // State for profile image
  const [showUploadBox, setShowUploadBox] = useState(false); // State to show/hide upload box
  const [selectedImage, setSelectedImage] = useState(null); // State for selected image
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user && !loading) {
      router.push('/login');
    }
  }, [user, loading, router]);
  useEffect(() => {
    if (user && !loading){
      const fetchProfileImage = async () => {
        try {
          const response = await axiosInstance.get("/api/user/profile-image/");
          setProfileImage(response.data.profile_image); // Set the profile image URL
        } catch (err) {
          console.error("Failed to fetch profile image:", err);
        }
      };

      fetchProfileImage();
    }
  }, []);

  const handleSaveName = async () => {
    try {
      const response = await axiosInstance.patch("/api/user/update/", {
        first_name: firstName,
        last_name: lastName,
      });

      // Update the user object in the frontend
      setUser((prevUser) => ({
        ...prevUser,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
      }));

      setIsEditingName(false); // Exit editing mode
    } catch (err) {
      console.error("Failed to save user data:", err);
      setError("Failed to save user data.");
    }
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedImage(file); // Set the selected image
  };

  const handleImageSave = async () => {
    if (!selectedImage) return;

    const formData = new FormData();
    formData.append("profile_image", selectedImage);

    try {
      const response = await axiosInstance.post("/api/user/upload-profile-image/", formData, { // CHANGE THE API CALL WHEN IT IS ADDED TO THE BACKEND
        
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setProfileImage(response.data.profile_image); // Update the profile image URL
      setSelectedImage(null); // Clear the selected image
      setShowUploadBox(false); // Close the upload box
    } catch (err) {
      console.error("Failed to upload profile image:", err);
      setError("Failed to upload profile image.");
    }
  };
  if (!user) return null;
  if (loading) return <p>Loading...</p>

  return (
    <div className={styles.profileContainer}>
      <header className={styles.header}>
        <h1>Profile</h1>
      </header>

      <div className={styles.profilePhotoSection}>
        <div className={styles.profilePhoto}>
          {profileImage ? (
            <img src={profileImage} alt="Profile" className={styles.profileImage} />
          ) : (
            <span
              className={styles.addPhotoText}
              onClick={() => setShowUploadBox(true)} // Show upload box on click
            >
              ADD PROFILE PHOTO
            </span>
          )}
        </div>

        {showUploadBox && (
          <div className={styles.uploadBox}>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className={styles.uploadInput}
            />
            <div className={styles.uploadActions}>
              <button onClick={handleImageSave} className={styles.saveButton} disabled={!selectedImage}>
                Save
              </button>
              <button onClick={() => setShowUploadBox(false)} className={styles.cancelButton}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={styles.profileInfoSection}>
        <div className={styles.infoRow}>
          <span className={styles.label}>Your name</span>
          {isEditingName ? (
            <div className={styles.editNameContainer}>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={styles.inputField}
                placeholder="First Name"
              />
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={styles.inputField}
                placeholder="Last Name"
              />
              <button onClick={handleSaveName} className={styles.saveButton}>
                Save
              </button>
            </div>
          ) : (
            <div className={styles.nameDisplay}>
              <span className={styles.nameText}>
                {user?.first_name} {user?.last_name}
              </span>
              <button
                onClick={() => setIsEditingName(true)}
                className={styles.editButton}
              >
                ✏️
              </button>
            </div>
          )}
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
