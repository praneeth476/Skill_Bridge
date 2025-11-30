import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const sharedBg = "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1350&q=80";

const bgImages = {
  student: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1350&q=80",
  admin: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1350&q=80",
  employer: sharedBg,
  placement_officer: sharedBg,
};

const icons = {
  student: "fas fa-user-graduate",
  admin: "fas fa-user-shield",
  employer: "fas fa-briefcase",
  placement_officer: "fas fa-user-tie",
};

const LoginPage = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!role) {
      alert("Please select a role.");
      return;
    }
    if (email === "" || password === "") {
      alert("Email and password required.");
      return;
    }

    if (role === "admin") {
      navigate("/adminportal");
    } else if (role === "student") {
      navigate("/student-dashboard");
    } else if (role === "employer") {
      navigate("/employer-dashboard");
    } else if (role === "placement_officer") {
      navigate("/placement-officer-dashboard");
    } else {
      alert("Invalid role selected.");
    }
  };

  const styles = {
    container: {
      display: "flex",
      height: "100vh",
      width: "100vw",
      fontFamily: "'Poppins', sans-serif",
      margin: 0,
      overflow: "hidden",
    },
    leftSide: {
      flex: 1,
      backgroundColor: "#18202a",
      color: "#ffc72c",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "3rem",
      gap: "2rem",
      // --- FIX: Added this line to allow scrolling when content overflows ---
      overflowY: "auto",
    },
    roleSelectTitle: {
      fontSize: "3rem",
      fontWeight: "700",
      letterSpacing: "1px",
      textAlign: "center",
    },
    roleCards: {
      display: "flex",
      gap: "2rem",
      flexWrap: "wrap",
      justifyContent: "center",
    },
    card: {
      width: 160,
      height: 220,
      borderRadius: 20,
      cursor: "pointer",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: "2rem",
      backgroundSize: "cover",
      backgroundPosition: "center",
      position: "relative",
      boxShadow: "0 0 10px transparent",
      transition: "box-shadow 0.3s ease",
      color: "#ffc72c",
      textShadow: "1px 1px 7px rgba(0,0,0,0.8)",
      fontWeight: "700",
      fontSize: "1.25rem",
    },
    cardActive: {
      boxShadow: "0 0 20px #ffc72c",
    },
    icon: {
      fontSize: 60,
      marginBottom: 14,
      textShadow: "2px 2px 8px rgba(0,0,0,0.9)",
    },
    rightSide: {
      flex: 2,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      padding: "3rem",
      position: "relative",
      color: "#222",
      transition: "background-image 0.6s ease",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    form: {
      width: "100%",
      maxWidth: 480,
      backgroundColor: "rgba(255, 255, 255, 0.95)",
      padding: "48px 40px",
      borderRadius: 18,
      boxShadow: "0 22px 48px rgba(0,0,0,0.2)",
      display: "flex",
      flexDirection: "column",
      gap: "1.8rem",
      textAlign: "center",
    },
    formTitle: {
      fontWeight: 700,
      fontSize: "2.6rem",
      color: "#0077ff",
      marginBottom: "1.3rem",
    },
    input: {
      padding: "16px 20px",
      borderRadius: 14,
      border: "2px solid #0077ff",
      fontSize: "1.25rem",
      outline: "none",
      color: "#222",
      textAlign: "center",
      caretColor: "#0077ff",
      boxShadow: "inset 0 0 8px #0077ff",
      transition: "border-color 0.3s ease",
    },
    loginBtn: {
      padding: "18px 0",
      borderRadius: 18,
      border: "none",
      backgroundColor: "#ffc72c",
      color: "#222",
      fontWeight: "700",
      fontSize: "1.5rem",
      cursor: "pointer",
      boxShadow: "0 8px 20px rgba(255, 199, 44, 0.6)",
      transition: "background-color 0.3s ease",
    },
    backBtn: {
      marginTop: "8px",
      background: "none",
      border: "none",
      color: "#777",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "1rem",
      textDecoration: "underline",
    },
    registerLink: {
      color: "#ffc72c",
      cursor: "pointer",
      fontWeight: "700",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.leftSide}>
        <h2 style={styles.roleSelectTitle}>Select Your Role</h2>
        <div style={styles.roleCards}>
          {["student", "admin", "employer", "placement_officer"].map((r) => {
            const isActive = role === r;
            return (
              <div
                key={r}
                style={{
                  ...styles.card,
                  ...(isActive ? styles.cardActive : {}),
                  backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${bgImages[r]})`,
                }}
                role="button"
                tabIndex={0}
                onClick={() => setRole(r)}
                onKeyDown={(e) => e.key === "Enter" && setRole(r)}
                aria-label={`Select ${r} role`}
              >
                <i className={icons[r]} style={styles.icon}></i>
                <span>{r.charAt(0).toUpperCase() + r.slice(1).replace("_", " ")}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div
        style={{
          ...styles.rightSide,
          backgroundImage: role ? `url(${bgImages[role]})` : "none",
          color: role === "admin" ? "#fff" : "#222",
        }}
      >
        {role ? (
          <form style={styles.form} onSubmit={handleSubmit} noValidate>
            <h2 style={styles.formTitle}>
              {role.charAt(0).toUpperCase() + role.slice(1).replace("_", " ")} Login
            </h2>
            <input
              style={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
              required
            />
            <input
              style={styles.input}
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button style={styles.loginBtn} type="submit">
              Login
            </button>
            <button style={styles.backBtn} type="button" onClick={() => setRole(null)}>
              ← Change Role
            </button>
            <p style={{ marginTop: "1.5rem", color: role === "admin" ? "#ffc72c" : "#222" }}>
              Don’t have an account?{" "}
              <span style={styles.registerLink} onClick={() => alert("Register flow")}>
                Register here
              </span>
            </p>
          </form>
        ) : (
          <h2
            style={{
              ...styles.formTitle,
              color: "#0094ff",
              fontWeight: 600,
              textAlign: "center",
              width: "100%",
            }}
          >
            Welcome! Please select your role to continue
          </h2>
        )}
      </div>
    </div>
  );
};

export default LoginPage;

