<?php
    ini_set('display_errors', 1);
    error_reporting(E_ALL);

    $inData = getRequestInfo();

    $userId = $inData['ID'];

    $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "NEBULIST");

    if ($conn->connect_error) 
    {
        returnWithError($conn->connect_error);
    } 
    else 
    {
        //delete based on the ID we can keep the ID in session
        $stmt = $conn->prepare("DELETE FROM Users WHERE ID = ?");
        $stmt->bind_param("i", $userId); 
        
        if ($stmt->execute()) 
        {
            // did it delete?
            if ($stmt->affected_rows > 0)
            {
                returnWithInfo("User deleted successfully");
            }
            else
            {
                returnWithError("No user found with that ID");
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