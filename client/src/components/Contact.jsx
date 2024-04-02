import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export const Contact = ({ listing }) => {
  const [landlord, setLandlord] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fecthLandlord = async () => {
      try {
        const res = await fetch(`/api/user/${listing.userRef}`);
        const data = await res.json();
        if (data.success === false) {
          return;
        }
        setLandlord(data);
      } catch (error) {
        console.log(error);
      }
    };
    fecthLandlord();
  }, [listing.userRef]);

  const onChange = (e) => {
    setMessage(e.target.value);
  }

  return (
    <div>
      {landlord && (
        <div className="flex flex-col gap-2">
          <p>
            İlan sahibi <span className="font-semibold">{landlord.username}</span>{" "}
            'a{" "}
            <span className="font-semibold">{listing.name.toLowerCase()}</span>{" "}için
          </p>
          <textarea
            name="message"
            id="message"
            rows="2"
            value={message}
            onChange={onChange}
            placeholder="Mesajı buraya girin..."
            className="w-full border p-3 rounded-lg"
          ></textarea>

          <Link
            to={`mailto:${landlord.email}?subject=Regarding ${listing.name}&body=${message}`}
            className="bg-slate-700 text-white text-center p-3  rounded-lg hover:opacity-95"
          >
            Mesajı Gönder
          </Link>
        </div>
      )}
    </div>
  );
  
};
