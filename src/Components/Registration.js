import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { createUserInFirebase } from "../FirebaseOperations";
import { useNavigate } from "react-router-dom";
import { User } from "../models/User";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();

const Registration = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [country, setCountry] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageUrl, setProfileImageUrl] = useState("");

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImageUrl(reader.result);
    };
    if (file) reader.readAsDataURL(file);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        const formattedBirthdate = formatDate(birthdate);

        const newUser = new User(
          user.uid,
          username,
          password,
          formattedBirthdate,
          country,
          email
        );

        if (profileImage) {
          const storageRef = ref(storage, `userProfiles/${user.uid}`);
          uploadBytes(storageRef, profileImage).then(() => {
            getDownloadURL(storageRef).then((url) => {
              newUser.imageUrl = url;
              createUserInFirebase(newUser)
                .then((generatedUserId) => {
                  setUserId(generatedUserId);
                  localStorage.setItem("userId", generatedUserId);
                  navigate("/Login");
                })
                .catch((error) => {
                  setError("Error saving user data. Please try again.");
                });
            });
          });
        } else {
          createUserInFirebase(newUser)
            .then((generatedUserId) => {
              setUserId(generatedUserId);
              localStorage.setItem("userId", generatedUserId);
              navigate("/Login");
            })
            .catch((error) => {
              setError("Error saving user data. Please try again.");
            });
        }
      })
      .catch((error) => {
        setError(
          "Error creating account. Please check your details and try again."
        );
      });
  };

  const handleLoginRedirect = () => {
    navigate("/Login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center rounded-3xl bg-[#fcf8f5] py-8 px-4">
      <div className="flex max-w-7xl w-full rounded-3xl bg-white overflow-hidden shadow-lg order-2 md:order-2">
        {/* Left Section - Registration Form */}
        <div className="w-full md:w-1/2 p-8">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-6">
            Create Account
          </h2>

          {/* Image Preview */}
          {profileImageUrl && (
            <div className="mb-4 flex justify-center">
              <img
                src={profileImageUrl}
                alt="Profile Preview"
                className="w-32 h-32 rounded-full object-cover"
              />
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xl text-gray-700 font-medium mb-1">
                Full Name
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 text-xl border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Enter your full name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-xl font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 text-xl py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-xl font-medium mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="w-full px-4 py-2 border text-xl border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center text-blue-500"
                >
                  <img
                    src={showPassword ? "/visible.svg" : "/hidden.svg"}
                    alt={showPassword ? "Hide" : "Show"}
                    className="w-7 h-7"
                  />
                </button>
              </div>
            </div>

            {/* Birthdate Input */}
            <div>
              <label className="block text-gray-700 text-xl font-medium mb-1">
                Birthdate
              </label>
              <input
                type="date"
                className="w-full px-4 py-2 text-xl border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
              />
            </div>

            {/* Country Input */}
            <div>
              <label className="block text-gray-700 text-xl font-medium mb-1">
                Country
              </label>
              <input
                type="text"
                className="w-full px-4 py-2 text-xl border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                placeholder="Enter your country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-gray-700 text-xl font-medium mb-1">
                Profile Image
              </label>
              <input
                type="file"
                onChange={handleImageUpload}
                className="w-full text-xl border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#669fd6] text-white text-xl font-bold py-2 rounded-lg mt-6 hover:bg-[#4b68ae] hover:scale-105 transition duration-300"
            >
              Register
            </button>
          </form>

          <p className="text-center text-xl text-gray-700 mt-4">
            Already have an account?{" "}
            <button
              type="button"
              onClick={handleLoginRedirect}
              className="text-blue-500 text-xl underline hover:text-blue-700"
            >
              Login here
            </button>
          </p>
        </div>

        {/* Right Section - Illustration */}
        <div className="hidden md:flex md:w-1/2 order-1 md:order-1 bg-[#f0f5fc] rounded-3xl flex-col items-center justify-center p-8 text-center">
          <h1 className="text-5xl font-bold text-gray-800">Welcome!!</h1>
          <p className="text-red-500 font-medium text-3xl mt-2 mb-4">
            Ready to conquer your day?
          </p>
          <img src="tt5.png" alt="Illustration" className="w-4/4" />
        </div>
      </div>
    </div>
  );
};

export default Registration;
