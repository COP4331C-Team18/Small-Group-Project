<?php

    ini_set('display_errors', 1);
    error_reporting(E_ALL);

    $inData = getRequestInfo();

    $firstName = $inData['Firstname'];
    $lastName = $inData['Lastname'];
    $username = $inData['Username'];
    $password = $inData['Password'];
    $email = $inData['Email'];

    // Email validation using PHP's built in filter
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { 
        returnWithError("Invalid email format"); 
        return; 
    }

    // Connect to the database
    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "NEBULIST");

    if ($conn->connect_error) 
    {
        returnWithError($conn->connect_error);
    } 
    else 
    {
        //inserts into table Users
        $stmt = $conn->prepare("INSERT INTO Users (Firstname, Lastname, Username, Password, Email) VALUES (?, ?, ?, ?, ?)");
        $stmt->bind_param("sssss", $firstName, $lastName, $username, $password, $email);
        
        
        if ($stmt->execute()) 
        {
            returnWithInfo("Registered successfully");
        } 
        else 
        {
            // username?/email?/phone? exists in Database
            returnWithError($stmt->error);
        }

        $stmt->close();
        $conn->close();
    }

    // Helpers from Login PHP

    function getRequestInfo()
    {
        return json_decode(file_get_contents('php://input'), true);
    }

    function sendResultInfoAsJson($obj)
    {
        header('Content-type: application/json');
        echo $obj;
    }

    function returnWithError($err)
    {
        $retValue = '{"error":"' . $err . '"}';
        sendResultInfoAsJson($retValue);
    }

    //Edited for sending msg
    function returnWithInfo($msg)
    {
        $retValue = '{"message":"' . $msg . '", "error":""}';
        sendResultInfoAsJson($retValue);
    }
?>