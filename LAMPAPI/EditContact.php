<?php

    ini_set('display_errors', 1);
    error_reporting(E_ALL);

    $inputData = getRequestInfo();

    // input json validation
    if (!isset($inputData["userId"]) || 
    !isset($inputData["contactId"]) || 
    !isset($inputData["firstname"]) || 
    !isset($inputData["lastname"]) || 
    !isset($inputData["phone"]) || 
    !isset($inputData["email"])) 
    {
        returnWithError("Missing required for editing fields");
        return;
    }

    $userId = $inputData['userId'];
    $contactId = $inputData['contactId'];
    $firstName = $inputData['firstname'];
    $lastName = $inputData['lastname'];
    $phone = $inputData['phone'];
    $email = $inputData['email'];
    

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
            UPDATE Contacts 
            SET Firstname = ?, Lastname = ?, Phone = ?, Email = ? 
            WHERE ID = ? AND UserId = ?
        ");
        $stmt->bind_param("ssssii", $firstName, $lastName, $phone, $email, $contactId, $userId);
        if($stmt->execute()) {
            returnWithInfo("Contact updated successfully");
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