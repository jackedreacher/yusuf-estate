const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.user),
      });

      const  data = await res.json();

      dispatch(signInSuccess(data));
      navigate("/");
