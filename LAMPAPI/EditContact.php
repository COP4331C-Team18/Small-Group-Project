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
    $nickname = $inputData['nickname'] ?? $inputData['Nickname'] ?? null;
    $phone = $inputData['phone'];
    $email = $inputData['email'];
    
    // Email validation
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { 
        returnWithError("Invalid email format"); 
        return; 
    }

    // Phone validation
    $digits = preg_replace('/\D+/', '', $phone);
    if (strlen($digits) !== 10) {
        returnWithError("Invalid phone number");
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
        // Prevent duplicates: no two contacts for the same user can share BOTH the same Email and Phone.
        // Normalize email case; for Gmail, dots in the local-part are ignored (first.last@gmail.com == firstlast@gmail.com).
        // Compare phone digits to ignore formatting differences.
        $emailNorm = normalizeEmailForDuplicate($email);
        $phoneNorm = preg_replace('/\D+/', '', (string)$phone);

        if ($emailNorm !== "" && $phoneNorm !== "")
        {
            // Fetch contacts for this user and compare in PHP so Gmail dot-insensitivity is enforced.
            $dup = $conn->prepare("SELECT ID, Email, Phone FROM Contacts WHERE UserID = ? AND ID <> ?");
            if ($dup)
            {
                $dup->bind_param("ii", $userId, $contactId);
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

        // updates the table
        $nicknameSupported = null;
        if ($nickname !== null)
        {
            $stmt = $conn->prepare("
                UPDATE Contacts 
                SET Firstname = ?, Lastname = ?, Nickname = ?, Phone = ?, Email = ? 
                WHERE ID = ? AND UserId = ?
            ");

            // Backward compatibility: production may not have the Nickname column yet.
            if ($stmt)
            {
                $nicknameSupported = true;
                $stmt->bind_param("sssssii", $firstName, $lastName, $nickname, $phone, $email, $contactId, $userId);
            }
            else
            {
                $nicknameSupported = false;
                $stmt = $conn->prepare("
                    UPDATE Contacts 
                    SET Firstname = ?, Lastname = ?, Phone = ?, Email = ? 
                    WHERE ID = ? AND UserId = ?
                ");
                if (!$stmt)
                {
                    returnWithError($conn->error);
                    $conn->close();
                    return;
                }
                $stmt->bind_param("ssssii", $firstName, $lastName, $phone, $email, $contactId, $userId);
            }
        }
        else
        {
            $stmt = $conn->prepare("
                UPDATE Contacts 
                SET Firstname = ?, Lastname = ?, Phone = ?, Email = ? 
                WHERE ID = ? AND UserId = ?
            ");
            if (!$stmt)
            {
                returnWithError($conn->error);
                $conn->close();
                return;
            }
            $stmt->bind_param("ssssii", $firstName, $lastName, $phone, $email, $contactId, $userId);
        }
        if($stmt->execute()) {
            returnWithInfo("Contact updated successfully", $nicknameSupported);
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
    function returnWithInfo($msg, $nicknameSupported = null)
    {
        $nsJson = 'null';
        if ($nicknameSupported === true) $nsJson = 'true';
        if ($nicknameSupported === false) $nsJson = 'false';
        $retValue = '{"message":"' . $msg . '", "nicknameSupported":' . $nsJson . ', "error":""}';
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