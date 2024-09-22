const express = require('express')
const supabase = require('../supabase')
const router = express.Router()

router.get('/getUserSession', async (req, res) => {
  const {
    data: {user},
  } = await supabase.auth.getUser()

  res.send(user)

  /* Example:

  either NULL, or:
  
  {
    "id": "68ea08f4-317d-48df-ac28-854ca805d27c",
    "aud": "authenticated",
    "role": "authenticated",
    "email": "hello@gmail.com",
    "email_confirmed_at": "2024-09-22T14:51:31.253913Z",
    "phone": "",
    "confirmed_at": "2024-09-22T14:51:31.253913Z",
    "last_sign_in_at": "2024-09-22T16:03:51.280322Z",
    "app_metadata": {
        "provider": "email",
        "providers": [
            "email"
        ]
    },
    "user_metadata": {},
    "identities": [
        {
            "identity_id": "f74f8cef-da11-4dcb-86c5-1173e5c2f8fc",
            "id": "68ea08f4-317d-48df-ac28-854ca805d27c",
            "user_id": "68ea08f4-317d-48df-ac28-854ca805d27c",
            "identity_data": {
                "email": "hello@gmail.com",
                "email_verified": false,
                "phone_verified": false,
                "sub": "68ea08f4-317d-48df-ac28-854ca805d27c"
            },
            "provider": "email",
            "last_sign_in_at": "2024-09-22T14:51:31.246659Z",
            "created_at": "2024-09-22T14:51:31.246729Z",
            "updated_at": "2024-09-22T14:51:31.246729Z",
            "email": "hello@gmail.com"
        }
    ],
    "created_at": "2024-09-22T14:51:31.235341Z",
    "updated_at": "2024-09-22T16:03:51.283929Z",
    "is_anonymous": false
}
  
  */
})

router.post('/login', async (req, res) => {
  let {data, error} = await supabase.auth.signInWithPassword({
    email: req.body['username'],
    password: req.body['password'],
  })

  if (error) {
    res.send(error)
  } else {
    // get frontend to save the response (user session) as cookie in local storage
    res.send(data)

    /*  Example 

{ 
    "user": { 
        "id": "68ea08f4-317d-48df-ac28-854ca805d27c", 
        "aud": "authenticated", 
        "role": "authenticated", 
        "email": "hello@gmail.com", 
        "email_confirmed_at": "2024-09-22T14:51:31.253913Z", 
        "phone": "", 
        "confirmed_at": "2024-09-22T14:51:31.253913Z", 
        "last_sign_in_at": "2024-09-22T14:51:56.898917241Z", 
        "app_metadata": { 
            "provider": "email", 
            "providers": [ 
                "email" 
            ] 
        }, 
        "user_metadata": {}, 
        "identities": [ 
            { 
                "identity_id": "f74f8cef-da11-4dcb-86c5-1173e5c2f8fc", 
                "id": "68ea08f4-317d-48df-ac28-854ca805d27c", 
                "user_id": "68ea08f4-317d-48df-ac28-854ca805d27c", 
                "identity_data": { 
                    "email": "hello@gmail.com", 
                    "email_verified": false, 
                    "phone_verified": false, 
                    "sub": "68ea08f4-317d-48df-ac28-854ca805d27c" 
                }, 
                "provider": "email", 
                "last_sign_in_at": "2024-09-22T14:51:31.246659Z", 
                "created_at": "2024-09-22T14:51:31.246729Z", 
                "updated_at": "2024-09-22T14:51:31.246729Z", 
                "email": "hello@gmail.com" 
            } 
        ], 
        "created_at": "2024-09-22T14:51:31.235341Z", 
        "updated_at": "2024-09-22T14:51:56.919503Z", 
        "is_anonymous": false 
    }, 
    "session": { 
        "access_token": "eyJhbGciOiJIUzI1NiIsImtpZCI6Ik5CZ0dReFNIdFhENjlsTEQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2ZoZHNtZ2Jjbmp6cWFrdWRpbWV0LnN1cGFiYXNlLmNvL2F1dGgvdjEiLCJzdWIiOiI2OGVhMDhmNC0zMTdkLTQ4ZGYtYWMyOC04NTRjYTgwNWQyN2MiLCJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzI3MDIwMzE2LCJpYXQiOjE3MjcwMTY3MTYsImVtYWlsIjoiaGVsbG9AZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6e30sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3MjcwMTY3MTZ9XSwic2Vzc2lvbl9pZCI6ImZjNzIzMTZkLTY4ZjUtNDliYy1iMWM3LTE4OWYxNDA2MTRiNiIsImlzX2Fub255bW91cyI6ZmFsc2V9.8TMyROck60FjQYGHOtMhxpg50sRQFemREJQb5AtsX30", 
        "token_type": "bearer", 
        "expires_in": 3600, 
        "expires_at": 1727020316, 
        "refresh_token": "htTXU4YjjK728xSh2Xv-iQ", 
        "user": { 
            "id": "68ea08f4-317d-48df-ac28-854ca805d27c", 
            "aud": "authenticated", 
            "role": "authenticated", 
            "email": "hello@gmail.com", 
            "email_confirmed_at": "2024-09-22T14:51:31.253913Z", 
            "phone": "", 
            "confirmed_at": "2024-09-22T14:51:31.253913Z", 
            "last_sign_in_at": "2024-09-22T14:51:56.898917241Z", 
            "app_metadata": { 
                "provider": "email", 
                "providers": [ 
                    "email" 
                ] 
            }, 
            "user_metadata": {}, 
            "identities": [ 
                { 
                    "identity_id": "f74f8cef-da11-4dcb-86c5-1173e5c2f8fc", 
                    "id": "68ea08f4-317d-48df-ac28-854ca805d27c", 
                    "user_id": "68ea08f4-317d-48df-ac28-854ca805d27c", 
                    "identity_data": { 
                        "email": "hello@gmail.com", 
                        "email_verified": false, 
                        "phone_verified": false, 
                        "sub": "68ea08f4-317d-48df-ac28-854ca805d27c" 
                    }, 
                    "provider": "email", 
                    "last_sign_in_at": "2024-09-22T14:51:31.246659Z", 
                    "created_at": "2024-09-22T14:51:31.246729Z", 
                    "updated_at": "2024-09-22T14:51:31.246729Z", 
                    "email": "hello@gmail.com" 
                } 
            ], 
            "created_at": "2024-09-22T14:51:31.235341Z", 
            "updated_at": "2024-09-22T14:51:56.919503Z", 
            "is_anonymous": false 
        } 
    } 
}

*/
  }
})

router.post('/signup', async (req, res) => {
  let {data, error} = await supabase.auth.signUp({
    email: req.body['username'],
    password: req.body['password'],
  })

  if (error) {
    res.send(error)
  } else {
    // get frontend to save the response (user session) as cookie in local storage
    res.send(data)

    /* example 
    
    {
    "user": {
        "id": "70ec82ac-8191-4df4-ae89-a0c860809dad",
        "aud": "authenticated",
        "role": "authenticated",
        "email": "huaizhi@gmail.com",
        "phone": "",
        "confirmation_sent_at": "2024-09-22T16:37:51.774764484Z",
        "app_metadata": {
            "provider": "email",
            "providers": [
                "email"
            ]
        },
        "user_metadata": {
            "email": "huaizhi@gmail.com",
            "email_verified": false,
            "phone_verified": false,
            "sub": "70ec82ac-8191-4df4-ae89-a0c860809dad"
        },
        "identities": [
            {
                "identity_id": "7ae97084-9625-4f7f-8934-faa7d11c02ed",
                "id": "70ec82ac-8191-4df4-ae89-a0c860809dad",
                "user_id": "70ec82ac-8191-4df4-ae89-a0c860809dad",
                "identity_data": {
                    "email": "huaizhi@gmail.com",
                    "email_verified": false,
                    "phone_verified": false,
                    "sub": "70ec82ac-8191-4df4-ae89-a0c860809dad"
                },
                "provider": "email",
                "last_sign_in_at": "2024-09-22T16:37:51.767290686Z",
                "created_at": "2024-09-22T16:37:51.76734Z",
                "updated_at": "2024-09-22T16:37:51.76734Z",
                "email": "huaizhi@gmail.com"
            }
        ],
        "created_at": "2024-09-22T16:37:51.759156Z",
        "updated_at": "2024-09-22T16:37:55.034158Z",
        "is_anonymous": false
    },
    "session": null
}
    
    */
  }
})

router.post('/logout', async (req, res) => {
  let {error} = await supabase.auth.signOut()

  if (error) {
    res.send(error)
  } else {
    res.send('Log Out Successful!')
  }
})

module.exports = router
