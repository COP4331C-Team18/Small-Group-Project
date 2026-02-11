<?php

    ini_set('display_errors', 1);
    error_reporting(E_ALL);

    $inData = getRequestInfo();

    // Validate required fields
    if (!isset($inData["Firstname"]) || !isset($inData["Lastname"]) || !isset($inData["Email"]) || !isset($inData["Phone"]) || !isset($inData["UserID"])) {
        returnWithError("Missing required fields");
        return;
    }

    $firstName = $inData['Firstname'];
    $lastName = $inData['Lastname'];
    $nickname = $inData['Nickname'] ?? $inData['nickname'] ?? "";
    $email = $inData['Email'];
    $phone = $inData['Phone'];
    $userId = $inData['UserID'];
    $nicknameSupported = true;

    // Connect to the database
    $conn = new mysqli("localhost","TheBeast", "WeLoveCOP4331", "NEBULIST");

    if ($conn->connect_error) 
    {
        returnWithError($conn->connect_error);
    } 
    else 
    {
        // Prevent duplicates: no two contacts for the same user can share BOTH the same Email and Phone.
        // Normalize email case; for Gmail, dots in the local-part are ignored (first.last@gmail.com == firstlast@gmail.com).
        // Compare phone digits to ignore formatting like (555) 010-1001 vs 5550101001.
        $emailNorm = normalizeEmailForDuplicate($email);
        $phoneNorm = preg_replace('/\D+/', '', (string)$phone);

        if ($emailNorm !== "" && $phoneNorm !== "")
        {
            // Fetch contacts for this user and compare in PHP so Gmail dot-insensitivity is enforced.
            $dup = $conn->prepare("SELECT ID, Email, Phone FROM Contacts WHERE UserID = ?");
            if ($dup)
            {
                $dup->bind_param("i", $userId);
                $dup->execute();
                $dupRes = $dup->get_result();
                if ($dupRes)
                {
                    while ($row = $dupRes->fetch_assoc())
                    {
                        $existingEmailNorm = normalizeEmailForDuplicate($row['Email'] ?? '');
                        $existingPhoneNorm = preg_replace('/\D+/', '', (string)($row['Phone'] ?? ''));
                        if ($existingEmailNorm !== "" && $existingPhoneNorm !== "" && $existingEmailNorm === $emailNorm && $existingPhoneNorm === $phoneNorm)
                        {
                            $dup->close();
                            $conn->close();
                            returnWithError("A contact with that email and phone already exists");
                            return;
                        }
                    }
                }
                $dup->close();
            }
        }

        //inserts into table Contacts
        $stmt = $conn->prepare("INSERT INTO Contacts (Firstname, Lastname, Nickname, Email, Phone, UserID) VALUES (?, ?, ?, ?, ?, ?)");
        if ($stmt)
        {
            $stmt->bind_param("sssssi", $firstName, $lastName, $nickname, $email, $phone, $userId);
        }
        else
        {
            // Backward compatibility: production may not have the Nickname column yet.
            $nicknameSupported = false;
            $stmt = $conn->prepare("INSERT INTO Contacts (Firstname, Lastname, Email, Phone, UserID) VALUES (?, ?, ?, ?, ?)");
            if (!$stmt)
            {
                returnWithError($conn->error);
                $conn->close();
                return;
            }
            $stmt->bind_param("ssssi", $firstName, $lastName, $email, $phone, $userId);
        }
        
        
        if ($stmt->execute()) 
        {
            returnWithInfo("Registered successfully", $conn->insert_id, $nicknameSupported);
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
    function returnWithInfo($msg, $id = 0, $nicknameSupported = true)
    {
        $retValue = '{"message":"' . $msg . '", "id":' . (int)$id . ', "nicknameSupported":' . ($nicknameSupported ? 'true' : 'false') . ', "error":""}';
        sendResultInfoAsJson($retValue);
    }

    function normalizeEmailForDuplicate($email)
    {
        $email = strtolower(trim((string)$email));
        if ($email === "") return "";

        $parts = explode('@', $email, 2);
        if (count($parts) !== 2) return $email;

        $local = $parts[0];
        $domain = $parts[1];

        if ($domain === 'googlemail.com') $domain = 'gmail.com';
        if ($domain === 'gmail.com')
        {
            $local = str_replace('.', '', $local);
        }

        return $local . '@' . $domain;
    }
?>
