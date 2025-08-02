import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation } from "@apollo/client";
import { LOGIN_WITH_QR_TOKEN } from "../features/auth/graphql/loginWithQrToken";
import { useAuth } from "../context/AuthContext";

const QRTokenLogin: React.FC = () => {
  const { qrToken } = useParams<{ qrToken: string }>();
  const [loginWithQrToken] = useMutation(LOGIN_WITH_QR_TOKEN);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!qrToken) return;
    if (isLoggedIn) {
      navigate("/", { replace: true });
      return;
    }
    (async () => {
      try {
        const { data } = await loginWithQrToken({ variables: { qrToken } });
        const authToken = data?.loginWithQrToken?.token;
        const authUser = data?.loginWithQrToken?.user;
        if (!authToken || !authUser) throw new Error("Invalid QR login");
        localStorage.setItem("id_token", authToken);
        localStorage.setItem("user", JSON.stringify(authUser));
        navigate("/", { replace: true });
      } catch (err) {
        // Show error message and redirect after a delay
        setError("Login failed. Please try scanning your QR code again.");
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 3000);
      }
    })();
  }, [qrToken, isLoggedIn, loginWithQrToken, navigate]);

  if (error) {
    return (
      <div style={{ textAlign: "center", marginTop: 80 }}>
        <h2>Login Failed</h2>
        <p>{error}</p>
        <p>Redirecting to home page...</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: 80 }}>
      <h2>Logging you in...</h2>
      <p>If you are not redirected, please try scanning your QR code again.</p>
    </div>
  );
};

export default QRTokenLogin;
