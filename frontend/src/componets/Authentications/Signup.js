import {
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  VStack,
  Button,
} from "@chakra-ui/react";
import React, { useState } from "react";
import { useToast } from "@chakra-ui/react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { useGoogleLogin, TokenResponse } from "@react-oauth/google";

function Signup() {
  // State variables to hold form input values
  const [show, setShow] = useState(false); // State variable to toggle password visibility
  const [name, setName] = useState(""); // State variable for user's name
  const [email, setEmail] = useState(""); // State variable for user's email
  const [password, setPassword] = useState(""); // State variable for user's password
  const [confirmpassword, setConfirmpassword] = useState(""); // State variable for confirmed password
  const [pic, setPic] = useState(""); // State variable for user's profile picture
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const history = useHistory();

  // Function to toggle password visibility
  const handleClick = () => setShow(!show);

  /**************************************************************************************** */
  // Function to handle file upload and post details
  const postDetails = (pics) => {
    // Set loading state to true to indicate that the upload is in progress
    setLoading(true);

    // Check if the 'pics' parameter is undefined (no image selected)
    if (pics === undefined) {
      // Display a toast message to prompt the user to select an image
      toast({
        title: "Please Select an Image",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      // Exit the function since no image is selected
      return;
    }

    // Check if the selected image type is either JPEG or PNG
    if (pics.type === "image/jpeg" || pics.type === "image/png") {
      // Create a new FormData object to store the image data and metadata
      const data = new FormData();
      // Append the selected image file to the FormData object with the key 'file'
      data.append("file", pics);
      // Append the upload preset name to the FormData object
      data.append("upload_preset", "Chat-App");
      // Append the cloud name to the FormData object
      data.append("cloud_name", "drlee5m63");

      // Send a POST request to the Cloudinary API for uploading the image
      fetch("https://api.cloudinary.com/v1_1/drlee5m63/image/upload", {
        method: "post",
        body: data, // Pass the FormData object as the request body
      })
        // Parse the response as JSON
        .then((res) => res.json())
        // Handle the JSON response data
        .then((data) => {
          // Update the state variable 'pic' with the URL of the uploaded image
          setPic(data.url.toString());
          // Set loading state to false to indicate that the upload is complete
          setLoading(false);
        })
        // Handle any errors that occur during the upload process
        .catch((err) => {
          // Log the error to the console
          console.log(err);
          // Set loading state to false to indicate that the upload is complete
          setLoading(false);
        });
    } else {
      // If the selected image type is not JPEG or PNG, display a toast message
      toast({
        title: "Please Select an Image",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      // Set loading state to false to indicate that the upload is complete
      setLoading(false);
      // Exit the function
      return;
    }
  };

  /**************************************************************************************** */
  // Handle Gooogle Signup

  const handleGoogleSignUp = useGoogleLogin({
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
        console.log(res.data);

        const config = {
          headers: {
            "Content-type": "application/json", // Set content type to JSON
          },
          withCredentials: true,
        };

        // Send the Google access token to the backend for further processing
        const data = await axios.post(
          "http://localhost:5000/api/user",
          {
            googleAccessToken: tokenResponse.access_token,
            name: res.data.name,
            email: res.data.email,
            pic: res.data.picture,
          },
          config
        );
        console.log(data);

        // Store user information in local storage
        localStorage.setItem("userInfo", JSON.stringify(data.data));

        // Redirect the user to the "/chats" page
        history.push("/chats");

        // Handle successful registration response
        // console.log("User registered successfully:", registerResponse.data);
      } catch (error) {
        // Handle errors
        console.error("Failed to register user:", error.message);
      }
    },
  });
  /**************************************************************************************** */
  // Function to handle form submission
  const submitHandler = async () => {
    // Set loading state to true to indicate that form submission is in progress
    setLoading(true);

    // Check if any required fields (name, email, password, confirmpassword) are empty
    if (!name || !email || !password || !confirmpassword) {
      // Display a warning toast message to prompt the user to fill all fields
      toast({
        title: "Please fill all the Fields",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      // Set loading state to false to indicate that form submission is complete
      setLoading(false);
      // Exit the function since required fields are empty
      return;
    }

    // Check if the entered password matches the confirmed password
    if (password !== confirmpassword) {
      // Display a warning toast message to notify the user that passwords do not match
      toast({
        title: "Password Do Not Match",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      // Exit the function since passwords do not match
      return;
    }

    try {
      // Define the configuration for the HTTP request
      const config = {
        headers: {
          "Content-type": "application/json", // Set content type to JSON
        },
      };

      // Send a POST request to the "/api/user" endpoint with user data
      const { data } = await axios.post(
        "/api/user", // API endpoint
        {
          name, // User's name
          email, // User's email
          password, // User's password
          pic, // User's profile picture URL
        },
        config // Request configuration
      );

      // Display a success toast message to notify the user of successful registration
      toast({
        title: "Registration Successful",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });

      // Store user information in local storage
      localStorage.setItem("userInfo", JSON.stringify(data));

      // Redirect the user to the "/chats" page
      history.push("/chats");
    } catch (err) {
      // Display an error toast message if an error occurs during registration
      toast({
        title: "Error Occurred!",
        description: err.response.data.message, // Error message from the server
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
      // Set loading state to false to indicate that form submission is complete
      setLoading(false);
    }
  };

  /**************************************************************************************** */
  return (
    <VStack spacing="5px">
      {/* Form control for user's name */}
      <FormControl id="first-name" isRequired>
        <FormLabel>Name</FormLabel>
        <Input
          placeholder="Enter Your Name"
          onChange={(e) => setName(e.target.value)}
        />
      </FormControl>

      {/* Form control for user's email */}
      <FormControl id="email" isRequired>
        <FormLabel>Email</FormLabel>
        <Input
          placeholder="Enter Your Email"
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
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      {/* Form control for confirming password */}
      <FormControl id="confirm-password" isRequired>
        <FormLabel>Confirm Password</FormLabel>
        <InputGroup>
          <Input
            type={show ? "text" : "password"}
            placeholder="Confirm Password"
            onChange={(e) => setConfirmpassword(e.target.value)}
          />
          <InputRightElement width="4.5rem">
            <Button h="1.75rem" size="sm" onClick={handleClick}>
              {show ? "Hide" : "Show"}
            </Button>
          </InputRightElement>
        </InputGroup>
      </FormControl>

      {/* Form control for uploading profile picture */}
      <FormControl id="profile-pic" isRequired>
        <FormLabel>Upload your picture</FormLabel>
        <Input
          type="file"
          p={0.5}
          accept="image/*"
          onChange={(e) => postDetails(e.target.files[0])}
        />
      </FormControl>

      {/* Button for submitting the form */}
      <Button
        colorScheme="blue"
        width="100%"
        style={{ marginTop: 15 }}
        onClick={submitHandler}
        isLoading={loading}
      >
        Sign Up
      </Button>

      <span>Or</span>

      <Button
        backgroundColor="#797389"
        width="100%"
        style={{ marginTop: 3 }}
        onClick={handleGoogleSignUp}
      >
        <i class="fab fa-google" style={{ marginRight: 5 }}></i> Sign Up With
        Google
      </Button>
    </VStack>
  );
}

export default Signup;
