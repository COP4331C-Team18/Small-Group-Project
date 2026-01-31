<?php

  ini_set('display_errors', 1);
  error_reporting(E_ALL);

  $inputData = getRequestInfo();

  // Validate required fields
  if (!isset($inputData["userId"]) || !isset($inputData["search"])) {
      returnWithError("Missing required fields");
      return;
  }

  $userId = $inputData["userId"];
  $search = trim($inputData["search"]);

  $searchResults = "";
  $resCount = 0;

  // Connect to NEBULIST db
  $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "NEBULIST");

  if ($conn->connect_error) {
      returnWithError($conn->connect_error);
      return;
  }

  // Break search into individual tokens for search
  $tokens = preg_split('/\s+/', $search);

  // Build dynamic WHERE clause for each token
  $whereParts = [];
  $params = [$userId];
  $types = "i";

  foreach ($tokens as $token) {
      $whereParts[] = "(Firstname LIKE ? OR Lastname LIKE ?)";
      $like = "%" . $token . "%";
      $params[] = $like;
      $params[] = $like;
      $types .= "ss";
  }

  $whereSql = implode(" AND ", $whereParts);

  // Ranking: prioritize matches on the first token
  $firstTokenLike = "%" . $tokens[0] . "%";
  $params[] = $firstTokenLike;
  $params[] = $firstTokenLike;
  $types .= "ss";

  // Final SQL query
  $sql = "
      SELECT ID, Firstname, Lastname, Phone, Email
      FROM Contacts
      WHERE UserID = ?
        AND $whereSql
      ORDER BY
        CASE
          WHEN Firstname LIKE ? THEN 0
          WHEN Lastname LIKE ? THEN 1
          ELSE 2
        END,
        Firstname ASC,
        Lastname ASC
  ";

  $statement = $conn->prepare($sql);
  $statement->bind_param($types, ...$params);
  $statement->execute();

  $result = $statement->get_result();

  // Building json array
  while ($row = $result->fetch_assoc()) {
      if ($resCount > 0) {
          $searchResults .= ",";
      }
      $resCount++;
      $searchResults .= json_encode($row);
  }

  if ($resCount == 0) {
      returnWithError("No Records Found");
  } else {
      returnWithInfo($searchResults);
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

  function returnWithInfo($searchResults) {
      $retValue = '{"results":[' . $searchResults . '],"error":""}';
      sendResultInfoAsJson($retValue);
  }

?>