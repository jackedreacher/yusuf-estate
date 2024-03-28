import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "../firebase";
import {
  updateUserStart,
  updateUserFailure,
  updateUserSuccess,
  deleteUserStart,
  deleteUserSuccess,
  deleteUserFailure,
  signOutUserFailure,
  signOutUserStart,
  signOutUserSuccess,
} from "../redux/user/userSlice.js";
import { useDispatch } from "react-redux";
import { set } from "mongoose";

const Profile = () => {
  // Use the `useRef` hook to create a reference to the file input DOM element
  const fileRef = useRef(null);

  // Set up the state for the selected file
  const [file, setFile] = useState(undefined);

  // Get the `currentUser` from the Redux store using `useSelector`
  const { currentUser, loading, error } = useSelector((state) => state.user);

  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const dispatch = useDispatch();

  console.log(formData);
  // Use the `useEffect` hook to call the `handleFileUpload` function when the file state changes
  useEffect(() => {
    if (file) {
      handleFileUpload(file);
    }
  }, [file]);

  const handleFileUpload = (file) => {
    const storage = getStorage(app);

    const filename = new Date().getTime() + file.name;
    const storageRef = ref(storage, filename);

    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setFilePerc(Math.round(progress));
      },
      (error) => {
        setFileUploadError(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) =>
          setFormData({ ...formData, avatar: downloadURL })
        );
      }
    );
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(updateUserStart());
      const res = await fetch(`/api/user/update/${currentUser._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success === false) {
        dispatch(updateUserFailure(data.message));
        return;
      }

      dispatch(updateUserSuccess(data));
      setUpdateSuccess(true);

    } catch (error) {
      dispatch(updateUserFailure(error.message));
    }
  };

  const handleDeleteUser = async () => {
    try {
      dispatch(deleteUserStart());
      const res = await fetch(`/api/user/delete/${currentUser._id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success === false) {
        dispatch(deleteUserFailure(data.message));
        return;
      }
      dispatch(deleteUserSuccess(data));
    } catch (error) {
      dispatch(deleteUserFailure(error.message));
    }
  };

  const handleSignOut = async ()  => {
    try {
      dispatch(signOutUserStart());
      const  res = await fetch(`/api/auth/signout`);
      const data = await res.json();
      if (data.success === false) {
        dispatch(signOutUserFailure(data.message));
        return;
      }
      dispatch(signOutUserSuccess(data));
      
    } catch (error) {
      dispatch(signOutUserFailure(error.message));
    }
  };

  // The `Profile` component's JSX return
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Use the `fileRef` to create a file input DOM element and hide it using the `hidden` attribute */}
        <input
          onChange={(e) => setFile(e.target.files[0])}
          type="file"
          ref={fileRef}
          hidden
          accepts="image/*"
        />
        {/* Display the user's profile image and attach the `onClick` handler that programmatically triggers the `fileRef` click to open the file input dialog */}
        <img
          onClick={() => fileRef.current.click()}
          src={formData.avatar || currentUser.avatar}
          alt="avatar"
          className="rounded-full h-24 w-24 object-cover mx-auto cursor-pointer self-center mt-2"
        />

        <p className="text-sm self-center">
          {fileUploadError ? (
            <span className="text-red-700">
              Error Image Upload (image must be less than 2 mb)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className="text-green-700">Image succesfully uploaded!</span>
          ) : (
            ""
          )}
        </p>

        {/* Input elements for username, email, and password */}
        <input
          type="text"
          placeholder="username"
          id=" username"
          defaultValue={currentUser.username}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />
        <input
          type="text"
          placeholder="email"
          id=" email"
          defaultValue={currentUser.email}
          onChange={handleChange}
          className="border p-3 rounded-lg"
        />
        <input
          type="password"
          placeholder="password"
          onChange={handleChange}
          id=" password"
          defaultValue={currentUser.password}
          className="border p-3 rounded-lg"
        />
        {/* Submit button */}
        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg uppercase text-center hover:opacity-95"
        >
          {loading ? "Loading..." : "Update Profile"}
        </button>
      </form>
      <p className="text-red-700 mt-5">{error ? error : ""}</p>
      <p className="text-green-700 mt-2">
        {updateSuccess ? "Profile updated successfuly!" : ""}
      </p>

      {/* Delete and Sign out links */}
      <div className="flex justify-between mt-5 ">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer"
        >
          Delete account
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">Sign out</span>
      </div>
    </div>
  );
};

export default Profile;
