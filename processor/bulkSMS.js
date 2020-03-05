
/*

GET http://rest.mymobileapi.com/v1/Authentication
HOST: rest.mymobileapi.com/v1
Authorization: Basic ecd17239-b6c9-49bf-8a3f-1893907f40f5:57DmKTO9wi/1pwwlrmc8R3Rr//nZUtFr
Content-type: application/json


{
  "token": "YourTemporaryToken",
  "schema": "JWT",
  "expiresInMinutes": 1440
}


POST http://rest.smsportal.com/v1/bulkmessages
HOST: rest.smsportal.com/v1
Content-Type: application/json
Authorization: Bearer [Your Authorization Token]
Accept: application/json
{
  "Messages": [
    {
      "Content": "Hello John. Our new API is available. https://docs.smsportal.com/docs/rest to learn more",
      "Destination": "27830000000"
    }
  ]
}

*/


