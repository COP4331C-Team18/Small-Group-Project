<?php

    ini_set('display_errors', 1);
    error_reporting(E_ALL);

    $inputData = getRequestInfo();

    // input json validation
    if (!isset($inputData["id"]) ||
    !isset($inputData["firstname"]) || 
    !isset($inputData["lastname"]) || 
    !isset($inputData["username"]) || 
    !isset($inputData["password"]) ||
    !isset($inputData["email"]) || 
    !isset($inputData["phone"])) 
    {
        returnWithError("Missing required for editing fields");
        return;
    }

    $id = $inputData['id'];
    $firstName = $inputData['firstname'];
    $lastName = $inputData['lastname'];
    $userName = $inputData['username'];
    $password = $inputData['password'];
    $email = $inputData['email'];
    $phone = $inputData['phone'];
    

    // Connect to the database
    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "NEBULIST");

    if ($conn->connect_error) 
    {
        returnWithError($conn->connect_error);
    } 
    else 
    {
        // updates the table
        $stmt = $conn->prepare("
            UPDATE Users 
            SET Firstname = ?, Lastname = ?, Username = ?, Password = ?, Email = ?, Phone = ? 
            WHERE ID = ?
        ");
        $stmt->bind_param("ssssssi", $firstName, $lastName, $userName, $password, $email, $phone, $id);
        if($stmt->execute()) {
            returnWithInfo("User Information updated successfully");
        }
        else {
            returnWithError($stmt->error);
        }
        
        $stmt->close();
        $conn->close();
    }

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