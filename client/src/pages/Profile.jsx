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
import { Link } from "react-router-dom";

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

  const [showListingsError, setShowListingsError] = useState(false);
  const [userListings, setUserListings] = useState([]);

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

  const handleSignOut = async () => {
    try {
      dispatch(signOutUserStart());
      const res = await fetch(`/api/auth/signout`);
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

  const handleShowListings = async () => {
    try {
      setShowListingsError(false);
      const res = await fetch(`/api/user/listings/${currentUser._id}`);
      const data = await res.json();

      if (data.succes === false) {
        setShowListingsError(true);
        return;
      }
      console.log(data);
      setUserListings(data);
    } catch (error) {
      setShowListingsError(true);
    }
  };

  const handleListingDelete = async (listingId) => {
    try {
      const res = await fetch(`/api/listing/delete/${listingId}`,{
        method: "DELETE",
      });

      const data = await res.json();
      if (data.success === false) {
        console.log(error.message);
        return;
      }
      
      setUserListings((prev) => prev.filter((listing) => listing._id !== listingId));

    } catch (error) {
      console.log(error.message)
    }
  };

  // The `Profile` component's JSX return
  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profil</h1>
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
              Resim Yükleme Hatası (resim 2 mb'den küçük olmalıdır)
            </span>
          ) : filePerc > 0 && filePerc < 100 ? (
            <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
          ) : filePerc === 100 ? (
            <span className="text-green-700">Resim başarıyla yüklendi!</span>
          ) : (
            ""
          )}
        </p>

        {/* Input elements for username, email, and password */}
        <input
          type="text"
          placeholder="Kullanıcı Adı"
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
          placeholder="şifre"
          onChange={handleChange}
          id=" password"
          defaultValue={currentUser.password}
          className="border p-3 rounded-lg"
        />
        {/* Submit button */}
        <button
          disabled={loading}
          className="bg-slate-700 text-white p-3 rounded-lg  text-center hover:opacity-95"
        >
          {loading ? "Yükleniyor..." : "Profili Güncelle"}
        </button>
        <Link
          className="bg-green-700 text-white p-3  rounded-lg  text-center hover:opacity-95"
          to={"/create-listing"}
        >
          İlan oluştur
        </Link>
      </form>

      {/* Delete and Sign out links */}

      <div className="flex justify-between mt-5 ">
        <span
          onClick={handleDeleteUser}
          className="text-red-700 cursor-pointer"
        >
          Hesabı sil
        </span>
        <span onClick={handleSignOut} className="text-red-700 cursor-pointer">
          Çıkış yap
        </span>
      </div>
      <p className="text-red-700 mt-5">{error ? error : ""}</p>
      <p className="text-green-700 mt-2">
        {updateSuccess ? "Profil başarıyla güncellendi!" : ""}
      </p>

      <button onClick={handleShowListings} className="text-green-700 w-full">
       İlanlarınızı görüntüleyin
      </button>
      <p className="text-red-700 mt-5">
        {showListingsError ? "Error showing listings" : ""}
      </p>

      {userListings && userListings.length > 0 && (
        <div className="flex flex-col gap-4">
          <h1 className="text-center mt-7 text-2xl font-semibold">İlanlarınız</h1>
          {userListings.map((listing) => (
            <div key={listing._id}
            className='border rounded-lg p-3 flex justify-between items-center gap-4'
            >
              <Link to ={`/listing/${listing._id}`}>
                <img src={listing.imageUrls[0]}
                alt="listing cover"
                className="h-16 w-16 object-contain"  />                
              </Link>
              <Link
                className='text-slate-700 font-semibold  hover:underline truncate flex-1'
                to={`/listing/${listing._id}`}
              >
                <p>{listing.name}</p>
              </Link>

              <div className='flex flex-col item-center'>
                <button
                  onClick={() => handleListingDelete(listing._id)}
                  className='text-red-700 '
                >
                  Sil
                </button>
                <Link to={`/update-listing/${listing._id}`}>
                  <button className='text-green-700 '>Düzenle</button>
                </Link>
              </div>
          
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Profile;
