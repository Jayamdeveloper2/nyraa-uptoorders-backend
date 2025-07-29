import React, { useState } from "react";
import { Button, Form } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Registration attempted with:", { firstName, lastName, email, password });
    navigate("/login");
  };

  return (
    <div className="container my-5">
      <h1 className="text-center mb-4">Register</h1>
      <Form onSubmit={handleSubmit} className="mx-auto" style={{ maxWidth: "400px" }}>
        <Form.Group className="mb-3" controlId="formFirstName">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter first name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formLastName">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter last name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formConfirmPassword">
          <Form.Label>Confirm Password</Form.Label>
          <Form.Control
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </Form.Group>

        <Button
          variant="warning"
          type="submit"
          className="w-100"
          style={{ backgroundColor: "#c5a47e", borderColor: "#c5a47e" }}
        >
          Register
        </Button>
        <p className="text-center mt-3">
          Already have an account?{" "}
          <Link to="/login" className="login-link">
            Login
          </Link>
        </p>
      </Form>
      <style jsx>{`
        h1 {
          font-family: 'Open Sans', sans-serif;
          color: #222;
          font-weight: 700;
        }
        .form-label {
          font-family: 'Open Sans', sans-serif;
          color: #222;
          font-size: 0.9rem;
        }
        .form-control {
          border-radius: 4px;
          border: 1px solid #eee;
          font-family: 'Open Sans', sans-serif;
          font-size: 0.9rem;
        }
        .btn-warning:hover {
          background-color: #b58963;
          border-color: #b58963;
          transform: scale(1.05);
        }
        .login-link {
          color: #c5a47e;
          text-decoration: none;
          font-family: 'Open Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
        }
        .login-link:hover {
          color: #b58963;
          text-decoration: underline;
        }
        @media (max-width: 576px) {
          h1 {
            font-size: 1.5rem;
          }
          .form-label,
          .form-control,
          .login-link {
            font-size: 0.85rem;
          }
          .btn {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Register;