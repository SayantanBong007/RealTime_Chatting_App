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
      >
        Login
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
