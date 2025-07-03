import React, { useState, useEffect } from "react";
import { message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { UserManager, WebStorageStateStore } from "oidc-client-ts";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import LobbyPage from "./LobbyPage";

class HybridStorage {
  getItem(key) {
    return sessionStorage.getItem(key) || localStorage.getItem(key);
  }

  setItem(key, value) {
    sessionStorage.setItem(key, value);
  }

  removeItem(key) {
    sessionStorage.removeItem(key);
    localStorage.removeItem(key);
  }
}

const oidcConfig = {
  authority: "https://ifsgcsc2-d02.demo.ifs.cloud/auth/realms/gcc2d021",
  client_id: "IFS_digisigns",
  redirect_uri: "https://ifsmain.netlify.app/callback",
  response_type: "code",
  scope: "openid microprofile-jwt",
  post_logout_redirect_uri: "https://ifsgcsc2-d02.demo.ifs.cloud/redirect",
  automaticSilentRenew: false,
  loadUserInfo: false,
  response_mode: "query",
  stateTimeInSeconds: 600, // 10 minutes
  userStore: new WebStorageStateStore({ store: new HybridStorage() }),
  metadataUrl: null,
  metadata: {
    issuer: "https://ifsgcsc2-d02.demo.ifs.cloud/auth/realms/gcc2d021",
    authorization_endpoint:
      "https://ifsgcsc2-d02.demo.ifs.cloud/auth/realms/gcc2d021/protocol/openid-connect/auth",
    token_endpoint:
      "https://ifsmain.netlify.app/.netlify/functions/token-exchange",
    userinfo_endpoint:
      "https://ifsgcsc2-d02.demo.ifs.cloud/auth/realms/gcc2d021/protocol/openid-connect/userinfo",
    end_session_endpoint:
      "https://ifsgcsc2-d02.demo.ifs.cloud/auth/realms/gcc2d021/protocol/openid-connect/logout",
    check_session_iframe:
      "https://ifsgcsc2-d02.demo.ifs.cloud/auth/realms/gcc2d021/protocol/openid-connect/login-status-iframe.html",
    revocation_endpoint:
      "https://ifsgcsc2-d02.demo.ifs.cloud/auth/realms/gcc2d021/protocol/openid-connect/revoke",
    introspection_endpoint:
      "https://ifsgcsc2-d02.demo.ifs.cloud/auth/realms/gcc2d021/protocol/openid-connect/token/introspect",
    jwks_uri:
      "https://ifsgcsc2-d02.demo.ifs.cloud/auth/realms/gcc2d021/protocol/openid-connect/certs",
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    code_challenge_methods_supported: ["S256"],
  },
};

const userManager = new UserManager(oidcConfig);

function App() {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState(null);
  const [lobbies, setLobbies] = useState([]);
  const [loadingLobbies, setLoadingLobbies] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleLogin = async () => {
    const user = await userManager.getUser();
    if (user && !user.expired) {
      setUser(user);
      setTokens({
        access_token: user.access_token,
        refresh_token: user.refresh_token,
      });
    } else {
      await userManager.signinRedirect();
    }
  };

  const handleLogout = () => userManager.signoutRedirect();

  const refreshTokens = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`/.netlify/functions/token-exchange`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: "IFS_digisigns",
          refresh_token: tokens.refresh_token,
          grant_type: "refresh_token",
        }),
      });

      const result = await res.json();
      if (result?.access_token) {
        setTokens({
          access_token: result.access_token,
          refresh_token: result.refresh_token || tokens.refresh_token,
        });
        // Update the user object
        const updatedUser = {
          ...user,
          access_token: result.access_token,
          refresh_token: result.refresh_token || user.refresh_token,
          expires_at:
            Math.floor(Date.now() / 1000) + (result.expires_in || 3600),
        };
        setUser(updatedUser);
        await userManager.storeUser(updatedUser);
        // message.success("Token refreshed!");
      } else {
        // message.error(result.message || "Token refresh failed.");
      }
    } catch (err) {
      console.error("Token refresh error:", err);
      // message.error("Error refreshing token.");
    } finally {
      setRefreshing(false);
    }
  };

  const fetchLobbies = async () => {
    if (!tokens?.access_token) return;

    setLoadingLobbies(true);
    try {
      const res = await fetch(`/.netlify/functions/get-lobbies`, {
        headers: {
          Authorization: `Bearer ${tokens.access_token}`,
          "Content-Type": "application/json",
        },
      });

      const result = await res.json();

      if (res.ok && result?.pages) {
        setLobbies(result.pages);
        // message.success("Lobbies fetched");
      } else {
        // message.error(result.message || "Failed to fetch lobbies.");
      }
    } catch (err) {
      console.error("Lobby fetch error:", err);
      // message.error("Network error while fetching lobbies.");
    } finally {
      setLoadingLobbies(false);
    }
  };

  useEffect(() => {
    userManager.getUser().then((u) => {
      if (u) {
        setUser(u);
        setTokens({
          access_token: u.access_token,
          refresh_token: u.refresh_token,
        });
      }
    });
  }, []);

  useEffect(() => {
    if (tokens?.access_token) fetchLobbies();
  }, [tokens]);

  useEffect(() => {
    if (!tokens?.refresh_token) return;

    const interval = setInterval(() => {
      refreshTokens();
    }, 15000);

    return () => clearInterval(interval);
  }, [tokens?.refresh_token]);

  const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout
              user={user}
              handleLogin={handleLogin}
              handleLogout={handleLogout}
              refreshing={refreshing}
              refreshTokens={refreshTokens}
              loadingLobbies={loadingLobbies}
              lobbies={lobbies}
              antIcon={antIcon}
              tokens={tokens}
            />
          }
        />
        <Route
          path="/callback"
          element={<Callback setUser={setUser} setTokens={setTokens} />}
        />
        <Route path={`/lobby/:accessToken/:pageId`} element={<LobbyPage />} />
      </Routes>
    </Router>
  );
}

function Layout({
  user,
  handleLogin,
  handleLogout,
  refreshing,
  refreshTokens,
  loadingLobbies,
  lobbies,
  antIcon,
  tokens,
}) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-[100vw] bg-gray-50 p-4">
      <div className="w-full mx-auto">
        {user ? (
          <>
            <div className="flex justify-between items-center mb-6 w-">
              <div className="space-x-3 flex items-center gap-2">
                <button
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Logout
                </button>
              </div>
              <div className="text-lg text-gray-700 font-medium">
                USERNAME : {user.profile?.preferred_username}
              </div>
              <button
                style={{
                  background: "white",
                  outline: "none",
                  border: "none",
                }}
                onClick={refreshTokens}
                disabled={refreshing}
              >
                {refreshing && <Spin indicator={antIcon} size="small" />}
                {!refreshing && "Refresh Token"}
              </button>
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Lobbies
              </h2>
              {loadingLobbies ? (
                <div className="flex flex-col gap-2 justify-center items-center py-20 w-[100vw] h-[100vh] bg-white">
                  <Spin indicator={antIcon} />
                  <p className="text-[18px] font-[500] text-black">
                    Loading lobbies...
                  </p>
                </div>
              ) : lobbies.length === 0 ? (
                <div className="text-gray-500">No lobbies found.</div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lobbies.map((lobby, index) => (
                    <div
                      key={index}
                      className="p-4 bg-white shadow rounded cursor-pointer"
                      onClick={() => {
                        navigate(
                          `/lobby/${tokens?.access_token}/${lobby.pageId}`
                        );
                      }}
                    >
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {lobby.pageTitle}
                      </h3>
                      <p className="text-xs text-gray-500">
                        Page ID: {lobby.pageId}
                      </p>
                      <p className="text-xs text-gray-400">
                        Keywords: {lobby.keywords || "N/A"}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">IFS Login</h1>
            <button
              onClick={handleLogin}
              className="bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
            >
              Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Callback({ setUser, setTokens }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // First try the standard OIDC callback
        try {
          const user = await userManager.signinRedirectCallback();
          if (user) {
            setUser(user);
            setTokens({
              access_token: user.access_token,
              refresh_token: user.refresh_token,
            });
            // message.success("Login successful!");
            navigate("/");
            return;
          }
        } catch (oidcError) {
          console.warn(
            "Standard OIDC callback failed, falling back to manual",
            oidcError
          );
        }

        // Manual fallback
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get("code");
        const state = urlParams.get("state");

        if (!code) {
          throw new Error("No authorization code found in callback URL");
        }

        // Try to recover the PKCE verifier from storage
        const storageKey = `oidc.code_verifier`;
        let codeVerifier = sessionStorage.getItem(storageKey);

        // If not found in sessionStorage, check localStorage as fallback
        if (!codeVerifier) {
          codeVerifier = localStorage.getItem(storageKey);
        }

        if (!codeVerifier) {
          throw new Error(
            "PKCE code verifier not found. The login session may have expired. Please try logging in again."
          );
        }

        // Exchange code for tokens using Netlify function
        const tokenResponse = await fetch(
          "/.netlify/functions/token-exchange",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              grant_type: "authorization_code",
              client_id: "IFS_digisigns",
              code: code,
              redirect_uri: "https://ifsmain.netlify.app/callback",
              code_verifier: codeVerifier,
            }),
          }
        );

        const tokenText = await tokenResponse.text();
        // console.log("Token response status:", tokenResponse.status);
        // console.log("Token response:", tokenText);

        if (!tokenResponse.ok) {
          throw new Error(`Token exchange failed: ${tokenText}`);
        }

        const tokenData = JSON.parse(tokenText);

        // Decode the ID token to get user profile
        const idTokenParts = tokenData.id_token.split(".");
        const profile = JSON.parse(atob(idTokenParts[1]));

        const user = {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          id_token: tokenData.id_token,
          token_type: tokenData.token_type,
          profile: {
            preferred_username: profile.preferred_username || profile.sub,
            sub: profile.sub,
          },
          expires_at:
            Math.floor(Date.now() / 1000) + (tokenData.expires_in || 3600),
        };

        setUser(user);
        setTokens({
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
        });

        // Store in session for the OIDC library
        await userManager.storeUser(user);

        // message.success("Login successful!");
        navigate("/");
      } catch (error) {
        console.error("Login failed:", error);
        // message.error(`Login failed: ${error.message}`);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [navigate, setUser, setTokens]);

  return (
    <div className="flex w-[100vw] items-center justify-center min-h-screen bg-white flex-col">
      {loading ? (
        <>
          <Spin size="large" />
          <p className="mt-4 text-lg font-medium text-gray-700">
            Logging in...
          </p>
        </>
      ) : (
        <h2 className="text-lg">Redirecting...</h2>
      )}
    </div>
  );
}

export default App;
