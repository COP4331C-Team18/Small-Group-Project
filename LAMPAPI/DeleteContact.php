<?php
    ini_set('display_errors', 1);
    error_reporting(E_ALL);

    $inData = getRequestInfo();

    // Payload variables
    $userId = $inData['userId'];
    $contactId = $inData['id'];

    // Connect to the database
    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "NEBULIST");

    if ($conn->connect_error) 
    {
        returnWithError($conn->connect_error);
    } 
    else 
    {
        // Deletes from Contacts table where both IDs match
        $stmt = $conn->prepare("DELETE FROM Contacts WHERE ID = ? AND UserID = ?");
        $stmt->bind_param("ii", $contactId, $userId);
        
        if ($stmt->execute()) 
        {
            if ($stmt->affected_rows > 0)
            {
                returnWithInfo("Contact removed successfully");
            }
            else
            {
                returnWithError("No record found or you do not have permission");
            }
        } 
        else 
        {
            returnWithError($stmt->error);
        }

        $stmt->close();
        $conn->close();
    }

    // --- Helpers ---

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

    function returnWithInfo($msg)
    {
        $retValue = '{"message":"' . $msg . '", "error":""}';
        sendResultInfoAsJson($retValue);
    }
?>