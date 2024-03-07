import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Button,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";

function Login() {
  // State variables to hold form input values
  const [show, setShow] = useState(false); // State variable to toggle password visibility
  const [email, setEmail] = useState(""); // State variable for user's email
  const [password, setPassword] = useState(""); // State variable for user's password
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const history = useHistory();
  // Function to toggle password visibility
  const handleClick = () => setShow(!show);

  /********************************************************************************************* */
  //Handle Gooogle Sign in
  const handleGoogleSignin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        console.log("Token Response:", tokenResponse);
        // Fetch user data from Google OAuth
        const res = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${tokenResponse.access_token}`,
            },
          }
        );
        const config = {
          headers: {
            "Content-type": "application/json", // Set content type to JSON
          },
          withCredentials: true,
        };

        // Send the Google access token to the backend for further processing
        const data = await axios.post("http://localhost:5000/api/user/login", {
          googleAccessToken: tokenResponse.access_token,
          name: res.data.name,
          email: res.data.email,
          pic: res.data.picture,
        });

        // Store user information in local storage
        localStorage.setItem("userInfo", JSON.stringify(data.data));

        // Redirect the user to the "/chats" page
        history.push("/chats");

        // Handle successful registration response
        // console.log("User login successfully:", data.data);
      } catch (error) {
        // Handle errors
        console.error("Failed to register user:", error.message);
      }
    },
  });

  /********************************************************************************************* */
  // Function to handle form submission
  const submitHandler = async () => {
    // Set loading state to true to indicate that form submission is in progress
    setLoading(true);

    // Check if email or password is empty
    if (!email || !password) {
      // Display a warning toast message if email or password is empty
      toast({
        title: "Please Fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      // Set loading state to false to indicate that form submission is complete
      setLoading(false);

      // Exit the function since email or password is empty
      return;
    }

    try {
      // Define the configuration for the HTTP request
      const config = {
        headers: {
          "Content-type": "application/json", // Set content type to JSON
        },
      };

      // Send a POST request to the "/api/user/login" endpoint with user credentials
      const { data } = await axios.post(
        "/api/user/login", // API endpoint for user login
        { email, password }, // User credentials
        config // Request configuration
      );

      // Display a success toast message to notify the user of successful login
      toast({
        title: "Login Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      // Store user information in local storage
      localStorage.setItem("userInfo", JSON.stringify(data));

      // Set loading state to false to indicate that form submission is complete
      setLoading(false);

      // Redirect the user to the "/chats" page
      history.push("/chats");
    } catch (error) {
      // Display an error toast message if an error occurs during login
      toast({
        title: "Error Occurred!",
        description: error.response.data.message, // Error message from the server
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      // Set loading state to false to indicate that form submission is complete
      setLoading(false);
    }
  };

  /*************************************************************************************************** */

  return (
    <VStack spacing="5px">
      {/* Form control for user's email */}
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FormControl>

      {/* Form control for user's password */}
      <FormControl id="password" isRequired>
        <FormLabel>Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Enter Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      {/* Button for submitting the form */}
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        // isLoading={loading}
      >
        Login
      </Button>

      <span>Or</span>

      <Button
        backgroundColor="#797389"
        width="100%"
        style={{ marginTop: 3 }}
        onClick={handleGoogleSignin}
      >
        <i class="fab fa-google" style={{ marginRight: 5 }}></i> Login With
        Google
      </Button>

      <Button
        variant="solid"
        colorScheme="red"
        width="100%"
        onClick={() => {
          setEmail("guest@example.com");
          setPassword("123456");
        }}
      >
        Get Guest User Credentials
      </Button>
    </VStack>
  );
}

export default Login;
