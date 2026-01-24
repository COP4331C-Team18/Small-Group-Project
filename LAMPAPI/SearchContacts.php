<?php
  
  ini_set('display_errors', 1);
  error_reporting(E_ALL);
  
  
  $inputData = getRequestInfo();
  
  // json validation
  // minimal validation for required fields
  if (!isset($inputData["userId"]) || !isset($inputData["search"])) 
  {
    returnWithError("Missing required fields");
    return;
  }

  
  $searchResults = "";
  $resCount = 0;
  
  // connection to NEBULIST database
  $conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "NEBULIST");
  
  
  if($conn->connect_error) 
  {
    returnWithError($conn->connect_error);
  }
  else
  {
    // returned search results prioritize first name matches over last name matches
    $statement = $conn->prepare("
    SELECT ID, FirstName, LastName, Phone, Email
    FROM Contacts
    WHERE UserID = ?
      AND (FirstName LIKE ? OR LastName LIKE ?)
    ORDER BY
      CASE
        WHEN FirstName LIKE ? THEN 0
        WHEN LastName LIKE ? THEN 1
        ELSE 2
      END,
      FirstName ASC,
      LastName ASC
    ");

    $searchVal = "%" . $inputData["search"] . "%";
		$statement->bind_param("issss", $inputData["userId"], $searchVal, $searchVal, $searchVal, $searchVal);
    $statement->execute();
		
		$result = $statement->get_result();
   
    while($row = $result->fetch_assoc())
		{
		if( $resCount > 0 )
			{
				$searchResults .= ",";
			}
			$resCount++;
			$searchResults .= json_encode($row);
		}
		
		if( $resCount == 0 )
		{
			returnWithError( "No Records Found" );
		}
		else
		{
			returnWithInfo( $searchResults );
		}
		
		$statement->close();
		$conn->close();
	}
    
  
  
  
  
    
  function getRequestInfo() 
  {
		return json_decode(file_get_contents('php://input'), true);
  }
  
  function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
  // error return json
	function returnWithError( $err )
	{
		$retValue = '{"results":[],"error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
   // successful search return json
	function returnWithInfo( $searchResults )
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';
		sendResultInfoAsJson( $retValue );
	}
  

?>