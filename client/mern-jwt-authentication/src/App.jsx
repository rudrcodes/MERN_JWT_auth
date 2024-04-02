import { useState } from 'react'
import './App.css'
import axios from 'axios'

const url = "http://localhost:3001"

function App() {
  const [userDetails, setUserDetails] = useState({
    username: "",
    password: ""
  })

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      //make POST req to backend
      const res = await axios.post(url + "/login", userDetails)

      // frontend pr hi set ho paegi localstorage, backend mein set krne ke liye packages use krne pdenge

      console.log("res: ", res.headers);
      localStorage.setItem("jwt_token", res.data.JWTtoken);
      console.log("Login req made.")

    } catch (err) {
      console.log(err)
    }
    // console.log(userDetails)
  }

  const setTokenFunc = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(url + "/setToken")
      // const res = await axios.get(url + "/setToken")
      localStorage.setItem("jwt_token2", res.data);
      console.log(res)
    } catch (error) {
      console.log(error)
    }

  }



  return (
    <div >
      <form type='submit' onSubmit={handleSubmit} className='form_class'>
        <input placeholder='enter username' value={userDetails.username} type='text' onChange={(e) => setUserDetails({ ...userDetails, username: e.target.value })} />

        <input placeholder='enter password' value={userDetails.password} type='text' onChange={(e) => setUserDetails({ ...userDetails, password: e.target.value })} />

        <button>Submit</button>
      </form>

      <button onClick={setTokenFunc}>SetToken</button>
    </div>
  )
}

export default App
