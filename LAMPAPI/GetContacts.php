<?php

  ini_set('display_errors', 1);
  error_reporting(E_ALL);

  $inputData = getRequestInfo();

  // Validate required fields
  if (!isset($inputData["userId"]) || !isset($inputData["startIdx"]) || !isset($inputData["count"])) {
      returnWithError("Missing required fields");
      return;
  }

  $userId = $inputData["userId"];
  $startIdx = $inputData["startIdx"];   //  zero-based index
  $count = $inputData["count"];    //  number of records to fetch

  
  // Connect to NEBULIST db
  $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "NEBULIST");

  if ($conn->connect_error) {
      returnWithError($conn->connect_error);
      return;
  }

  $statement = $conn->prepare("SELECT Firstname, Lastname, Email, Phone FROM Contacts WHERE UserID = ? LIMIT ? OFFSET ?");
  $statement->bind_param("iii", $userId, $count, $startIdx);
  $statement->execute();
  $result = $statement->get_result();
  
  $rows = [];

  while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
  }

  if (count($rows) == 0) {
    returnWithError("No Contacts Found");
  } else {
    returnWithInfo($rows);
  }

  $statement->close();
  $conn->close();


  // Helper functions
  function getRequestInfo() {
      return json_decode(file_get_contents('php://input'), true);
  }

  function sendResultInfoAsJson($obj) {
      header('Content-type: application/json');
      echo $obj;
  }

  function returnWithError($err) {
      $retValue = '{"results":[],"error":"' . $err . '"}';
      sendResultInfoAsJson($retValue);
  }

  function returnWithInfo($rows) {
    $retValue = '{"results":' . json_encode($rows) . ',"error":""}';
    sendResultInfoAsJson($retValue);
  }


?>