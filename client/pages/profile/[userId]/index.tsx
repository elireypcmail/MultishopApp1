'use client'
import UserProfile   from "@c/Perfil - Cliente/Profile"
import { getCookie } from "@g/cookies"
import Navbar        from "@c/Navbar"
import Menu          from "@c/Menu"
import { getUser }   from '@api/Get'
import { requireAdminSession } from "@g/ssrGuards"
import { useCallback, useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "next/router"

export default function ClientProfile({ data } : any) {
  const router = useRouter();
  const {userId}=router.query
  const [user, setUser]=useState<{id:string}|undefined>(undefined);
  
  const getUserData=useCallback(async ()=>{
    if(userId){
      const result =await getUser(userId)
      setUser(result?.data?.data);
    }
  },[userId]);

  useEffect(()=>{
    getUserData();
  }, [getUserData])

  return(
    <>
      <div className='body'>
        <div className="container">
          {/* <div className="navbar">
            <Navbar data={data} />
          </div> */}
          <div className="menu">
            <Menu />
          </div>
          <div className='main'>
            { user?.id && <UserProfile data={user} /> }
          </div>
        </div>
      </div>
    </>
  )
}

